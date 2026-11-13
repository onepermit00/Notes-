import React, { useEffect, useRef, useState } from 'react';
import {
  Plus, CalendarClock, Check, Clock, X, Users, Pencil, Pause, Play, Trash2,
  ClipboardList, Shield, Package, Waves, Wrench, HelpCircle, AlertTriangle, CheckCircle, ChevronDown,
} from 'lucide-react';
import { authApi } from '../../services/authApi';
import { useTheme } from '../../context/ThemeContext';
import { DashboardEyebrow, DashboardStatusBadge } from '../dashboard';
import { DASHBOARD_ACCENT, DASHBOARD_DANGER, DASHBOARD_FONT, DASHBOARD_SUCCESS, DASHBOARD_WARNING } from '../dashboard/tokens';
import {
  REPEATS, WEEKDAYS, addMonths, dateText, dayKey, dueText, hasEnded, lastAllowedDay, nextDue, repeatOf, repeatText, shiftDay,
} from '../../lib/plannedTasks';

const BLUE = DASHBOARD_ACCENT, RED = DASHBOARD_DANGER, GREEN = DASHBOARD_SUCCESS, ORANGE = DASHBOARD_WARNING, INTER = DASHBOARD_FONT;

const CATEGORIES = [
  { id: 'Administrative',    Icon: ClipboardList },
  { id: 'Safety / Security', Icon: Shield },
  { id: 'Delivery',          Icon: Package },
  { id: 'Amenity',           Icon: Waves },
  { id: 'Maintenance',       Icon: Wrench },
  { id: 'Other',             Icon: HelpCircle },
];
const catIcon = id => (CATEGORIES.find(c => c.id === id) || CATEGORIES[0]).Icon;
const PRIORITIES = ['Low', 'Standard', 'High', 'Urgent'];
const PRIORITY_COLOR = { Urgent: RED, High: ORANGE, Standard: BLUE, Low: '#717171' };
const STEPS = ['Who', 'What', 'When'];

// The desk schedules for whoever is on duty, usually once (a booking, a visit);
// a manager usually plans recurring work for one team member.
const blankForm = (desk = false, day = '') => {
  const first = day || (desk ? shiftDay(dayKey(), 1) : dayKey());
  return {
    title: '', notes: '', category: desk ? 'Other' : 'Administrative', priority: 'Standard',
    assignedConciergeId: desk ? 'everyone' : '', assignedConciergeName: '',
    repeat: desk || day ? 'once' : 'daily', daysOfWeek: [0, 1, 2, 3, 4], startDate: first, scheduledTime: '09:00', endTime: '',
    noEnd: false, endDate: addMonths(first, 3), active: true,
  };
};

const formFromPlan = p => ({
  title: p.title || '', notes: p.notes || '', category: p.category || 'Administrative', priority: p.priority || 'Standard',
  assignedConciergeId: p.assigned_concierge_id || p.assigned_to_id || 'everyone', assignedConciergeName: p.assigned_concierge_name || p.assigned_to || '',
  repeat: repeatOf(p), daysOfWeek: Array.isArray(p.days_of_week) && p.days_of_week.length ? p.days_of_week : [0, 1, 2, 3, 4],
  startDate: p.start_date || dayKey(), scheduledTime: p.scheduled_time || `${String(p.scheduled_hour ?? 8).padStart(2, '0')}:00`, endTime: p.end_time || '',
  noEnd: !p.end_date && repeatOf(p) !== 'once', endDate: p.end_date || addMonths(p.start_date || dayKey(), 3), active: p.active !== false,
});

const planFromForm = f => ({
  title: f.title.trim(), notes: f.notes.trim(), category: f.category, priority: f.priority,
  assigned_concierge_id: f.assignedConciergeId, assigned_concierge_name: f.assignedConciergeName,
  assigned_to_id: f.assignedConciergeId, assigned_to: f.assignedConciergeName,
  repeat: f.repeat, days_of_week: f.repeat === 'days' ? [...f.daysOfWeek].sort() : [0, 1, 2, 3, 4, 5, 6],
  start_date: f.startDate, end_date: f.repeat === 'once' || f.noEnd ? null : f.endDate,
  scheduled_time: f.scheduledTime, end_time: f.endTime || '', scheduled_hour: Number((f.scheduledTime || '08:00').split(':')[0]),
  shift_window: 'all', recurrence: 'daily', active: f.active,
});

