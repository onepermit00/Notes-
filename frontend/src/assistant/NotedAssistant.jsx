import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Check, ChevronRight, Mic, Pencil, Phone, Sparkles, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/authApi';
import {
  ASSISTANT_DEFAULT_NAME, PLACES, TASK_NAMES, answer, fromAI, nextQuestion, nudges, ready, skip, startFlow, understand,
} from './engine';

/* The Noted assistant: a drawer that opens over any desk screen.
   It understands a request in plain words (typed or spoken), asks what's missing one question at a time,
   and shows a Ready to save card. Nothing is saved until Save is tapped, and it is saved through the same
   handlers as the app's own forms (passed in as `actions`), so entries land in the same report.
   See engine.js for what it understands; only what that can't work out goes to the server's AI. */

const NAME_KEY = 'noted-assistant-name';
const FOLLOWED_KEY = 'noted-assistant-followed';
const readStore = (key, fallback) => { try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } };
const writeStore = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage is optional */ } };

const SUGGEST = {
  concierge: [
    ['Log a package', '“2 UPS boxes for 4B.”', 'Log a package'],
    ['Sign in a visitor or vendor', '“Guest John Smith here to see 312.”', 'Sign in a guest'],
    ['Report an incident', '“Noise complaint about 715.” I’ll ask the rest.', 'Report an incident'],
    ['Ask about the shift', '“What’s open?” “What did the last shift leave?”', 'What’s open?'],
    ['Get the handoff ready', 'I’ll pull together what’s still open.', 'Draft my handoff'],
  ],
  manager: [
    ['Send a request to the desk', '“Ask Casey to walk the garage by 3 pm.”', 'Send a request to the desk'],
    ['See what’s open', 'Requests still waiting at the desk.', 'What’s open?'],
    ['See who’s on shift', 'Who is clocked in right now.', 'Who is on shift?'],
    ['Find a resident', '“Who lives in 312?”', 'Find a resident'],
    ['Message the team', '“Tell the team the pool is closed until noon.”', 'Message the team'],
  ],
};
const KIND_TAG = { resident: 'Resident', request: 'Request', incident: 'Incident', entry: 'Today’s report', teammate: 'Team' };
const KIND_PLACE = { concierge: { request: 'requests', incident: 'incident', entry: 'home' }, manager: { request: 'tasks', incident: 'home', resident: 'residents', teammate: 'team' } };
const tel = phone => `tel:${String(phone || '').replace(/[^\d+]/g, '')}`;

