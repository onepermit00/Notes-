import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, ChevronRight, ClipboardList, Clock3, LogOut, Pause, Play, Plus, RotateCcw, Truck, Wrench, X,
} from 'lucide-react';
import { authApi, classifyAuthError } from '../../services/authApi';
import { DailyActivityReport } from '../dashboard/DailyActivityReport';
import { DASHBOARD_FONT as INTER } from '../dashboard/tokens';
import { Chips, Eyebrow, Label, PhotoPicker, YesNo, inputStyle, useIsWide, when } from '../resident/ResidentApp';

const ACCENT = '#FF385C';
const TEXT   = '#222222';
const MUTED  = '#717171';
const BORDER = '#EBEBEB';
const SOFT   = '#F7F7F7';
const GREEN  = '#1F9D55';
const ORANGE = '#C26A00';
const RED    = '#D93025';

const CATEGORIES = ['Plumbing', 'Electrical', 'Heating & cooling', 'Appliance', 'Doors, locks & windows', 'Pest control',
  'Walls, floors & ceilings', 'Elevator', 'Common area', 'Other'];

// Standard residential priorities: how soon maintenance should be there.
const URGENCY = [
  { id: 'emergency', label: 'Emergency', hint: 'Risk to people or the building: flooding, no heat, gas smell, sparks.' },
  { id: 'urgent',    label: 'Urgent',    hint: 'Stops normal use of the home: no hot water, fridge out, only toilet blocked.' },
  { id: 'routine',   label: 'Routine',   hint: 'Everything else.' },
];
const URGENCY_LABEL = Object.fromEntries(URGENCY.map(u => [u.id, u.label]));

export const STATUS = {
  open:        { label: 'Open',        color: TEXT,   bg: SOFT },
  in_progress: { label: 'In progress', color: ORANGE, bg: '#FFF4E5' },
  on_hold:     { label: 'On hold',     color: ORANGE, bg: '#FFF4E5' },
  completed:   { label: 'Done',        color: GREEN,  bg: '#E9F7EF' },
  cancelled:   { label: 'Cancelled',   color: MUTED,  bg: SOFT },
};
const OPEN = ['open', 'in_progress', 'on_hold'];

const EVENT_TEXT = {
  sent: 'Sent by the resident', opened: 'Opened', seen: 'Seen by maintenance', started: 'Started',
  on_hold: 'Put on hold', completed: 'Done', cancelled: 'Cancelled', reopened: 'Reopened', note: 'Note',
  resolved: 'Desk checked in with the resident',
};
const WHO = { manager: 'Manager', concierge: 'Concierge', maintenance: 'Maintenance', resident: 'Resident' };

const ageText = iso => {
  if (!iso) return '';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(mins / 60);
  return hours < 48 ? `${hours} h` : `${Math.round(hours / 24)} days`;
};

const btn = (kind = 'dark') => ({
  minHeight: 46, padding: '0 18px', borderRadius: 14, fontFamily: INTER, fontSize: 14, fontWeight: 750, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, whiteSpace: 'nowrap',
  ...(kind === 'accent' ? { border: 0, background: ACCENT, color: '#fff' }
    : kind === 'green' ? { border: 0, background: GREEN, color: '#fff' }
    : kind === 'light' ? { border: `1px solid ${BORDER}`, background: '#fff', color: TEXT }
    : { border: 0, background: TEXT, color: '#fff' }),
});

function Pill({ status }) {
  const s = STATUS[status] || STATUS.open;
  return (
    <span data-testid="wo-status" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: s.bg, color: s.color, fontSize: 12, fontWeight: 750, whiteSpace: 'nowrap' }}>
      {status === 'completed' ? <Check size={13} /> : status === 'on_hold' ? <Pause size={12} /> : <Clock3 size={13} />}{s.label}
    </span>
  );
}

function UrgencyTag({ urgency }) {
  if (!urgency || urgency === 'routine') return null;
  const red = urgency === 'emergency';
  return <span style={{ padding: '3px 8px', borderRadius: 8, background: red ? '#FFF1F0' : '#FFF4E5', color: red ? RED : ORANGE, fontSize: 11, fontWeight: 800, letterSpacing: '.02em' }}>{URGENCY_LABEL[urgency]}</span>;
}

const BackButton = ({ onClick, children }) => (
  <button type="button" onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: 0, border: 0, background: 'none', color: TEXT, fontFamily: INTER, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
    <ArrowLeft size={17} /> {children}
  </button>
);

const ErrorNote = ({ children }) => children ? <p role="alert" style={{ margin: 0, padding: '12px 14px', borderRadius: 12, background: '#FFF1F0', color: RED, fontSize: 14, fontWeight: 650 }}>{children}</p> : null;