function formProblem(f, step) {
  if (step >= 1 && !f.assignedConciergeId && f.assignedConciergeId !== 'everyone') return 'Pick who this task is for.';
  if (step >= 2 && !f.title.trim()) return 'Give the task a name.';
  if (step >= 3) {
    if (!f.startDate) return 'Pick the day it starts.';
    if (!f.scheduledTime) return 'Pick a time.';
    if (f.endTime && f.endTime <= f.scheduledTime) return 'The end time must be after the start time.';
    if (f.repeat === 'days' && !f.daysOfWeek.length) return 'Pick the days it repeats.';
    if (f.repeat !== 'once' && !f.noEnd) {
      if (!f.endDate || f.endDate < f.startDate) return 'The end date must be on or after the start date.';
      if (f.endDate > lastAllowedDay()) return 'A scheduled task can run up to 5 years ahead.';
    }
  }
  return '';
}

/* desk: the concierge's own scheduling (for whoever is on duty that day).
   openWith: { date } opens the form for that day, e.g. from a calendar day.
   onChanged: called after anything is saved or removed, so a calendar can refresh. */
export function PlannedTasksPage({ team = [], isMobile = false, desk = false, openWith = null, onChanged = () => {} }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED } = colors;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(null);       // null = list view
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [openHistory, setOpenHistory] = useState(null);

  const members = team.filter(m => m.concierge_id && m.status !== 'invited');
  const today = dayKey();
  const firstStep = desk ? 2 : 1;           // the desk does not pick a person
  const stepNames = STEPS.slice(firstStep - 1);
  const forText = name => name || (desk ? 'whoever is on duty' : 'everyone on the team');

  useEffect(() => {
    authApi.getScheduledTasks()
      .then(list => { setPlans(list); setLoading(false); })
      .catch(() => { setLoadError('Scheduled tasks could not be loaded.'); setLoading(false); });
  }, []);

  const say = text => { setNotice(text); window.setTimeout(() => setNotice(''), 5000); };
  const set = patch => setForm(f => ({ ...f, ...patch }));
  const close = () => { setForm(null); setEditingId(null); setStep(firstStep); setError(''); };
  const start = (plan = null, day = '') => { setForm(plan ? formFromPlan(plan) : blankForm(desk, day)); setEditingId(plan ? plan.scheduled_task_id : null); setStep(firstStep); setError(''); };
  useEffect(() => { if (openWith?.date) start(null, openWith.date); }, [openWith]); // eslint-disable-line react-hooks/exhaustive-deps
  // Opening the form from further down the page: bring its top into view.
  const formRef = useRef(null);
  const formOpen = !!form;
  useEffect(() => { if (formOpen && formRef.current) formRef.current.scrollIntoView({ block: 'start' }); }, [formOpen, step]);

  const save = async () => {
    const problem = formProblem(form, 3);
    if (problem) { setError(problem); return; }
    setSaving(true); setError('');
    const body = planFromForm({ ...form, assignedConciergeId: form.assignedConciergeId === 'everyone' ? '' : form.assignedConciergeId });
    try {
      if (editingId) {
        const saved = await authApi.updateScheduledTask(editingId, { ...body, clear_end_date: body.end_date === null });
        setPlans(p => p.map(x => x.scheduled_task_id === editingId ? saved : x));
        say('Scheduled task updated.');
      } else {
        const saved = await authApi.createPlannedTask(body);
        setPlans(p => [saved, ...p]);
        say(`Scheduled for ${forText(form.assignedConciergeName)}: ${repeatText(saved)}.`);
      }
      close();
      onChanged();
    } catch (e) {
      setError(e?.response?.data?.detail && typeof e.response.data.detail === 'string' ? e.response.data.detail : 'The task could not be saved. Check the details and try again.');
    } finally { setSaving(false); }
  };

  const togglePause = async plan => {
    try {
      const saved = await authApi.updateScheduledTask(plan.scheduled_task_id, { active: plan.active === false });
      setPlans(p => p.map(x => x.scheduled_task_id === plan.scheduled_task_id ? saved : x));
      onChanged();
      say(saved.active ? `${plan.title} is back on the schedule.` : `${plan.title} is paused. It won't show on the desk until you resume it.`);
    } catch { say('That change could not be saved. Try again.'); }
  };

  const remove = async plan => {
    try {
      await authApi.deleteScheduledTask(plan.scheduled_task_id);
      setPlans(p => p.filter(x => x.scheduled_task_id !== plan.scheduled_task_id));
      setConfirmRemove(null);
      onChanged();
      say(`${plan.title} removed. What was already done stays in the shift reports.`);
    } catch { say('The task could not be removed. Try again.'); }
  };

  const input = { width: '100%', minHeight: 48, padding: '12px 14px', background: CARD2, border: `1.5px solid ${BORDER}`, borderRadius: 12, color: TEXT, outline: 'none', fontSize: 15, fontFamily: INTER, boxSizing: 'border-box' };
  const label = { display: 'block', fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 8 };
  const chip = sel => ({ minHeight: 42, padding: '0 14px', borderRadius: 12, border: sel ? `1.5px solid ${BLUE}` : `1px solid ${BORDER}`, background: sel ? `${BLUE}0D` : CARD, color: sel ? BLUE : TEXT, fontFamily: INTER, fontSize: 13, fontWeight: 700, cursor: 'pointer' });
  const primaryBtn = disabled => ({ flex: 2, minHeight: 52, background: disabled ? CARD2 : BLUE, border: disabled ? `1px solid ${BORDER}` : 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: disabled ? MUTED : 'white', cursor: disabled ? 'not-allowed' : 'pointer' });
  const secondaryBtn = { flex: 1, minHeight: 52, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 600, color: TEXT, cursor: 'pointer' };
  const smallBtn = (color = TEXT, tint = CARD2) => ({ minHeight: 34, padding: '0 12px', background: tint, border: `1px solid ${color === TEXT ? BORDER : `${color}40`}`, borderRadius: 9, fontFamily: INTER, fontSize: 12, fontWeight: 650, color, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 });

  /* ── Plan / edit ──────────────────────────────────────────────────────── */
  if (form) {
    const preview = planFromForm(form);
    const problem = formProblem(form, step);
    return (
      <div ref={formRef} style={{ fontFamily: INTER, maxWidth: 720, scrollMarginTop: 16 }}>
        <div style={{ paddingBottom: 14, borderBottom: `1px solid ${BORDER}`, marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: TEXT, margin: 0 }}>{editingId ? 'Edit scheduled task' : 'Schedule a task'}</h2>
              <p style={{ fontSize: 13, color: MUTED, margin: '2px 0 0' }}>Step {step - firstStep + 1} of {stepNames.length} · {STEPS[step - 1]}</p>
            </div>
            <button onClick={close} style={{ ...smallBtn(), minHeight: 40, padding: '0 16px', fontSize: 14 }}>Cancel</button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>{[1, 2, 3].filter(s => s >= firstStep).map(s => <div key={s} style={{ height: 4, flex: 1, borderRadius: 999, background: s <= step ? BLUE : 'rgba(0,0,0,0.10)' }} />)}</div>
        </div>

        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>Who is this task for?</h3>
            <p style={{ fontSize: 13, color: MUTED, margin: '0 0 18px' }}>It shows on their shift every day it's due, until it's done.</p>
            {members.length === 0 && <p style={{ padding: 16, background: CARD2, borderRadius: 12, fontSize: 13, color: MUTED }}>No one has joined your team yet. Once a team member accepts their invite, you can schedule tasks for them.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
              {members.map(m => {
                const sel = form.assignedConciergeId === m.concierge_id;
                return (
                  <button key={m.concierge_id} aria-pressed={sel} onClick={() => set({ assignedConciergeId: m.concierge_id, assignedConciergeName: m.name })}
                    style={{ padding: 14, borderRadius: 16, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: sel ? `${BLUE}08` : CARD, border: sel ? `2px solid ${BLUE}` : `2px solid ${BORDER}` }}>
                    <span style={{ width: 42, height: 42, borderRadius: '50%', background: sel ? BLUE : CARD2, color: sel ? 'white' : TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{m.init}</span>
                    <span style={{ minWidth: 0 }}><span style={{ display: 'block', fontWeight: 700, color: TEXT, fontSize: 15 }}>{m.name}</span><span style={{ display: 'block', fontSize: 12, color: MUTED, marginTop: 2 }}>{m.title}</span></span>
                    {sel && <Check size={18} color={BLUE} style={{ marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
            <button aria-pressed={form.assignedConciergeId === 'everyone'} onClick={() => set({ assignedConciergeId: 'everyone', assignedConciergeName: '' })}
              style={{ marginTop: 10, width: '100%', padding: 14, borderRadius: 16, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: form.assignedConciergeId === 'everyone' ? `${BLUE}08` : 'transparent', border: form.assignedConciergeId === 'everyone' ? `2px solid ${BLUE}` : `2px dashed ${BORDER}` }}>
              <span style={{ width: 42, height: 42, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} color={MUTED} /></span>
              <span><span style={{ display: 'block', fontWeight: 700, color: TEXT, fontSize: 14 }}>Everyone on the team</span><span style={{ display: 'block', fontSize: 12, color: MUTED, marginTop: 2 }}>Each team member gets their own copy on their shift</span></span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: TEXT, margin: 0 }}>What needs doing?</h3>
            {desk && <p style={{ fontSize: 13, color: MUTED, margin: '-10px 0 0', lineHeight: 1.5 }}>On that day it shows in To do for whoever is on duty. When it's done it goes into that shift's report; if it isn't, the report says it was not done.</p>}
            <div><label style={label} htmlFor="plan-title">Task</label>
              <input id="plan-title" value={form.title} onChange={e => set({ title: e.target.value })} placeholder={desk ? 'e.g. Elevator reserved for unit 804 move-in' : 'e.g. Test the fire panel, Walk the garage'} style={{ ...input, borderColor: form.title ? BLUE : BORDER }} /></div>
            <div><label style={label} htmlFor="plan-notes">Instructions <span style={{ color: MUTED, fontWeight: 500 }}>(optional)</span></label>
              <textarea id="plan-notes" rows={3} value={form.notes} onChange={e => set({ notes: e.target.value })} placeholder={desk ? 'Who, where, and what the desk should do' : 'What to check, where, and what to write down'} style={{ ...input, resize: 'none' }} /></div>
            <div><span style={label}>Type</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{CATEGORIES.map(c => <button key={c.id} aria-pressed={form.category === c.id} onClick={() => set({ category: c.id })} style={{ ...chip(form.category === c.id), display: 'inline-flex', alignItems: 'center', gap: 7 }}><c.Icon size={15} />{c.id}</button>)}</div></div>
            <div><span style={label}>Priority</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>{PRIORITIES.map(p => { const sel = form.priority === p; return <button key={p} aria-pressed={sel} onClick={() => set({ priority: p })} style={{ minHeight: 44, borderRadius: 12, fontFamily: INTER, fontSize: 13, fontWeight: 650, cursor: 'pointer', background: sel ? PRIORITY_COLOR[p] : CARD2, border: sel ? 'none' : `1px solid ${BORDER}`, color: sel ? 'white' : MUTED }}>{p}</button>; })}</div></div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: TEXT, margin: 0 }}>When should it happen?</h3>
            <div><span style={label}>Repeats</span>
              <div role="radiogroup" aria-label="Repeats" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{REPEATS.map(r => <button key={r.id} role="radio" aria-checked={form.repeat === r.id} onClick={() => set({ repeat: r.id })} style={chip(form.repeat === r.id)}>{r.label}</button>)}</div>
              {form.repeat === 'days' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginTop: 10 }}>
                  {WEEKDAYS.map((w, d) => { const sel = form.daysOfWeek.includes(d); return <button key={w} aria-pressed={sel} onClick={() => set({ daysOfWeek: sel ? form.daysOfWeek.filter(x => x !== d) : [...form.daysOfWeek, d].sort() })} style={{ minHeight: 40, borderRadius: 10, border: sel ? 'none' : `1px solid ${BORDER}`, background: sel ? BLUE : CARD2, color: sel ? 'white' : MUTED, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{w}</button>; })}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.3fr 1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}><label style={label} htmlFor="plan-start">{form.repeat === 'once' ? 'Day' : 'Starts'}</label><input id="plan-start" type="date" min={editingId ? undefined : dayKey()} value={form.startDate} onChange={e => set({ startDate: e.target.value })} style={input} /></div>
              <div><label style={label} htmlFor="plan-time">From</label><input id="plan-time" type="time" value={form.scheduledTime} onChange={e => set({ scheduledTime: e.target.value })} style={input} /></div>
              <div><label style={label} htmlFor="plan-end-time">To <span style={{ color: MUTED, fontWeight: 500 }}>(optional)</span></label><input id="plan-end-time" type="time" value={form.endTime} onChange={e => set({ endTime: e.target.value })} style={input} /></div>
            </div>
            {form.repeat !== 'once' && (
              <div><span style={label}>Ends</span>
                <div role="radiogroup" aria-label="Ends" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button role="radio" aria-checked={!form.noEnd} onClick={() => set({ noEnd: false })} style={chip(!form.noEnd)}>On a date</button>
                  <button role="radio" aria-checked={form.noEnd} onClick={() => set({ noEnd: true })} style={chip(form.noEnd)}>Keeps going until I remove it</button>
                </div>
                {!form.noEnd && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {[[1, '1 month'], [3, '3 months'], [6, '6 months'], [12, '1 year']].map(([m, text]) => { const key = addMonths(form.startDate || dayKey(), m); return <button key={m} onClick={() => set({ endDate: key })} style={{ ...chip(form.endDate === key), minHeight: 34, fontSize: 12 }}>{text}</button>; })}
                    </div>
                    <input aria-label="End date" type="date" min={form.startDate} max={lastAllowedDay()} value={form.endDate} onChange={e => set({ endDate: e.target.value })} style={{ ...input, maxWidth: 260 }} />
                    <p style={{ fontSize: 12, color: MUTED, margin: '6px 0 0' }}>Up to 5 years ahead.</p>
                  </div>
                )}
              </div>
            )}
            <div style={{ padding: 18, borderRadius: 16, background: CARD, border: `1px solid ${BORDER}` }}>
              <DashboardEyebrow>Summary</DashboardEyebrow>
              <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: '8px 0 4px' }}>{form.title || 'Untitled task'}</p>
              <p style={{ fontSize: 14, color: TEXT, margin: 0 }}>{repeatText(preview)}</p>
              <p style={{ fontSize: 13, color: MUTED, margin: '6px 0 0' }}>For {forText(form.assignedConciergeName)} · First one: {dueText(nextDue({ ...preview, active: true }, dayKey()) || form.startDate).toLowerCase()}</p>
              <p style={{ fontSize: 12, color: MUTED, margin: '10px 0 0', lineHeight: 1.5 }}>It shows on their shift each day it's due. When they mark it done, it goes into that shift's Daily Activity Report.</p>
            </div>
          </div>
        )}

        {error && <div role="alert" style={{ marginTop: 18, padding: '11px 13px', borderRadius: 10, background: `${RED}10`, border: `1px solid ${RED}30`, color: RED, fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, paddingTop: 22, borderTop: `1px solid ${BORDER}`, marginTop: 22 }}>
          <button onClick={() => (step > firstStep ? (setStep(step - 1), setError('')) : close())} style={secondaryBtn}>{step === firstStep ? 'Cancel' : 'Back'}</button>
          {step < 3
            ? <button onClick={() => (problem ? setError(problem) : (setStep(step + 1), setError('')))} aria-disabled={!!problem} style={primaryBtn(!!problem)}>Continue</button>
            : <button onClick={save} disabled={saving} style={primaryBtn(false)}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Schedule task'}</button>}
        </div>
      </div>
    );
  }

  /* ── List ─────────────────────────────────────────────────────────────── */
  const ended = plans.filter(p => hasEnded(p, today));
  const paused = plans.filter(p => p.active === false);
  const current = plans.filter(p => p.active !== false && !hasEnded(p, today))
    .sort((a, b) => (nextDue(a, today) || '').localeCompare(nextDue(b, today) || '') || (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));
  const groups = [
    { key: 'current', title: 'On the schedule', Icon: CalendarClock, color: BLUE, list: current },
    { key: 'paused', title: 'Paused', Icon: Pause, color: MUTED, list: paused },
    { key: 'ended', title: 'Finished', Icon: CheckCircle, color: GREEN, list: ended },
  ].filter(g => g.list.length);

  const statusOf = r => r.status === 'completed' ? ['Done', GREEN] : r.status === 'declined' ? ['Declined', RED] : r.status === 'in_progress' ? ['In progress', ORANGE] : r.date < today ? ['Not done', RED] : ['Waiting', MUTED];

  const PlanCard = ({ p }) => {
    const Icon = catIcon(p.category);
    const h = p.history || { done_count: 0, recent: [] };
    const todayRow = (h.recent || []).find(r => r.date === today);
    // Once today's is handled, the next one is the next day it is due.
    const next = todayRow && ['completed', 'declined'].includes(todayRow.status) ? nextDue(p, shiftDay(today, 1)) : nextDue(p, today);
    const isOff = p.active === false;
    return (
      <article data-testid="planned-task-row" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: isMobile ? 15 : 18, opacity: isOff ? 0.75 : 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px minmax(0,1fr)', gap: 13 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={19} color={isOff ? MUTED : BLUE} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <p style={{ fontWeight: 700, color: TEXT, fontSize: 15, margin: 0 }}>{p.title}</p>
              {todayRow && <DashboardStatusBadge color={statusOf(todayRow)[1]}>Today · {statusOf(todayRow)[0]}</DashboardStatusBadge>}
              {p.priority && ['High', 'Urgent'].includes(p.priority) && <DashboardStatusBadge color={PRIORITY_COLOR[p.priority]} dot={false}>{p.priority}</DashboardStatusBadge>}
            </div>
            <p style={{ fontSize: 13, color: TEXT, margin: '5px 0 0' }}>{repeatText(p)}</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,minmax(0,1fr))', gap: '9px 16px', marginTop: 12 }}>
              {[
                ['For', p.assigned_concierge_name || p.assigned_to || (desk ? 'Whoever is on duty' : 'Everyone on the team')],
                ['Next', isOff ? 'Paused' : next ? dueText(next, today) : 'Finished'],
                ['Done', h.done_count ? `${h.done_count === 1 ? 'Once' : `${h.done_count} times`}${h.last_done ? ` · last ${dateText(h.last_done.date, false)}` : ''}` : 'Not yet'],
              ].map(([k, v]) => <div key={k}><span style={{ display: 'block', fontSize: 9, fontWeight: 750, color: MUTED, textTransform: 'uppercase', letterSpacing: '.09em' }}>{k}</span><span style={{ display: 'block', fontSize: 12, color: TEXT, marginTop: 3, lineHeight: 1.35 }}>{v}</span></div>)}
            </div>
            {p.notes && <p style={{ fontSize: 12, color: MUTED, margin: '10px 0 0', lineHeight: 1.5 }}>{p.notes}</p>}

            {openHistory === p.scheduled_task_id && (
              <div style={{ marginTop: 12, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                {(h.recent || []).length ? h.recent.map((r, i) => { const [text, color] = statusOf(r); return (
                  <div key={r.date + i} style={{ display: 'grid', gridTemplateColumns: '92px minmax(0,1fr) auto', gap: 10, alignItems: 'center', padding: '9px 12px', borderTop: i ? `1px solid ${BORDER}` : 'none', fontSize: 12 }}>
                    <span style={{ color: MUTED, fontWeight: 650 }}>{dueText(r.date, today)}</span>
                    <span style={{ color: TEXT, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.status === 'completed' ? `${r.by}${r.note ? ` · ${r.note}` : ''}` : r.by}</span>
                    <DashboardStatusBadge color={color}>{text}</DashboardStatusBadge>
                  </div>); })
                  : <p style={{ margin: 0, padding: 12, fontSize: 12, color: MUTED }}>Nothing yet. Each day it's due shows here once it reaches the desk.</p>}
              </div>
            )}

            {confirmRemove === p.scheduled_task_id ? (
              <div role="alertdialog" aria-label={`Remove ${p.title}`} style={{ marginTop: 12, padding: 12, borderRadius: 12, background: `${RED}08`, border: `1px solid ${RED}30` }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: TEXT }}>Remove “{p.title}” from the schedule? What was already done stays in the shift reports.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => remove(p)} style={{ ...smallBtn('white', RED), border: 'none' }}><Trash2 size={13} />Remove</button>
                  <button onClick={() => setConfirmRemove(null)} style={smallBtn()}>Keep it</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                <button onClick={() => start(p)} style={smallBtn()}><Pencil size={13} />Edit</button>
                <button onClick={() => setOpenHistory(openHistory === p.scheduled_task_id ? null : p.scheduled_task_id)} aria-expanded={openHistory === p.scheduled_task_id} style={smallBtn()}><Clock size={13} />History<ChevronDown size={13} style={{ transform: openHistory === p.scheduled_task_id ? 'rotate(180deg)' : 'none' }} /></button>
                {!hasEnded(p, today) && <button onClick={() => togglePause(p)} style={smallBtn(isOff ? BLUE : ORANGE, isOff ? `${BLUE}10` : `${ORANGE}10`)}>{isOff ? <Play size={13} /> : <Pause size={13} />}{isOff ? 'Resume' : 'Pause'}</button>}
                <button onClick={() => setConfirmRemove(p.scheduled_task_id)} style={smallBtn(RED, `${RED}08`)}><X size={13} />Remove</button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div style={{ fontFamily: INTER }}>
      {notice && <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', marginBottom: 16, border: `1px solid ${GREEN}40`, borderRadius: 12, background: `${GREEN}10`, fontSize: 13, color: TEXT }}><CheckCircle size={16} color={GREEN} />{notice}</div>}
      <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 14, paddingBottom: 20 }}>
        <div>
          <p style={{ fontSize: 14, color: MUTED, margin: 0, maxWidth: 560, lineHeight: 1.55 }}>{desk ? "Leave a task for whoever is on duty on a later day, like an elevator booking or a dog walker's visit. It shows in their To do on that day and goes into that shift's report, done or not done." : "Schedule a task once, for one team member, every day or on the days you choose, for months ahead. It shows on their shift each day it's due, and goes into the shift report when it's done."}</p>
        </div>
        <button onClick={() => start()} style={{ minHeight: 44, padding: '0 16px', background: BLUE, color: 'white', border: 0, borderRadius: 12, fontFamily: INTER, fontSize: 13, fontWeight: 750, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}><Plus size={17} />Schedule a task</button>
      </div>

      {loading ? <div aria-label="Loading scheduled tasks" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1, 2].map(i => <div key={i} style={{ height: 120, borderRadius: 16, background: CARD2, border: `1px solid ${BORDER}` }} />)}</div>
        : loadError ? <div role="alert" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 32, textAlign: 'center' }}><AlertTriangle size={24} color={RED} /><p style={{ fontWeight: 700, color: TEXT, margin: '10px 0 5px' }}>Scheduled tasks couldn't load</p><p style={{ fontSize: 13, color: MUTED, margin: 0 }}>{loadError}</p></div>
        : plans.length === 0 ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 40, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, background: CARD2, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CalendarClock size={34} color={MUTED} strokeWidth={1.5} /></div>
            <p style={{ fontWeight: 700, color: TEXT, fontSize: 17, margin: '0 0 6px' }}>No scheduled tasks yet</p>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>{desk ? 'Schedule one for the person on duty, like an elevator reservation on the 15th.' : 'Schedule one for a team member, like testing the fire panel every Monday for 6 months.'}</p>
          </div>
        ) : groups.map(g => (
          <section key={g.key} style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <g.Icon size={18} color={g.color} /><h2 style={{ fontWeight: 700, color: TEXT, fontSize: 16, margin: 0 }}>{g.title}</h2>
              <span style={{ minWidth: 26, height: 26, borderRadius: 13, background: CARD2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: MUTED }}>{g.list.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{g.list.map(p => <PlanCard key={p.scheduled_task_id} p={p} />)}</div>
          </section>
        ))}
    </div>
  );
}

export default PlannedTasksPage;