export function NotedAssistant({
  isOpen, onClose, role = 'concierge', user, propertyName = '', isPhone = false, shiftActive = true,
  requests = [], incidents = [], todayLog = [], team = [], handoff = null, followUps = [], shiftStartMs = 0,
  actions = {},
}) {
  const { colors, isDarkMode } = useTheme();
  const { BG, CARD, CARD2, BORDER, TEXT, MUTED, SHADOW, INTER, ACCENT, GREEN, RED } = colors;
  const who = role === 'manager' ? 'manager' : 'concierge';

  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(() => readStore(NAME_KEY, '') || ASSISTANT_DEFAULT_NAME);
  const [residents, setResidents] = useState([]);
  const [jobs, setJobs] = useState({});        // Ready to save cards and sets of taps, by number
  const flow = useRef(null);
  const counter = useRef(0);
  const recog = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const greeted = useRef(false);

  useEffect(() => { if (isOpen) authApi.getResidents().then(setResidents).catch(() => {}); }, [isOpen]);

  const ctx = useMemo(() => ({
    role: who, residents, requests, incidents, todayLog, team, handoff, followUps, shiftStartMs,
    followedUp: readStore(FOLLOWED_KEY, []),
  }), [who, residents, requests, incidents, todayLog, team, handoff, followUps, shiftStartMs]);
  const ctxRef = useRef(ctx); ctxRef.current = ctx;

  const keep = useCallback(job => { const n = ++counter.current; setJobs(j => ({ ...j, [n]: job })); return n; }, []);
  const say = useCallback((text, cards = []) => setLog(l => [...l, { who: 'ai', text, cards }]), []);
  const taps = useCallback(buttons => (buttons && buttons.length ? [{ type: 'taps', n: keep({ used: false }), buttons }] : []), [keep]);

  // Said first, like a colleague would: what's late, what the last shift left, and incidents to check back on.
  useEffect(() => {
    if (!isOpen || greeted.current) return;
    const list = nudges({ ...ctxRef.current, now: new Date() });
    if (!list.length) return;
    greeted.current = true;
    setLog(l => (l.length ? l : list.map(n => ({ who: 'ai', text: n.text, cards: n.taps ? [{ type: 'taps', n: keep({ used: false }), buttons: n.taps }] : [] }))));
  }, [isOpen, requests, incidents, handoff, keep]);

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [log, busy]);
  useEffect(() => { if (isOpen && !isPhone) setTimeout(() => inputRef.current?.focus(), 250); }, [isOpen, isPhone]);
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isOpen, onClose]);

  const stopMic = useCallback(() => { try { recog.current?.stop(); } catch { /* already stopped */ } recog.current = null; setListening(false); }, []);
  useEffect(() => { if (!isOpen) stopMic(); }, [isOpen, stopMic]);

  /* ---- Guided entries ---- */
  const advance = useCallback((lead = '') => {
    const fl = flow.current; if (!fl) return;
    const said = [fl.lead, lead].filter(Boolean).join(' '); fl.lead = '';
    const next = nextQuestion(fl, ctxRef.current);
    if (next) { fl.q = next.q.key; fl.step = 'q'; say(`${said ? said + ' ' : ''}${next.text}`, taps(next.taps)); return; }
    fl.step = 'ready'; fl.q = '';
    const card = ready(fl, ctxRef.current);
    if (!card) { flow.current = null; say('I couldn’t get that ready. Try the form in the menu instead.'); return; }
    say(`${said ? said + ' ' : ''}${card.intro}`, [{ type: 'ready', n: keep({ state: 'ready', card, flow: fl }) }]);
  }, [say, taps, keep]);

  const begin = useCallback((type, fields) => {
    if (who === 'concierge' && !shiftActive && type !== 'message' && type !== 'task') {
      say('Start your shift first, so this lands on today’s report. Then tell me again and I’ll log it.');
      return;
    }
    flow.current = startFlow(type, fields, ctxRef.current);
    advance();
  }, [who, shiftActive, say, advance]);

  const showPlace = useCallback((open, text) => {
    const place = PLACES[who][open];
    if (!place) { say(text || 'I’m not sure where that is. Try asking in other words.'); return; }
    say(text || 'Here it is.', [{ type: 'place', open }]);
  }, [who, say]);

  const act = useCallback(result => {
    if (!result) return false;
    if (result.kind === 'emergency') { say(result.say || 'Call 911 now. Then follow these steps.', [{ type: 'emergency', protocol: result.protocol }]); return true; }
    if (result.kind === 'protocol') { say('Here are the standard steps. If your property’s SOPs say something different, follow those.', [{ type: 'protocol', protocol: result.protocol }]); return true; }
    if (result.kind === 'start') { begin(result.type, result.fields); return true; }
    if (result.kind === 'find') { say(result.say || (result.things.length === 1 ? 'Here it is.' : 'I found these.'), result.things.map(t => ({ type: 'thing', t }))); return true; }
    if (result.kind === 'open') { showPlace(result.open, result.say); return true; }
    if (result.kind === 'say') { say(result.say, [...(result.open && PLACES[who][result.open] ? [{ type: 'place', open: result.open }] : []), ...taps(result.taps)]); return true; }
    return false;
  }, [say, begin, showPlace, taps, who]);

  const ask = useCallback(async raw => {
    const text = String(raw || '').trim();
    if (!text || busy) return;
    setInput('');
    setLog(l => [...l, { who: 'me', text }]);
    const fl = flow.current;
    if (fl) {
      if (/^(cancel|stop|never ?mind|no thanks|forget it|don.?t save|scrap (it|that))\b/i.test(text)) { flow.current = null; say('Okay, I stopped. Nothing was saved.'); return; }
      const aside = understand(text, ctxRef.current);
      if (aside && aside.kind === 'emergency') { act(aside); return; }
      if (fl.step === 'ready') {
        if (/^(yes|save( it)?|ok(ay)?|looks good|correct|that.?s right|done|send( it)?)[.! ]*$/i.test(text)) { say('Tap Save on the card above and I’ll save it.'); return; }
        flow.current = null; // they moved on; the card stays where it is and can still be saved
      } else {
        // A new job in the middle of an entry: finish or cancel this one first, so nothing is half-saved or mixed up.
        if (aside && aside.kind === 'start' && aside.type !== fl.type && /^(remind me|tell (the )?(team|manager|desk)|message (the )?(team|manager)|draft|log (a|an)\b|sign in|file (a|an)\b|report (a|an)\b)/i.test(text)) { advance(`Let’s finish ${TASK_NAMES[fl.type] || 'this one'} first. Say “cancel” to drop it.`); return; }
        // A side question in the middle of an entry gets its answer, then the entry picks up where it was.
        if (/\?\s*$|^(who|what|where|when|which|how|is|are|can|does|do)\b/i.test(text) && aside && ['find', 'say', 'open', 'protocol'].includes(aside.kind)) { act(aside); advance('Back to this one.'); return; }
        const problem = answer(fl, fl.q, text, ctxRef.current);
        if (problem) { const next = nextQuestion(fl, ctxRef.current); say(problem, taps(next ? next.taps : [])); return; }
        advance();
        return;
      }
    }
    if (act(understand(text, ctxRef.current))) return;

    setBusy(true);
    const history = [...log.filter(m => m.text).slice(-6).map(m => ({ role: m.who === 'me' ? 'user' : 'assistant', text: m.text })), { role: 'user', text }];
    const res = await authApi.askAssistant(history, name);
    setBusy(false);
    if (act(fromAI(res && res.answer, ctxRef.current))) return;
    say(
      res && res.reason === 'limit' ? 'That’s a lot of questions in one hour. Give me a few minutes, or use the menu in the meantime.'
        : 'I didn’t catch that. I can log packages, visitors, vendors and incidents, set reminders, find residents and requests, and open any section.',
      taps((SUGGEST[who] || []).slice(0, 3).map(([label, , sayText]) => [label, 'say:' + sayText])),
    );
  }, [busy, log, name, who, say, taps, act, advance]);

  /* ---- Saving, only ever from a tap on Save ---- */
  const save = useCallback(async n => {
    const job = jobs[n]; if (!job || job.state !== 'ready') return;
    setJobs(j => ({ ...j, [n]: { ...job, state: 'busy' } }));
    const s = job.card.save;
    try {
      if (s.do === 'activity') { await actions.logActivity?.(s.entry); if (s.notify) authApi.notifyPackage(s.notify); }
      else if (s.do === 'incident') { await actions.createIncident?.(s.form); }
      else if (s.do === 'request') { await actions.createRequest?.(s.form); }
      else if (s.do === 'followup') { await actions.addFollowUp?.(s.item); }
      else if (s.do === 'message') { await authApi.sendMessage(s.text); actions.messageSent?.(s.text); }
      else if (s.do === 'handoff') { await actions.openHandoff?.({ notes: s.notes, items: s.items }); }
      setJobs(j => ({ ...j, [n]: { ...job, state: 'done' } }));
      if (flow.current === job.flow) flow.current = null;
      if (s.do === 'handoff') { onClose(); return; }
      say(job.card.saved, PLACES[who][job.card.place] && job.card.place !== 'home' ? [{ type: 'place', open: job.card.place, done: true }] : []);
    } catch (err) {
      setJobs(j => ({ ...j, [n]: { ...job, state: 'ready' } }));
      say('That didn’t save. Check the connection and tap Save again. Nothing was lost.');
    }
  }, [jobs, actions, onClose, say, who]);

  const drop = useCallback(n => {
    setJobs(j => ({ ...j, [n]: { ...j[n], state: 'dropped' } }));
    if (flow.current === jobs[n]?.flow) flow.current = null;
    say('Okay, nothing was saved.');
  }, [jobs, say]);

  const change = useCallback(n => {
    const job = jobs[n]; if (!job) return;
    setJobs(j => ({ ...j, [n]: { ...job, state: 'dropped' } }));
    flow.current = { ...job.flow, done: {}, f: {}, lead: 'No problem, let’s go through it again.' };
    advance();
  }, [jobs, advance]);

  const tap = useCallback((action, set) => {
    if (set != null) setJobs(j => ({ ...j, [set]: { ...j[set], used: true } }));
    const [verb, rest = ''] = [action.slice(0, action.indexOf(':')), action.slice(action.indexOf(':') + 1)];
    const fl = flow.current;
    if (verb === 'say') { ask(rest); return; }
    if (verb === 'open') { actions.open?.(rest); onClose(); return; }
    if (verb === 'start') { begin(rest, {}); return; }
    if (verb === 'followup') {
      const [id, state] = rest.split('|'), inc = incidents.find(i => (i.incident_id || i.id) === id);
      writeStore(FOLLOWED_KEY, [...readStore(FOLLOWED_KEY, []), id].slice(-50));
      const label = inc ? `${inc.title || inc.type || 'Incident'}${inc.location ? ` · ${inc.location}` : ''}` : 'Incident';
      setLog(l => [...l, { who: 'me', text: state === 'settled' ? 'Yes, it’s settled' : 'Still going on' }]);
      if (state === 'settled') begin('log', { what: `Incident follow-up · settled · ${label}`.slice(0, 200), category: 'Safety / Security' });
      else say('Understood. If it’s getting worse, call your manager, or 911 if anyone is in danger. Want to add an update to today’s report?', taps([['Add an update', 'say:log incident update: ' + label], ['Not now', 'say:never mind']]));
      return;
    }
    if (!fl || fl.step !== 'q') return;
    if (verb === 'skip') { const label = (nextQuestion(fl, ctxRef.current)?.taps.find(t => t[1] === action) || [])[0]; if (label) setLog(l => [...l, { who: 'me', text: label }]); skip(fl, rest); advance(); return; }
    if (verb === 'set') {
      const [key, value] = [rest.slice(0, rest.indexOf('|')), rest.slice(rest.indexOf('|') + 1)];
      const label = (nextQuestion(fl, ctxRef.current)?.taps.find(t => t[1] === action) || [])[0] || value;
      setLog(l => [...l, { who: 'me', text: label }]);
      const problem = answer(fl, key, value, ctxRef.current);
      if (problem) { say(problem); return; }
      advance();
    }
  }, [ask, actions, onClose, begin, incidents, say, taps, advance]);

  const toggleMic = useCallback(() => {
    if (listening) { stopMic(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { inputRef.current?.focus(); say('This browser can’t listen. Tap the microphone on your keyboard to talk instead.'); return; }
    const r = new SR(); let said = '';
    r.lang = navigator.language || 'en-US'; r.interimResults = true; r.continuous = false;
    r.onresult = e => { said = [...e.results].map(x => x[0].transcript).join(' '); setInput(said); };
    r.onend = () => { recog.current = null; setListening(false); if (said.trim()) ask(said); };
    r.onerror = () => { recog.current = null; setListening(false); };
    recog.current = r; setListening(true);
    try { r.start(); } catch { setListening(false); }
  }, [listening, stopMic, say, ask]);

  const saveName = value => { const v = String(value || '').trim().slice(0, 24); setName(v || ASSISTANT_DEFAULT_NAME); writeStore(NAME_KEY, v); setRenaming(false); };

  /* ---- Pieces ---- */
  const first = String(user?.name || '').trim().split(/\s+/)[0] || '';
  const box = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 16, boxShadow: SHADOW };
  const tag = { fontFamily: INTER, fontSize: 9, fontWeight: 800, color: ACCENT, letterSpacing: '.16em', textTransform: 'uppercase' };
  const dark = { minHeight: 42, padding: '0 18px', borderRadius: 999, border: 'none', background: ACCENT, color: '#fff', fontFamily: INTER, fontSize: 13, fontWeight: 750, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' };
  const light = { ...dark, background: CARD2, color: TEXT, border: `1px solid ${BORDER}` };
  const btnRow = { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 };

  const renderCard = (c, key) => {
    if (c.type === 'taps') {
      const used = jobs[c.n]?.used;
      return <div key={key} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {c.buttons.map(([label, action, strong]) => <button key={action} type="button" disabled={used} onClick={() => tap(action, c.n)} data-testid="assistant-tap"
          style={{ minHeight: 38, padding: '0 15px', borderRadius: 999, fontFamily: INTER, fontSize: 13, fontWeight: 650, cursor: used ? 'default' : 'pointer', opacity: used ? 0.45 : 1, border: `1px solid ${strong ? ACCENT : BORDER}`, background: strong ? ACCENT : CARD, color: strong ? '#fff' : TEXT }}>{label}</button>)}
      </div>;
    }
    if (c.type === 'thing') {
      const t = c.t, place = (KIND_PLACE[who] || {})[t.kind];
      const lines = t.kind === 'resident' ? [`Unit ${t.unit}`, t.phone || 'No phone number saved', t.note] : t.detail || [];
      return <div key={key} style={box} data-testid="assistant-thing">
        <div style={tag}>{KIND_TAG[t.kind] || 'Record'}</div>
        <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: '-.015em', margin: '6px 0 4px' }}>{t.name}</div>
        {lines.filter(Boolean).map((x, i) => <div key={i} style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{x}</div>)}
        {(t.phone || place) && <div style={btnRow}>
          {t.phone && <a href={tel(t.phone)} style={dark}><Phone size={14} /> Call</a>}
          {place && PLACES[who][place] && <button type="button" style={t.phone ? light : dark} onClick={() => { actions.open?.(place); onClose(); }}>Open {PLACES[who][place][0]}</button>}
        </div>}
      </div>;
    }
    if (c.type === 'place') {
      const [title, sub] = PLACES[who][c.open] || [];
      if (!title) return null;
      return <button key={key} type="button" onClick={() => { actions.open?.(c.open); onClose(); }} data-testid="assistant-place"
        style={{ ...box, width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: c.done ? '12px 16px' : 16 }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: INTER, fontSize: c.done ? 13 : 15, fontWeight: 800, color: TEXT, letterSpacing: '-.01em' }}>{c.done ? `Open ${title}` : title}</span>
          {!c.done && <span style={{ display: 'block', fontFamily: INTER, fontSize: 12.5, color: MUTED, marginTop: 3, lineHeight: 1.45 }}>{sub}</span>}
        </span>
        <span style={{ width: 34, height: 34, borderRadius: 999, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ChevronRight size={17} color="#fff" /></span>
      </button>;
    }
    if (c.type === 'ready') {
      const job = jobs[c.n]; if (!job) return null;
      const card = job.card, state = { ready: 'Ready to save', busy: 'Saving…', done: 'Saved', dropped: 'Not saved' }[job.state];
      return <div key={key} data-testid="assistant-ready" style={{ ...box, borderColor: job.state === 'ready' ? ACCENT : BORDER, opacity: job.state === 'dropped' ? 0.55 : 1 }}>
        <div style={{ ...tag, color: job.state === 'done' ? GREEN : job.state === 'dropped' ? MUTED : ACCENT }}>{card.tag} · {state}</div>
        <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: '-.015em', margin: '6px 0 10px', overflowWrap: 'anywhere' }}>{card.title}</div>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'minmax(84px,auto) 1fr', gap: '6px 14px' }}>
          {card.rows.filter(([, v]) => v).map(([k, v]) => <React.Fragment key={k}>
            <dt style={{ fontFamily: INTER, fontSize: 12, fontWeight: 650, color: MUTED }}>{k}</dt>
            <dd style={{ margin: 0, fontFamily: INTER, fontSize: 13, color: TEXT, lineHeight: 1.45, overflowWrap: 'anywhere' }}>{v}</dd>
          </React.Fragment>)}
        </dl>
        {job.state === 'ready' && <>
          <div style={btnRow}>
            <button type="button" style={dark} onClick={() => save(c.n)} data-testid="assistant-save">{card.saveLabel || 'Save'}</button>
            <button type="button" style={light} onClick={() => change(c.n)}>Change</button>
          </div>
          <button type="button" onClick={() => drop(c.n)} style={{ marginTop: 10, padding: 0, border: 'none', background: 'none', fontFamily: INTER, fontSize: 12.5, fontWeight: 600, color: MUTED, textDecoration: 'underline', cursor: 'pointer' }}>Don’t save</button>
        </>}
        {job.state === 'done' && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontFamily: INTER, fontSize: 12.5, fontWeight: 700, color: GREEN }}><Check size={14} /> {card.save.do === 'message' ? 'Sent to the team' : 'On the property record'}</div>}
      </div>;
    }
    if (c.type === 'emergency' || c.type === 'protocol') {
      const p = c.protocol, urgent = c.type === 'emergency';
      return <div key={key} data-testid={urgent ? 'assistant-emergency' : 'assistant-protocol'} style={{ ...box, borderColor: urgent ? RED : BORDER }}>
        {urgent && <a href="tel:911" style={{ ...dark, background: RED, width: '100%', minHeight: 50, fontSize: 16, marginBottom: 14, boxSizing: 'border-box' }}><Phone size={17} /> Call 911</a>}
        <div style={{ ...tag, color: urgent ? RED : ACCENT }}>{p.title}</div>
        <ol style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 9 }}>
          {p.steps.map((step, i) => <li key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 8, fontFamily: INTER, fontSize: 13.5, color: TEXT, lineHeight: 1.5 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '.06em', paddingTop: 3 }}>{String(i + 1).padStart(2, '0')}</span><span>{step}</span>
          </li>)}
        </ol>
        <div style={btnRow}>
          {who === 'concierge' && p.incident && <button type="button" style={urgent ? light : dark} onClick={() => begin('incident', { incident_type: p.incident })}>{urgent ? 'Start the report when it’s safe' : 'Start an incident report'}</button>}
          {who === 'concierge' && <button type="button" style={light} onClick={() => { actions.open?.(urgent ? 'contacts' : 'sops'); onClose(); }}>{urgent ? 'Emergency contacts' : 'Property SOPs'}</button>}
        </div>
      </div>;
    }
    return null;
  };

  const empty = !log.length;
  return (
    <AnimatePresence>
      {isOpen && <>
        <motion.div key="assistant-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />
        <motion.aside key="assistant" role="dialog" aria-modal="true" aria-label={name} data-testid="assistant-panel"
          initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 34, stiffness: 320 }}
          style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 111, width: isPhone ? '100%' : 'min(480px, 100vw)', background: BG, borderLeft: isPhone ? 'none' : `1px solid ${BORDER}`, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', fontFamily: INTER }}>

          <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, padding: isPhone ? '20px 20px 16px' : '26px 28px 18px', borderBottom: `1px solid ${BORDER}`, background: CARD, flexShrink: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span style={{ width: 24, height: 2, background: ACCENT }} /><span style={{ ...tag, letterSpacing: '.22em' }}>{propertyName || 'Noted'}</span></div>
              {renaming
                ? <form onSubmit={e => { e.preventDefault(); saveName(e.target.elements.n.value); }} style={{ display: 'flex', gap: 8 }}>
                    <input name="n" autoFocus defaultValue={name === ASSISTANT_DEFAULT_NAME ? '' : name} maxLength={24} placeholder={ASSISTANT_DEFAULT_NAME} aria-label="Assistant name"
                      style={{ flex: 1, minWidth: 0, height: 40, padding: '0 12px', borderRadius: 12, border: `1.5px solid ${ACCENT}`, background: CARD2, color: TEXT, fontFamily: INTER, fontSize: 15, fontWeight: 700, outline: 'none' }} />
                    <button type="submit" style={{ ...dark, minHeight: 40 }}>Save</button>
                  </form>
                : <button type="button" onClick={() => setRenaming(true)} title="Rename your assistant" aria-label={`Rename ${name}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, padding: 0, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <h2 style={{ fontFamily: INTER, fontSize: isPhone ? 26 : 30, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>{name}</h2>
                    <Pencil size={14} color={MUTED} />
                  </button>}
            </div>
            <button type="button" onClick={onClose} aria-label="Close assistant" data-testid="assistant-close"
              style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${BORDER}`, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={19} color={TEXT} strokeWidth={2} /></button>
          </header>

          <div ref={bodyRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: isPhone ? '18px 18px 8px' : '22px 26px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {empty && <>
              <h3 style={{ fontFamily: INTER, fontSize: 21, fontWeight: 800, color: TEXT, letterSpacing: '-.03em', margin: '4px 0 0' }}>{first ? `Hi ${first}.` : 'Hi.'} What do you need?</h3>
              <p style={{ fontFamily: INTER, fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>
                {who === 'manager'
                  ? 'Tell me in your own words, or talk. I can send requests to the desk, find residents, requests and incidents, and take you to any section. You check it and tap Save.'
                  : 'Tell me in your own words, or talk. I can log packages, visitors, vendors and incidents, set reminders, find residents and requests, and get your handoff ready. You check it and tap Save.'}
              </p>
              <ol style={{ listStyle: 'none', margin: '6px 0 0', padding: 0, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden', background: CARD }}>
                {(SUGGEST[who] || []).map(([title, hint, sayText], i) => <li key={title} style={{ borderTop: i ? `1px solid ${BORDER}` : 'none' }}>
                  <button type="button" onClick={() => ask(sayText)} data-testid="assistant-suggestion"
                    style={{ width: '100%', display: 'grid', gridTemplateColumns: '30px 1fr 18px', alignItems: 'center', gap: 10, padding: '13px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '.08em' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span><span style={{ display: 'block', fontFamily: INTER, fontSize: 14, fontWeight: 750, color: TEXT }}>{title}</span><span style={{ display: 'block', fontFamily: INTER, fontSize: 12.5, color: MUTED, marginTop: 2 }}>{hint}</span></span>
                    <ChevronRight size={16} color={MUTED} />
                  </button>
                </li>)}
              </ol>
              <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, lineHeight: 1.55, margin: '4px 0 0' }}>Your property’s SOPs and your manager come first. In an emergency, call 911.</p>
            </>}

            {log.map((m, i) => m.who === 'me'
              ? <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '84%', background: isDarkMode ? '#2A2A2A' : '#222222', color: '#fff', padding: '10px 15px', borderRadius: '18px 18px 6px 18px', fontFamily: INTER, fontSize: 14, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{m.text}</div>
              : <div key={i} style={{ display: 'grid', gap: 10, maxWidth: '94%' }} data-testid="assistant-reply">
                  {m.text && <p style={{ fontFamily: INTER, fontSize: 14.5, color: TEXT, lineHeight: 1.6, margin: 0 }}>{m.text}</p>}
                  {(m.cards || []).map((c, k) => renderCard(c, k))}
                </div>)}
            {busy && <div aria-label="Thinking" style={{ display: 'flex', gap: 5, padding: '6px 0' }}>{[0, 1, 2].map(d => <motion.span key={d} animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }} style={{ width: 7, height: 7, borderRadius: 99, background: MUTED }} />)}</div>}
            <div style={{ height: 6, flexShrink: 0 }} />
          </div>

          <form onSubmit={e => { e.preventDefault(); ask(input); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: isPhone ? '12px 16px calc(14px + env(safe-area-inset-bottom))' : '14px 24px 20px', borderTop: `1px solid ${BORDER}`, background: CARD, flexShrink: 0 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} maxLength={600} autoComplete="off" enterKeyHint="send" data-testid="assistant-input"
              placeholder={listening ? 'Listening…' : flow.current && flow.current.step === 'q' ? 'Type your answer' : 'Message'} aria-label={`Message ${name}`}
              style={{ flex: 1, minWidth: 0, height: 48, padding: '0 18px', borderRadius: 999, border: `1.5px solid ${BORDER}`, background: CARD2, color: TEXT, fontFamily: INTER, fontSize: 15, outline: 'none' }} />
            {input.trim()
              ? <button type="submit" aria-label="Send" data-testid="assistant-send" disabled={busy} style={{ width: 48, height: 48, borderRadius: 999, border: 'none', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: busy ? 0.5 : 1 }}><ArrowUp size={20} color="#fff" strokeWidth={2.4} /></button>
              : <button type="button" onClick={toggleMic} aria-label={listening ? 'Stop listening' : 'Talk'} style={{ width: 48, height: 48, borderRadius: 999, border: `1px solid ${listening ? RED : BORDER}`, background: listening ? `${RED}14` : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Mic size={19} color={listening ? RED : TEXT} /></button>}
          </form>
        </motion.aside>
      </>}
    </AnimatePresence>
  );
}

/* The round button that opens the assistant, bottom right of every desk screen. */
export function AssistantButton({ onClick, isPhone = false, lifted = false, label = ASSISTANT_DEFAULT_NAME }) {
  const { colors } = useTheme();
  return (
    <button type="button" onClick={onClick} aria-label={`Open ${label}`} title={label} data-testid="assistant-fab"
      style={{ position: 'fixed', right: isPhone ? 16 : 28, bottom: (isPhone ? 16 : 28) + (lifted ? 64 : 0), zIndex: 58, width: 56, height: 56, borderRadius: 999, border: 'none', background: '#222222', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.24)' }}>
      <Sparkles size={22} color={colors.ACCENT} strokeWidth={2.1} />
    </button>
  );
}

export default NotedAssistant;