// ── New work order ───────────────────────────────────────────────────────────

function NewWorkOrder({ role, wide, onCreated, onCancel }) {
  const [kind, setKind] = useState('repair');
  const [unit, setUnit] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('routine');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [permission, setPermission] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const vendorVisit = kind === 'vendor_visit';

  const submit = async (e) => {
    e.preventDefault();
    if (vendorVisit && !vendor.trim()) { setError('Who is the vendor?'); return; }
    if (description.trim().length < 3) { setError(vendorVisit ? 'Say what they are here for.' : 'Describe the work in a few words.'); return; }
    setError(''); setSending(true);
    try {
      const wo = await authApi.createWorkOrder({
        kind, unit, location, category, description, photos,
        urgency: vendorVisit ? 'routine' : urgency, vendor_name: vendor,
        permission_to_enter: vendorVisit ? null : permission,
      });
      onCreated(wo);
    } catch (err) { setError(classifyAuthError(err).message); setSending(false); }
  };

  const field = { display: 'flex', flexDirection: 'column' };
  return (
    <form onSubmit={submit} noValidate data-testid="new-work-order">
      <BackButton onClick={onCancel}>Work orders</BackButton>
      <Eyebrow>{role === 'maintenance' ? 'Log work' : 'Send to maintenance'}</Eyebrow>
      <h1 style={{ margin: 0, fontSize: wide ? 38 : 30, lineHeight: 1.04, fontWeight: 800, letterSpacing: '-.04em', color: TEXT }}>{vendorVisit ? 'Vendor visit' : 'New work order'}</h1>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div role="radiogroup" aria-label="Kind" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['repair', 'Repair', Wrench], ['vendor_visit', 'Vendor visit', Truck]].map(([id, label, Icon]) => {
            const active = kind === id;
            return (
              <button key={id} type="button" role="radio" aria-checked={active} data-testid={`kind-${id}`} onClick={() => setKind(id)}
                style={{ minHeight: 52, borderRadius: 14, border: `1.5px solid ${active ? TEXT : BORDER}`, background: active ? TEXT : '#fff', color: active ? '#fff' : TEXT, fontFamily: INTER, fontSize: 15, fontWeight: 750, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon size={17} />{label}
              </button>
            );
          })}
        </div>
        {vendorVisit && <p style={{ margin: '-8px 0 0', fontSize: 13, lineHeight: 1.5, color: MUTED }}>Vendors don't get their own login. Log them here when they arrive and mark it done when they leave. Both times go in the day's report.</p>}

        {vendorVisit && (
          <div style={field}>
            <Label htmlFor="wo-vendor">Vendor</Label>
            <input id="wo-vendor" value={vendor} onChange={e => setVendor(e.target.value)} style={inputStyle} maxLength={120} placeholder="Otis Elevator, Orkin, ABC Plumbing…" />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: wide ? '160px 1fr' : '1fr 1.6fr', gap: 12 }}>
          <div style={field}>
            <Label htmlFor="wo-unit" optional>Unit</Label>
            <input id="wo-unit" value={unit} onChange={e => setUnit(e.target.value)} style={inputStyle} maxLength={30} placeholder="12B" />
          </div>
          <div style={field}>
            <Label htmlFor="wo-location" optional>Where</Label>
            <input id="wo-location" value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} maxLength={120} placeholder={vendorVisit ? 'Elevator 2, roof…' : 'Kitchen sink, lobby…'} />
          </div>
        </div>

        <div style={field}>
          <Label>{vendorVisit ? 'What kind of work?' : 'What needs fixing?'}</Label>
          <Chips options={CATEGORIES} value={category} onChange={setCategory} name="Category" />
        </div>

        {!vendorVisit && (
          <div style={field}>
            <Label>How urgent is it?</Label>
            <div role="radiogroup" aria-label="Urgency" style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(3,minmax(0,1fr))' : '1fr', gap: 8 }}>
              {URGENCY.map(u => {
                const active = urgency === u.id;
                const red = u.id === 'emergency';
                return (
                  <button key={u.id} type="button" role="radio" aria-checked={active} onClick={() => setUrgency(u.id)}
                    style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${active ? (red ? RED : TEXT) : BORDER}`, background: active ? (red ? '#FFF1F0' : SOFT) : '#fff', fontFamily: INTER, cursor: 'pointer' }}>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: red && active ? RED : TEXT }}>{u.label}</span>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 12, lineHeight: 1.45, color: MUTED }}>{u.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={field}>
          <Label htmlFor="wo-description">{vendorVisit ? 'What are they here for?' : "What's wrong?"}</Label>
          <textarea id="wo-description" data-testid="wo-description" value={description} onChange={e => { setDescription(e.target.value); setError(''); }} rows={4} maxLength={4000}
            placeholder={vendorVisit ? 'Annual elevator inspection, escorted to the machine room.' : 'Water dripping under the kitchen sink.'}
            style={{ ...inputStyle, minHeight: 110, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        {!vendorVisit && unit.trim() && (
          <div style={field}>
            <Label>OK to enter if no one is home?</Label>
            <YesNo value={permission} onChange={setPermission} yes="Yes" no="Only when someone is home" name="Permission to enter" />
          </div>
        )}

        <div style={field}>
          <Label optional>Photos</Label>
          <PhotoPicker photos={photos} setPhotos={setPhotos} />
        </div>

        <ErrorNote>{error}</ErrorNote>
        <button type="submit" disabled={sending} data-testid="create-work-order" style={{ ...btn('accent'), minHeight: 54, fontSize: 16, background: sending ? MUTED : ACCENT }}>
          {sending ? 'Saving…' : vendorVisit ? 'Log vendor arrival' : role === 'maintenance' ? 'Open work order' : 'Send to maintenance'}
        </button>
      </div>
    </form>
  );
}

// ── One work order ───────────────────────────────────────────────────────────

function WorkOrderDetail({ id, role, user, wide, onBack, onChanged }) {
  const [wo, setWo] = useState(null);
  const [failed, setFailed] = useState(false);
  const [action, setAction] = useState(null);   // 'hold' | 'done' | 'note'
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    let alive = true;
    authApi.getWorkOrder(id).then(w => alive && setWo(w)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [id]);

  const run = async (fn) => {
    setBusy(true); setError('');
    try {
      const next = await fn();
      setWo(next); setAction(null); setText(''); setPhotos([]); onChanged?.(next);
    } catch (err) { setError(classifyAuthError(err).message); }
    setBusy(false);
  };
  const setStatus = (status, extra = {}) => run(() => authApi.updateWorkOrder(id, { status, ...extra }));

  if (failed) return <><BackButton onClick={onBack}>Work orders</BackButton><p style={{ color: MUTED }}>This work order could not be found.</p></>;
  if (!wo) return <><BackButton onClick={onBack}>Work orders</BackButton><div style={{ height: 240, borderRadius: 20, background: SOFT }} /></>;

  const vendorVisit = wo.kind === 'vendor_visit';
  const works = role === 'maintenance' || role === 'manager';
  const own = role === 'concierge' && wo.created_by === (user?.user_id || user?.concierge_id);
  const isOpen = OPEN.includes(wo.status);
  const details = [
    wo.unit && ['Unit', wo.unit],
    wo.location && ['Where', wo.location],
    vendorVisit && wo.vendor_name && ['Vendor', wo.vendor_name],
    wo.resident_name && ['Resident', wo.resident_name],
    !vendorVisit && ['Urgency', URGENCY_LABEL[wo.urgency] || 'Routine'],
    wo.permission_to_enter !== null && wo.permission_to_enter !== undefined && ['Entry', wo.permission_to_enter ? 'OK to enter if no one is home' : 'Only when someone is home'],
    wo.pets && ['Pets', wo.pets],
    wo.best_time && ['Best time', wo.best_time],
    ['Opened by', `${wo.created_by_name} (${WHO[wo.created_by_type] || 'Staff'}) · ${when(wo.created_at)}`],
    wo.status === 'on_hold' && wo.hold_reason && ['Waiting on', wo.hold_reason],
  ].filter(Boolean);

  const actions = [];
  if (works && wo.status === 'open') actions.push(<button key="start" type="button" data-testid="wo-start" disabled={busy} onClick={() => setStatus('in_progress')} style={btn('dark')}><Play size={15} />Start work</button>);
  if (works && wo.status === 'on_hold') actions.push(<button key="resume" type="button" disabled={busy} onClick={() => setStatus('in_progress')} style={btn('dark')}><Play size={15} />Start again</button>);
  if ((works && isOpen) || (own && vendorVisit && isOpen)) actions.push(<button key="done" type="button" data-testid="wo-done" disabled={busy} onClick={() => setAction('done')} style={btn('green')}><Check size={16} />{vendorVisit ? 'Vendor left' : 'Mark done'}</button>);
  if (works && wo.status === 'in_progress' && !vendorVisit) actions.push(<button key="hold" type="button" data-testid="wo-hold" disabled={busy} onClick={() => setAction('hold')} style={btn('light')}><Pause size={15} />On hold</button>);
  if (works && !isOpen) actions.push(<button key="reopen" type="button" disabled={busy} onClick={() => setStatus('open')} style={btn('light')}><RotateCcw size={15} />Reopen</button>);
  if (isOpen && (role === 'manager' || own)) actions.push(<button key="cancel" type="button" disabled={busy} onClick={() => setStatus('cancelled')} style={{ ...btn('light'), color: RED }}><X size={15} />Cancel</button>);

  const sheet = action && (
    <div data-testid={`wo-${action}-sheet`} style={{ marginTop: 14, padding: 16, borderRadius: 18, border: `1px solid ${BORDER}`, background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Label htmlFor="wo-action-text" optional={action === 'done'}>{action === 'hold' ? 'What is it waiting on?' : action === 'done' ? (vendorVisit ? 'Anything to note?' : 'What was done?') : 'Add a note'}</Label>
      {action === 'hold' && <Chips options={['Parts on order', 'Waiting on the resident', 'Outside vendor', 'Access to the unit']} value={text} onChange={setText} name="Reason" />}
      <textarea id="wo-action-text" data-testid="wo-action-text" value={text} onChange={e => setText(e.target.value)} rows={3} maxLength={2000}
        placeholder={action === 'hold' ? 'Faucet cartridge ordered, arrives Thursday' : action === 'done' ? 'Replaced the trap and tested for leaks' : 'Plumber arrived, taking him to 505'}
        style={{ ...inputStyle, minHeight: 84, resize: 'vertical', lineHeight: 1.5 }} />
      {action !== 'hold' && <PhotoPicker photos={photos} setPhotos={setPhotos} />}
      <p style={{ margin: 0, fontSize: 12, color: MUTED }}>This goes into today's report with your name and the time.</p>
      <ErrorNote>{error}</ErrorNote>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" data-testid="wo-action-save" disabled={busy} style={btn(action === 'done' ? 'green' : 'dark')} onClick={() => {
          if (action === 'hold') { if (!text.trim()) { setError('Say what it is waiting on.'); return; } setStatus('on_hold', { hold_reason: text }); }
          else if (action === 'done') setStatus('completed', { note: text, photos });
          else { if (!text.trim()) { setError('Write the note first.'); return; } run(() => authApi.addWorkOrderNote(id, { text, photos })); }
        }}>{busy ? 'Saving…' : action === 'hold' ? 'Put on hold' : action === 'done' ? (vendorVisit ? 'Sign the vendor out' : 'Mark done') : 'Save note'}</button>
        <button type="button" onClick={() => { setAction(null); setText(''); setPhotos([]); setError(''); }} style={btn('light')}>Cancel</button>
      </div>
    </div>
  );

  const allPhotos = [...(wo.photos || []), ...(wo.completion_photos || [])];
  return (
    <article data-testid="work-order-detail">
      <BackButton onClick={onBack}>Work orders</BackButton>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Eyebrow>{vendorVisit ? 'Vendor visit' : 'Work order'} #{wo.number}</Eyebrow>
          <h1 style={{ margin: 0, fontSize: wide ? 34 : 26, lineHeight: 1.08, fontWeight: 800, letterSpacing: '-.035em', color: TEXT }}>
            {[wo.category || (vendorVisit ? wo.vendor_name : 'Repair'), wo.unit ? `Unit ${wo.unit}` : wo.location].filter(Boolean).join(' · ')}
          </h1>
        </div>
        <Pill status={wo.status} />
      </div>
      {wo.urgency === 'emergency' && isOpen && <div style={{ marginTop: 12 }}><UrgencyTag urgency="emergency" /></div>}

      {actions.length > 0 && !action && <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
      {sheet}
      {!action && <ErrorNote>{error}</ErrorNote>}

      <div style={{ display: 'grid', gridTemplateColumns: wide ? 'minmax(0,1fr) minmax(0,1fr)' : '1fr', gap: 16, marginTop: 20, alignItems: 'start' }}>
        <section aria-label="Details" style={{ padding: 18, borderRadius: 20, background: SOFT }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: TEXT, whiteSpace: 'pre-wrap' }}>{wo.description}</p>
          <dl style={{ margin: '14px 0 0', display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '8px 14px', fontSize: 13 }}>
            {details.map(([k, v]) => <React.Fragment key={k}><dt style={{ color: MUTED, fontWeight: 650 }}>{k}</dt><dd style={{ margin: 0, color: TEXT }}>{v}</dd></React.Fragment>)}
          </dl>
          {allPhotos.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allPhotos.map((url, i) => (
                <button key={i} type="button" onClick={() => setPhoto(url)} style={{ width: 72, height: 72, padding: 0, borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}`, cursor: 'zoom-in', background: '#fff' }}>
                  <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </section>

        <section aria-label="Timeline" style={{ padding: '18px 18px 6px', borderRadius: 20, border: `1px solid ${BORDER}`, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>Timeline</h2>
            {!action && <button type="button" data-testid="wo-add-note" onClick={() => setAction('note')} style={{ ...btn('light'), minHeight: 36, padding: '0 12px', fontSize: 13 }}><Plus size={14} />Note</button>}
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {(wo.timeline || []).map((step, i, all) => (
              <li key={i} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0,1fr)', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ width: 12, height: 12, marginTop: 4, borderRadius: '50%', background: step.event === 'completed' || step.event === 'resolved' ? GREEN : step.event === 'on_hold' ? ORANGE : TEXT }} />
                  {i < all.length - 1 && <span style={{ flex: 1, width: 2, background: BORDER, minHeight: 22 }} />}
                </div>
                <div style={{ paddingBottom: 14, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{EVENT_TEXT[step.event] || step.event}{step.by_name ? <span style={{ fontWeight: 550, color: MUTED }}> · {step.by_name}{step.by_type ? ` (${WHO[step.by_type] || step.by_type})` : ''}</span> : null}</div>
                  {step.note && <div style={{ marginTop: 3, fontSize: 13, lineHeight: 1.5, color: TEXT, whiteSpace: 'pre-wrap' }}>{step.note}</div>}
                  <div style={{ marginTop: 2, fontSize: 12, color: MUTED }}>{when(step.at)}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {photo && (
        <div role="dialog" aria-modal="true" aria-label="Photo" onClick={() => setPhoto(null)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={photo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12 }} />
        </div>
      )}
    </article>
  );
}

// ── The list ─────────────────────────────────────────────────────────────────

function ReminderSettings({ hours, onSaved }) {
  const [form, setForm] = useState(hours);
  const [state, setState] = useState('');
  useEffect(() => setForm(hours), [hours]);
  const save = async () => {
    setState('saving');
    try { const r = await authApi.saveMaintenanceSettings(Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v)]))); onSaved(r.remind_hours); setState('saved'); }
    catch (err) { setState(classifyAuthError(err).message); }
  };
  return (
    <section data-testid="reminder-settings" style={{ marginTop: 26, padding: 18, borderRadius: 20, border: `1px solid ${BORDER}`, background: '#fff' }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TEXT }}>Reminder times</h2>
      <p style={{ margin: '6px 0 14px', fontSize: 13, lineHeight: 1.5, color: MUTED }}>If a work order is still open after this long, the desk gets a task to check with maintenance. Standard practice is shown; change it for your building.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
        {URGENCY.map(u => (
          <label key={u.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 700, color: TEXT }}>
            {u.label}
            <span style={{ position: 'relative' }}>
              <input type="number" min="0.25" step="0.5" value={form?.[u.id] ?? ''} onChange={e => { setForm(f => ({ ...f, [u.id]: e.target.value })); setState(''); }}
                aria-label={`${u.label} reminder in hours`} style={{ ...inputStyle, minHeight: 44, paddingRight: 34 }} />
              <span style={{ position: 'absolute', right: 12, top: 13, fontSize: 13, color: MUTED, fontWeight: 600 }}>h</span>
            </span>
          </label>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={save} style={{ ...btn('dark'), minHeight: 40 }}>{state === 'saving' ? 'Saving…' : 'Save'}</button>
        {state === 'saved' && <span style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>Saved</span>}
        {state && !['saving', 'saved'].includes(state) && <span style={{ fontSize: 13, color: RED }}>{state}</span>}
      </div>
    </section>
  );
}

function WorkOrderList({ role, wide, embedded, orders, loading, filter, setFilter, open, onNew, remindHours, setRemindHours }) {
  const counts = useMemo(() => ({
    open: orders.filter(w => OPEN.includes(w.status)).length,
    done: orders.filter(w => !OPEN.includes(w.status)).length,
  }), [orders]);
  const shown = orders.filter(w => filter === 'all' || (filter === 'open' ? OPEN.includes(w.status) : !OPEN.includes(w.status)))
    .sort((a, b) => {
      if (filter !== 'open') return 0;
      const rank = w => (w.urgency === 'emergency' ? 0 : w.urgency === 'urgent' ? 1 : 2);
      return rank(a) - rank(b) || String(a.created_at).localeCompare(String(b.created_at));
    });
  const overdue = w => OPEN.includes(w.status) && w.kind !== 'vendor_visit' && remindHours?.[w.urgency || 'routine']
    && (Date.now() - new Date(w.created_at).getTime()) > remindHours[w.urgency || 'routine'] * 3600000;

  return (
    <>
      <div style={{ display: 'flex', alignItems: wide ? 'flex-end' : 'flex-start', justifyContent: 'space-between', gap: 12, flexDirection: wide ? 'row' : 'column' }}>
        <div>
          {!embedded && <Eyebrow>Maintenance</Eyebrow>}
          <h1 data-testid="work-orders-title" style={embedded ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' } : { margin: 0, fontSize: wide ? 42 : 32, lineHeight: 1, fontWeight: 800, letterSpacing: '-.045em', color: TEXT }}>Work orders</h1>
          <p style={{ margin: embedded ? 0 : '10px 0 0', fontSize: 14, lineHeight: 1.55, color: MUTED, maxWidth: 520 }}>
            {role === 'maintenance' ? 'Everything sent to maintenance by residents, the desk and the manager. Each step goes into the day\'s report.'
              : 'Send work to maintenance and follow it. Residents\' work orders show up here too.'}
          </p>
        </div>
        <button type="button" data-testid="new-work-order-btn" onClick={onNew} style={{ ...btn('accent'), width: wide ? 'auto' : '100%', minHeight: 50, boxShadow: `0 10px 26px ${ACCENT}30` }}><Plus size={18} />{role === 'maintenance' ? 'Log work or vendor' : 'New work order'}</button>
      </div>

      <div role="tablist" aria-label="Show" style={{ marginTop: 22, display: 'flex', gap: 6, borderBottom: `1px solid ${BORDER}` }}>
        {[['open', `Open${counts.open ? ` (${counts.open})` : ''}`], ['done', 'Done'], ['all', 'All']].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={filter === id} type="button" onClick={() => setFilter(id)}
            style={{ minHeight: 44, padding: '0 14px', border: 0, borderBottom: `2px solid ${filter === id ? TEXT : 'transparent'}`, marginBottom: -1, background: 'none', color: filter === id ? TEXT : MUTED, fontFamily: INTER, fontSize: 14, fontWeight: 750, cursor: 'pointer' }}>{label}</button>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1, 2, 3].map(i => <div key={i} style={{ height: 76, borderRadius: 18, background: SOFT }} />)}</div>
        ) : shown.length === 0 ? (
          <div style={{ padding: '30px 20px', borderRadius: 20, border: `1px dashed ${BORDER}`, textAlign: 'center' }}>
            <ClipboardList size={22} color={MUTED} />
            <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 750, color: TEXT }}>{filter === 'open' ? 'Nothing open' : 'Nothing here yet'}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED }}>{filter === 'open' ? 'New work orders show here as soon as they are sent.' : 'Finished work orders are kept here.'}</p>
          </div>
        ) : (
          <div style={{ borderRadius: 20, border: `1px solid ${BORDER}`, background: '#fff', overflow: 'hidden' }}>
            {shown.map((w, i) => {
              const Icon = w.kind === 'vendor_visit' ? Truck : Wrench;
              const late = overdue(w);
              return (
                <button key={w.work_order_id} type="button" data-testid="work-order-row" onClick={() => open(w.work_order_id)}
                  style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: wide ? '44px minmax(0,1fr) auto 18px' : '40px minmax(0,1fr)', alignItems: wide ? 'center' : 'start', gap: 12, padding: '14px 16px', border: 0, borderTop: i ? `1px solid ${BORDER}` : 0, background: '#fff', cursor: 'pointer', fontFamily: INTER }}>
                  <span style={{ width: wide ? 44 : 40, height: wide ? 44 : 40, borderRadius: 12, background: w.urgency === 'emergency' && OPEN.includes(w.status) ? '#FFF1F0' : SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={w.urgency === 'emergency' && OPEN.includes(w.status) ? RED : TEXT} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 780, color: TEXT }}>#{w.number} · {[w.category || (w.kind === 'vendor_visit' ? w.vendor_name : 'Repair'), w.unit ? `Unit ${w.unit}` : w.location].filter(Boolean).join(' · ')}</span>
                      {OPEN.includes(w.status) && <UrgencyTag urgency={w.urgency} />}
                      {!wide && <Pill status={w.status} />}
                    </span>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.description}</span>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 12, color: late ? RED : MUTED, fontWeight: late ? 700 : 500 }}>
                      {w.created_by_type === 'resident' ? `From ${w.resident_name || 'a resident'}` : `By ${w.created_by_name}`} · {OPEN.includes(w.status) ? `open ${ageText(w.created_at) === 'just now' ? 'since just now' : ageText(w.created_at)}${late ? ', past the limit' : ''}` : when(w.completed_at || w.cancelled_at || w.updated_at)}
                    </span>
                  </span>
                  {wide && <Pill status={w.status} />}
                  {wide && <ChevronRight size={18} color={MUTED} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {role === 'manager' && remindHours && <ReminderSettings hours={remindHours} onSaved={setRemindHours} />}
    </>
  );
}

/** The shared work orders screen. Inside the manager and concierge dashboards it
 *  keeps its own place; the maintenance app passes `route`/`go` to use the URL. */
export function WorkOrdersPage({ role, user, wide: wideProp, embedded = false, route: routeProp, go: goProp }) {
  const autoWide = useIsWide();
  const wide = wideProp ?? autoWide;
  const [localRoute, setLocalRoute] = useState({ view: 'list' });
  const route = routeProp || localRoute;
  const go = goProp || setLocalRoute;
  const [orders, setOrders] = useState([]);
  const [remindHours, setRemindHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');

  const load = useCallback(() => authApi.getWorkOrders().then(r => { setOrders(r.work_orders || []); setRemindHours(r.remind_hours || null); })
    .catch(() => {}).finally(() => setLoading(false)), []);
  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    window.addEventListener('focus', load);
    return () => { clearInterval(timer); window.removeEventListener('focus', load); };
  }, [load]);
  const upsert = wo => setOrders(list => [wo, ...list.filter(w => w.work_order_id !== wo.work_order_id)]);

  if (route.view === 'new') return <NewWorkOrder role={role} wide={wide} onCancel={() => go({ view: 'list' })} onCreated={wo => { upsert(wo); go({ view: 'detail', id: wo.work_order_id }); }} />;
  if (route.view === 'detail') return <WorkOrderDetail key={route.id} id={route.id} role={role} user={user} wide={wide} onBack={() => { load(); go({ view: 'list' }); }} onChanged={upsert} />;
  return <WorkOrderList role={role} wide={wide} embedded={embedded} orders={orders} loading={loading} filter={filter} setFilter={setFilter}
    open={id => go({ view: 'detail', id })} onNew={() => go({ view: 'new' })} remindHours={remindHours} setRemindHours={setRemindHours} />;
}

// ── Today's report, read-only for maintenance ────────────────────────────────

const mapShift = s => {
  if (!s) return null;
  const time = iso => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');
  return {
    concierge: { name: s.concierge_name },
    dateLabel: new Date(s.clock_in).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    clockIn: time(s.clock_in),
    clockOut: s.clock_out ? time(s.clock_out) : null,
    note: s.handover_notes || '',
    openItems: s.open_items || [],
    closedReason: s.closed_reason || '',
    incidents: (s.incidents || []).map(i => ({ text: `${i.created_at ? `${time(i.created_at).toLowerCase()} — ` : ''}${i.type || 'Incident'}: ${i.description || ''}`, evidenceUrls: Array.isArray(i.evidence_urls) ? i.evidence_urls : [] })),
    activities: (s.activities || []).map(t => {
      const desk = ['manager', 'resident', 'system'].includes(t.created_by_type);
      return {
        id: t.task_id,
        time: t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '',
        title: t.not_done ? `Not done · ${t.title}` : desk ? `Done · ${t.title}` : t.title,
        notes: t.not_done ? '' : (t.notes || ''),
        category: t.category || 'Other',
        evidenceUrls: Array.isArray(t.evidence_urls) ? t.evidence_urls : [],
        sourceSection: t.created_by_type === 'maintenance_log' ? 'maintenance' : desk ? 'tasks' : (t.source_section || 'tasks'),
      };
    }),
  };
};

function TodayReport({ user, wide }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = () => authApi.getMaintenanceDar().then(setData).catch(() => {}).finally(() => setLoading(false));
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);
  const active = data?.active?.[0];
  const shift = mapShift(active || data?.previous);
  return (
    <section data-testid="maintenance-report">
      <Eyebrow>Today</Eyebrow>
      <h1 style={{ margin: 0, fontSize: wide ? 42 : 32, lineHeight: 1, fontWeight: 800, letterSpacing: '-.045em', color: TEXT }}>Daily report</h1>
      <p style={{ margin: '10px 0 20px', fontSize: 14, lineHeight: 1.55, color: MUTED, maxWidth: 560 }}>
        {loading ? 'Loading…' : active
          ? `${active.concierge_name} is on the desk. Your updates show in their report as "added by ${user?.first_name || 'you'}".`
          : 'No one is on the desk right now. Your updates still keep their exact time, are marked "No one on shift", and anything the desk has to follow up lands on the next shift\'s To do.'}
      </p>
      {!loading && !active && data?.previous && <p style={{ margin: '-8px 0 14px', fontSize: 13, fontWeight: 700, color: TEXT }}>The last shift:</p>}
      <DailyActivityReport mode="manager" shift={shift} loading={loading} showConciergeIdentity
        emptyTitle="No report yet" emptyHint="Once the front desk starts a shift, the day's report shows here." />
    </section>
  );
}

// ── The maintenance app ──────────────────────────────────────────────────────

export function MaintenanceApp({ user, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const wide = useIsWide();
  const [menuOpen, setMenuOpen] = useState(false);

  // /app/report, /app/new, /app/work-orders/<id>; anything else is the list.
  const route = useMemo(() => {
    const parts = location.pathname.replace(/^\/app\/?/, '').split('/');
    if (parts[0] === 'report') return { view: 'report' };
    if (parts[0] === 'new') return { view: 'new' };
    if (parts[0] === 'work-orders' && parts[1]) return { view: 'detail', id: parts[1] };
    return { view: 'list' };
  }, [location.pathname]);
  const go = useCallback(r => {
    window.scrollTo(0, 0);
    navigate(r.view === 'report' ? '/app/report' : r.view === 'new' ? '/app/new' : r.view === 'detail' ? `/app/work-orders/${r.id}` : '/app/today');
  }, [navigate]);

  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || '';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'M';
  const tab = route.view === 'report' ? 'report' : 'orders';
  const Tabs = (
    <nav aria-label="Maintenance" style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: SOFT }}>
      {[['orders', 'Work orders', Wrench], ['report', "Today's report", ClipboardList]].map(([id, label, Icon]) => (
        <button key={id} type="button" data-testid={`tab-${id}`} aria-current={tab === id ? 'page' : undefined} onClick={() => go({ view: id === 'report' ? 'report' : 'list' })}
          style={{ minHeight: 38, padding: '0 14px', borderRadius: 999, border: 0, background: tab === id ? '#fff' : 'transparent', boxShadow: tab === id ? '0 1px 6px rgba(0,0,0,.1)' : 'none', color: TEXT, fontFamily: INTER, fontSize: 13, fontWeight: 750, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, flex: wide ? 'none' : 1, justifyContent: 'center' }}>
          <Icon size={15} />{label}
        </button>
      ))}
    </nav>
  );

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', color: TEXT, fontFamily: INTER }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 16px', height: 60, display: 'grid', gridTemplateColumns: wide ? 'minmax(0,1fr) auto minmax(0,1fr)' : '44px minmax(0,1fr) 44px', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: `${ACCENT}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wrench size={16} color={ACCENT} /></span>
            {wide && <span style={{ fontSize: 15, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.property_name || 'Maintenance'}</span>}
          </div>
          {wide ? Tabs : <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.property_name || 'Maintenance'}</div>}
          <div style={{ position: 'relative', justifySelf: 'end' }}>
            <button type="button" aria-label="Account" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)} data-testid="maintenance-account"
              style={{ width: 38, height: 38, borderRadius: '50%', border: 0, background: `${ACCENT}14`, color: ACCENT, fontFamily: INTER, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>{initials}</button>
            {menuOpen && (
              <div role="menu" style={{ position: 'absolute', right: 0, top: 46, width: 250, padding: 8, borderRadius: 16, background: '#fff', border: `1px solid ${BORDER}`, boxShadow: '0 12px 36px rgba(0,0,0,.14)' }}>
                <div style={{ padding: '10px 12px 12px', borderBottom: `1px solid ${BORDER}`, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{name}</div>
                  <div style={{ marginTop: 2, fontSize: 13, color: MUTED }}>Maintenance · {user?.email}</div>
                </div>
                <button type="button" role="menuitem" onClick={onSignOut} style={{ width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', border: 0, borderRadius: 10, background: 'none', color: TEXT, fontFamily: INTER, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  <LogOut size={17} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
        {!wide && <div style={{ padding: '0 16px 10px' }}>{Tabs}</div>}
      </header>
      <main style={{ maxWidth: route.view === 'report' ? 1040 : 880, margin: '0 auto', padding: wide ? '34px 24px 64px' : '20px 16px 48px' }} onClick={() => menuOpen && setMenuOpen(false)}>
        {route.view === 'report' ? <TodayReport user={user} wide={wide} /> : <WorkOrdersPage role="maintenance" user={user} wide={wide} route={route} go={go} />}
      </main>
    </div>
  );
}

export default MaintenanceApp;
