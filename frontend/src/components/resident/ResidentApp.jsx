import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, Camera, Check, ChevronRight, Clock3, Flag, Home, Lock, LogOut, Mail, Phone,
  Plus, Volume2, Wrench, X,
} from 'lucide-react';
import { authApi, classifyAuthError } from '../../services/authApi';
import { shrinkImage } from '../../lib/shrinkImage';
import { DASHBOARD_FONT as INTER } from '../dashboard/tokens';

const ACCENT = '#FF385C';
const TEXT   = '#222222';
const MUTED  = '#717171';
const BORDER = '#EBEBEB';
const SOFT   = '#F7F7F7';
const GREEN  = '#1F9D55';
const ORANGE = '#C26A00';
const RED    = '#D93025';
const MAX_PHOTOS = 4;

const TYPES = {
  noise: {
    label: 'Noise complaint', Icon: Volume2,
    blurb: 'Kept anonymous. Your neighbor is never told who complained.',
  },
  work_order: {
    label: 'Work order', Icon: Wrench,
    blurb: 'Something in your home needs fixing. Goes straight to maintenance.',
  },
  report: {
    label: 'Report something', Icon: Flag,
    blurb: 'Common areas, safety, parking, lost and found.',
  },
};

// Standard residential work order priorities.
const URGENCY = [
  { id: 'emergency', label: 'Emergency', hint: 'Water leaking, no heat, no power, a gas smell, sparks, or you cannot lock your door.' },
  { id: 'urgent',    label: 'Urgent',    hint: 'No hot water, a broken fridge or stove, your only toilet blocked.' },
  { id: 'routine',   label: 'Routine',   hint: 'Everything else, like a dripping tap or a loose cabinet door.' },
];

const STATUS_STYLE = {
  pending:     { color: TEXT,   bg: SOFT },
  open:        { color: TEXT,   bg: SOFT },
  in_progress: { color: ORANGE, bg: '#FFF4E5' },
  on_hold:     { color: ORANGE, bg: '#FFF4E5' },
  completed:   { color: GREEN,  bg: '#E9F7EF' },
  declined:    { color: MUTED,  bg: SOFT },
  cancelled:   { color: MUTED,  bg: SOFT },
};
const OPEN_STATUSES = ['pending', 'open', 'in_progress', 'on_hold'];

const EVENT_TEXT = {
  sent:     'You sent this to the front desk',
  seen:     'The front desk saw your request',
  started:  'The front desk started on it',
  resolved: 'Marked as resolved',
  closed:   'Closed by the front desk',
};
// A work order goes to maintenance; the front desk checks in once it's done.
const WORK_ORDER_EVENT_TEXT = {
  sent:      'You sent this to maintenance',
  seen:      'Maintenance saw your work order',
  started:   'Maintenance started on it',
  on_hold:   'On hold',
  completed: 'Maintenance finished the work',
  resolved:  'The front desk checked in and resolved it',
  closed:    'Closed',
  reopened:  'Opened again',
};

export const when = (iso, withDay = true) => {
  if (!iso) return '';
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (!withDay) return time;
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const day = d.toDateString() === today.toDateString() ? 'Today'
    : d.toDateString() === yesterday.toDateString() ? 'Yesterday'
    : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${day}, ${time}`;
};

export const useIsWide = () => {
  const [wide, setWide] = useState(() => window.innerWidth >= 900);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return wide;
};

const readFile = file => new Promise(resolve => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

// ── Small building blocks ─────────────────────────────────────────────────────

function StatusPill({ request }) {
  const style = STATUS_STYLE[request.status] || STATUS_STYLE.pending;
  return (
    <span data-testid="request-status" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: style.bg, color: style.color, fontSize: 12, fontWeight: 750, whiteSpace: 'nowrap' }}>
      {request.status === 'completed' ? <Check size={13} /> : <Clock3 size={13} />}
      {request.status_label}
    </span>
  );
}

export function Eyebrow({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span aria-hidden="true" style={{ width: 28, height: 2, background: ACCENT }} />
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(0,0,0,.55)' }}>{children}</span>
    </div>
  );
}

export function Label({ children, htmlFor, optional }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'block', fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
      {children}{optional && <span style={{ fontWeight: 500, color: MUTED }}> (optional)</span>}
    </label>
  );
}

export const inputStyle = {
  width: '100%', minHeight: 50, boxSizing: 'border-box', padding: '12px 16px', borderRadius: 14,
  border: `1px solid ${BORDER}`, background: SOFT, color: TEXT, fontFamily: INTER, fontSize: 16, outline: 'none',
};

export function Chips({ options, value, onChange, name }) {
  return (
    <div role="radiogroup" aria-label={name} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(option => {
        const active = value === option;
        return (
          <button key={option} type="button" role="radio" aria-checked={active} onClick={() => onChange(active ? '' : option)}
            style={{ minHeight: 42, padding: '0 15px', borderRadius: 999, border: `1px solid ${active ? TEXT : BORDER}`, background: active ? TEXT : '#fff', color: active ? '#fff' : TEXT, fontFamily: INTER, fontSize: 14, fontWeight: 650, cursor: 'pointer' }}>
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function YesNo({ value, onChange, yes = 'Yes', no = 'No', name }) {
  return (
    <div role="radiogroup" aria-label={name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[[true, yes], [false, no]].map(([v, label]) => {
        const active = value === v;
        return (
          <button key={label} type="button" role="radio" aria-checked={active} onClick={() => onChange(v)}
            style={{ minHeight: 48, borderRadius: 14, border: `1px solid ${active ? TEXT : BORDER}`, background: active ? TEXT : '#fff', color: active ? '#fff' : TEXT, fontFamily: INTER, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function PhotoPicker({ photos, setPhotos }) {
  const add = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    const urls = await Promise.all(files.map(async f => shrinkImage(await readFile(f), 1280, 0.7)));
    setPhotos(p => [...p, ...urls].slice(0, MAX_PHOTOS));
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {photos.map((url, i) => (
        <div key={i} style={{ position: 'relative', width: 84, height: 84, borderRadius: 14, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
          <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
            style={{ position: 'absolute', top: 5, right: 5, width: 24, height: 24, borderRadius: '50%', border: 0, background: 'rgba(0,0,0,.6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            <X size={13} />
          </button>
        </div>
      ))}
      {photos.length < MAX_PHOTOS && (
        <label data-testid="request-add-photo" style={{ width: 84, height: 84, borderRadius: 14, border: `1.5px dashed ${BORDER}`, background: SOFT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: MUTED, fontSize: 12, fontWeight: 650 }}>
          {photos.length ? <Plus size={20} /> : <Camera size={20} />}
          {photos.length ? 'Add' : 'Photo'}
          <input type="file" accept="image/*" multiple onChange={add} style={{ display: 'none' }} />
        </label>
      )}
    </div>
  );
}

function EmergencyNote({ home }) {
  const desk = home?.front_desk_phone;
  return (
    <div role="note" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 16, background: '#FFF1F0', border: '1px solid #FFD8D4' }}>
      <AlertTriangle size={19} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: TEXT }}>
        <strong>Fire, flooding, a gas smell or a medical emergency?</strong> Call 911 first{desk ? <>, then the front desk at <a href={`tel:${desk}`} style={{ color: RED, fontWeight: 750 }}>{desk}</a></> : ', then the front desk'}. Requests here are not watched like an emergency line.
      </p>
    </div>
  );
}

// ── Screens ──────────────────────────────────────────────────────────────────

function HomeScreen({ home, requests, loading, wide, go }) {
  const firstName = (home?.name || '').split(' ')[0];
  const open = requests.filter(r => OPEN_STATUSES.includes(r.status));
  const mail = home?.front_desk_email
    ? `mailto:${home.front_desk_email}?subject=${encodeURIComponent(`Message from Unit ${home.unit || ''}`.trim())}`
    : '';
  return (
    <>
      <section style={{ padding: wide ? '8px 0 26px' : '4px 0 22px' }}>
        <Eyebrow>Unit {home?.unit || '—'}</Eyebrow>
        <h1 data-testid="resident-greeting" style={{ margin: 0, fontSize: wide ? 46 : 36, lineHeight: 1, fontWeight: 800, letterSpacing: '-.045em', color: TEXT }}>
          {firstName ? `Hi ${firstName}.` : 'Hi there.'}
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6, color: MUTED, maxWidth: 520 }}>
          Tell the front desk what's going on. Every request is logged with the time you sent it, and you can follow it here until it's done.
        </p>
      </section>

      <section aria-labelledby="new-request-title">
        <h2 id="new-request-title" style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.04em', color: TEXT, margin: '0 0 12px' }}>What do you need?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(3, minmax(0,1fr))' : '1fr', gap: 12 }}>
          {Object.entries(TYPES).map(([id, { label, Icon, blurb }]) => (
            <button key={id} type="button" data-testid={`new-${id}`} onClick={() => go(`new/${id}`)}
              style={{ textAlign: 'left', display: 'grid', gridTemplateColumns: wide ? '1fr' : '48px minmax(0,1fr) 20px', alignItems: 'center', gap: wide ? 14 : 14, padding: wide ? 20 : '16px 16px', borderRadius: 20, border: `1px solid ${BORDER}`, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,.05)', cursor: 'pointer', fontFamily: INTER }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: `${ACCENT}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={23} color={ACCENT} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: '-.01em' }}>{label}</span>
                <span style={{ display: 'block', marginTop: 4, fontSize: 13, lineHeight: 1.45, color: MUTED }}>{blurb}</span>
              </span>
              {!wide && <ChevronRight size={19} color={MUTED} />}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 14, display: 'grid', gridTemplateColumns: home?.front_desk_phone ? '1fr 1fr' : '1fr', gap: 10 }}>
        {mail && (
          <a href={mail} data-testid="email-front-desk" style={{ minHeight: 52, borderRadius: 16, background: TEXT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, textDecoration: 'none', fontSize: 15, fontWeight: 750 }}>
            <Mail size={18} /> Email the desk
          </a>
        )}
        {home?.front_desk_phone && (
          <a href={`tel:${home.front_desk_phone}`} style={{ minHeight: 52, borderRadius: 16, border: `1px solid ${BORDER}`, background: '#fff', color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, textDecoration: 'none', fontSize: 15, fontWeight: 750 }}>
            <Phone size={18} /> Call the desk
          </a>
        )}
      </section>

      <div style={{ marginTop: 14 }}><EmergencyNote home={home} /></div>

      <section aria-labelledby="my-requests-title" style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 id="my-requests-title" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.025em', color: TEXT, margin: 0 }}>My requests</h2>
          {open.length > 0 && <span style={{ fontSize: 13, color: MUTED, fontWeight: 650 }}>{open.length} open</span>}
        </div>
        {loading ? (
          <div aria-label="Loading your requests" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1, 2].map(i => <div key={i} style={{ height: 78, borderRadius: 18, background: SOFT }} />)}</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '28px 20px', borderRadius: 20, border: `1px dashed ${BORDER}`, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 750, color: TEXT }}>Nothing sent yet</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: MUTED }}>Requests you send will show here with their status.</p>
          </div>
        ) : (
          <div style={{ borderRadius: 20, border: `1px solid ${BORDER}`, background: '#fff', overflow: 'hidden' }}>
            {requests.map((r, i) => {
              const Icon = (TYPES[r.request_type] || TYPES.report).Icon;
              return (
                <button key={r.request_id} type="button" data-testid="my-request-row" onClick={() => go(`requests/${r.request_id}`)}
                  style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '40px minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '14px 16px', border: 0, borderTop: i ? `1px solid ${BORDER}` : 0, background: '#fff', cursor: 'pointer', fontFamily: INTER }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={TEXT} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 750, color: TEXT }}>{r.type_label}{r.kind ? ` · ${r.kind}` : ''}</span>
                    <span style={{ display: 'block', marginTop: 2, fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</span>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 12, color: MUTED }}>{when(r.created_at)} · #{r.reference}</span>
                  </span>
                  <StatusPill request={r} />
                </button>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function RequestForm({ type, home, onSent, onCancel, wide }) {
  const config = TYPES[type] || TYPES.report;
  const options = home?.options || {};
  const [kind, setKind] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [happeningNow, setHappeningNow] = useState(null);
  const [urgency, setUrgency] = useState('routine');
  const [permission, setPermission] = useState(null);
  const [pets, setPets] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const kinds = type === 'noise' ? options.noise_kinds : type === 'work_order' ? options.work_order_categories : options.report_kinds;

  const submit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 3) { setError('Tell us a little about what is happening.'); return; }
    setError(''); setSending(true);
    try {
      const sent = await authApi.sendResidentRequest({
        request_type: type, kind, location, description,
        happening_now: type === 'noise' ? happeningNow : null,
        urgency: type === 'work_order' ? urgency : null,
        permission_to_enter: type === 'work_order' ? permission : null,
        pets, best_time: bestTime, photos,
      });
      onSent(sent);
    } catch (err) {
      setError(classifyAuthError(err).message);
      setSending(false);
    }
  };

  const field = { display: 'flex', flexDirection: 'column' };
  return (
    <form onSubmit={submit} noValidate data-testid={`form-${type}`}>
      <button type="button" onClick={onCancel} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: 0, border: 0, background: 'none', color: TEXT, fontFamily: INTER, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft size={17} /> Back
      </button>
      <Eyebrow>New request</Eyebrow>
      <h1 style={{ margin: 0, fontSize: wide ? 40 : 32, lineHeight: 1.02, fontWeight: 800, letterSpacing: '-.04em', color: TEXT }}>{config.label}</h1>
      {type === 'noise' && (
        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: SOFT }}>
          <Lock size={17} color={TEXT} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: TEXT }}>Noise complaints are anonymous. Staff can see it came from you, but your name and unit are never shared with the neighbor.</p>
        </div>
      )}

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {kinds?.length > 0 && (
          <div style={field}>
            <Label>{type === 'noise' ? 'What kind of noise?' : type === 'work_order' ? 'What needs fixing?' : 'What is it about?'}</Label>
            <Chips options={kinds} value={kind} onChange={setKind} name="Kind" />
          </div>
        )}

        {type === 'work_order' && (
          <div style={field}>
            <Label>How urgent is it?</Label>
            <div role="radiogroup" aria-label="Urgency" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {URGENCY.map(u => {
                const active = urgency === u.id;
                return (
                  <button key={u.id} type="button" role="radio" aria-checked={active} onClick={() => setUrgency(u.id)}
                    style={{ textAlign: 'left', padding: '13px 15px', borderRadius: 14, border: `1.5px solid ${active ? (u.id === 'emergency' ? RED : TEXT) : BORDER}`, background: active ? (u.id === 'emergency' ? '#FFF1F0' : SOFT) : '#fff', fontFamily: INTER, cursor: 'pointer' }}>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: u.id === 'emergency' && active ? RED : TEXT }}>{u.label}</span>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 13, lineHeight: 1.45, color: MUTED }}>{u.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={field}>
          <Label htmlFor="request-location" optional={type !== 'work_order'}>
            {type === 'noise' ? 'Where is it coming from?' : type === 'work_order' ? 'Where in your home?' : 'Where?'}
          </Label>
          <input id="request-location" value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} maxLength={120}
            placeholder={type === 'noise' ? 'Unit above, unit 14C, hallway, outside…' : type === 'work_order' ? 'Kitchen sink, bathroom ceiling…' : 'Lobby, garage level 2, gym…'} />
        </div>

        {type === 'noise' && (
          <div style={field}>
            <Label>Is it happening right now?</Label>
            <YesNo value={happeningNow} onChange={setHappeningNow} yes="Yes, right now" no="No, it stopped" name="Happening now" />
          </div>
        )}

        <div style={field}>
          <Label htmlFor="request-description">Tell us what's going on</Label>
          <textarea id="request-description" data-testid="request-description" value={description} onChange={e => { setDescription(e.target.value); setError(''); }} rows={5} maxLength={4000}
            placeholder={type === 'noise' ? 'Loud music since 11 PM, it shakes the floor…' : type === 'work_order' ? 'Water dripping under the sink, getting worse…' : 'The lobby light by the mailboxes is out…'}
            style={{ ...inputStyle, minHeight: 130, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        {type === 'work_order' && (
          <>
            <div style={field}>
              <Label>Can maintenance come in if no one is home?</Label>
              <YesNo value={permission} onChange={setPermission} yes="Yes, they can" no="Only when I'm home" name="Permission to enter" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: wide ? '1fr 1fr' : '1fr', gap: 16 }}>
              <div style={field}>
                <Label htmlFor="request-pets" optional>Pets in the home</Label>
                <input id="request-pets" value={pets} onChange={e => setPets(e.target.value)} style={inputStyle} maxLength={120} placeholder="One cat, stays in the bedroom" />
              </div>
              <div style={field}>
                <Label htmlFor="request-time" optional>Best time to come</Label>
                <input id="request-time" value={bestTime} onChange={e => setBestTime(e.target.value)} style={inputStyle} maxLength={120} placeholder="Weekdays after 5 PM" />
              </div>
            </div>
          </>
        )}

        <div style={field}>
          <Label optional>Photos</Label>
          <PhotoPicker photos={photos} setPhotos={setPhotos} />
        </div>

        {type === 'work_order' && urgency === 'emergency' && <EmergencyNote home={home} />}
        {error && <p role="alert" style={{ margin: 0, padding: '12px 14px', borderRadius: 12, background: '#FFF1F0', color: RED, fontSize: 14, fontWeight: 650 }}>{error}</p>}

        <button type="submit" disabled={sending} data-testid="send-request"
          style={{ minHeight: 56, borderRadius: 16, border: 0, background: sending ? MUTED : ACCENT, color: '#fff', fontFamily: INTER, fontSize: 16, fontWeight: 800, cursor: sending ? 'wait' : 'pointer', boxShadow: sending ? 'none' : `0 10px 26px ${ACCENT}38` }}>
          {sending ? 'Sending…' : type === 'work_order' ? 'Send to maintenance' : 'Send to the front desk'}
        </button>
      </div>
    </form>
  );
}

function SentScreen({ request, go, wide }) {
  return (
    <section data-testid="request-sent" style={{ textAlign: 'center', padding: wide ? '40px 0' : '28px 0' }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, margin: '0 auto 22px', background: '#E9F7EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={34} color={GREEN} /></div>
      <h1 style={{ margin: 0, fontSize: wide ? 38 : 30, fontWeight: 800, letterSpacing: '-.04em', color: TEXT }}>{request.request_type === 'work_order' ? 'Sent to maintenance' : 'Sent to the front desk'}</h1>
      <p style={{ margin: '12px auto 0', maxWidth: 420, fontSize: 15, lineHeight: 1.6, color: MUTED }}>
        Logged {when(request.created_at)}. Your reference is <strong style={{ color: TEXT }}>#{request.reference}</strong>. You'll get an email when it's resolved.
      </p>
      <div style={{ marginTop: 26, display: 'flex', flexDirection: wide ? 'row' : 'column', gap: 10, justifyContent: 'center' }}>
        <button type="button" onClick={() => go(`requests/${request.request_id}`)} style={{ minHeight: 52, padding: '0 22px', borderRadius: 16, border: 0, background: TEXT, color: '#fff', fontFamily: INTER, fontSize: 15, fontWeight: 750, cursor: 'pointer' }}>Follow this request</button>
        <button type="button" onClick={() => go('')} style={{ minHeight: 52, padding: '0 22px', borderRadius: 16, border: `1px solid ${BORDER}`, background: '#fff', color: TEXT, fontFamily: INTER, fontSize: 15, fontWeight: 750, cursor: 'pointer' }}>Back home</button>
      </div>
    </section>
  );
}

function RequestDetail({ id, go, wide }) {
  const [request, setRequest] = useState(null);
  const [failed, setFailed] = useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () => authApi.getMyRequest(id).then(r => alive && setRequest(r)).catch(() => alive && setFailed(true));
    load();
    const timer = setInterval(load, 30000);
    return () => { alive = false; clearInterval(timer); };
  }, [id]);

  const back = (
    <button type="button" onClick={() => go('')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: 0, border: 0, background: 'none', color: TEXT, fontFamily: INTER, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
      <ArrowLeft size={17} /> My requests
    </button>
  );
  if (failed) return <>{back}<p style={{ fontSize: 15, color: MUTED }}>This request could not be found.</p></>;
  if (!request) return <>{back}<div style={{ height: 220, borderRadius: 20, background: SOFT }} /></>;

  const details = [
    request.location && ['Where', request.location],
    request.request_type === 'noise' && request.happening_now !== null && ['Happening when sent', request.happening_now ? 'Yes' : 'No'],
    request.urgency && ['Urgency', URGENCY.find(u => u.id === request.urgency)?.label || request.urgency],
    request.permission_to_enter !== null && request.permission_to_enter !== undefined && ['Entry', request.permission_to_enter ? 'OK to enter if no one is home' : 'Only when someone is home'],
    request.pets && ['Pets', request.pets],
    request.best_time && ['Best time', request.best_time],
  ].filter(Boolean);
  const done = !OPEN_STATUSES.includes(request.status);
  const isWorkOrder = request.request_type === 'work_order';
  const eventText = isWorkOrder ? WORK_ORDER_EVENT_TEXT : EVENT_TEXT;
  const waitingText = isWorkOrder
    ? (request.status === 'open' ? 'Waiting for maintenance' : request.status === 'on_hold' ? 'Waiting to start again' : 'Waiting for maintenance to finish')
    : (request.status === 'pending' ? 'Waiting for the front desk' : 'Waiting to be resolved');
  const steps = [...request.timeline];
  if (!done) steps.push({ event: 'next', at: null });

  return (
    <article data-testid="request-detail">
      {back}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <Eyebrow>#{request.reference}</Eyebrow>
          <h1 style={{ margin: 0, fontSize: wide ? 36 : 28, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-.04em', color: TEXT }}>{request.type_label}{request.kind ? ` · ${request.kind}` : ''}</h1>
        </div>
        <StatusPill request={request} />
      </div>

      {request.reply && (
        <div data-testid="request-reply" style={{ marginTop: 20, padding: '16px 18px', borderRadius: 18, background: '#E9F7EF' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: GREEN, marginBottom: 6 }}>From the front desk</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: TEXT }}>{request.reply}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: wide ? 'minmax(0,1.1fr) minmax(0,1fr)' : '1fr', gap: 16, marginTop: 20, alignItems: 'start' }}>
        <section aria-label="Timeline" style={{ padding: '18px 18px 6px', borderRadius: 20, border: `1px solid ${BORDER}`, background: '#fff' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: TEXT }}>Timeline</h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {steps.map((step, i) => {
              const pending = step.event === 'next';
              const last = i === steps.length - 1;
              return (
                <li key={i} data-testid={pending ? undefined : 'timeline-step'} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0,1fr)', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ width: 12, height: 12, marginTop: 4, borderRadius: '50%', background: pending ? '#fff' : (step.event === 'resolved' || step.event === 'completed') ? GREEN : TEXT, border: pending ? `2px solid ${BORDER}` : 0 }} />
                    {!last && <span style={{ flex: 1, width: 2, background: BORDER, minHeight: 26 }} />}
                  </div>
                  <div style={{ paddingBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: pending ? MUTED : TEXT }}>{pending ? waitingText : eventText[step.event] || step.event}</div>
                    {step.event === 'on_hold' && request.status === 'on_hold' && request.hold_reason && <div style={{ marginTop: 2, fontSize: 13, color: ORANGE, fontWeight: 650 }}>{request.hold_reason}</div>}
                    {step.at && <div style={{ marginTop: 2, fontSize: 13, color: MUTED }}>{when(step.at)}</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label="What you sent" style={{ padding: 18, borderRadius: 20, background: SOFT }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800, color: TEXT }}>What you sent</h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: TEXT, whiteSpace: 'pre-wrap' }}>{request.description}</p>
          {details.length > 0 && (
            <dl style={{ margin: '14px 0 0', display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '8px 14px', fontSize: 13 }}>
              {details.map(([k, v]) => <React.Fragment key={k}><dt style={{ color: MUTED, fontWeight: 650 }}>{k}</dt><dd style={{ margin: 0, color: TEXT }}>{v}</dd></React.Fragment>)}
            </dl>
          )}
          {request.photos?.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {request.photos.map((url, i) => (
                <button key={i} type="button" onClick={() => setPhoto(url)} style={{ width: 76, height: 76, padding: 0, borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}`, cursor: 'zoom-in', background: '#fff' }}>
                  <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {photo && (
        <div role="dialog" aria-modal="true" aria-label="Photo" onClick={() => setPhoto(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={photo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12 }} />
        </div>
      )}
    </article>
  );
}

// ── The app ──────────────────────────────────────────────────────────────────

export function ResidentApp({ user, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const wide = useIsWide();
  const [home, setHome] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // /app/new/<type>, /app/requests/<id>, /app/sent, anything else is home.
  const route = useMemo(() => {
    const parts = location.pathname.replace(/^\/app\/?/, '').split('/');
    if (parts[0] === 'new' && TYPES[parts[1]]) return { view: 'new', type: parts[1] };
    if (parts[0] === 'requests' && parts[1]) return { view: 'request', id: parts[1] };
    if (parts[0] === 'sent') return { view: 'sent' };
    return { view: 'home' };
  }, [location.pathname]);
  const go = useCallback((path) => { window.scrollTo(0, 0); navigate(`/app/${path || 'today'}`); }, [navigate]);

  const loadRequests = useCallback(() => authApi.getMyRequests().then(setRequests).catch(() => {}).finally(() => setLoading(false)), []);
  useEffect(() => {
    authApi.getResidentHome().then(setHome).catch(() => {});
    loadRequests();
    const timer = setInterval(loadRequests, 30000);
    const onFocus = () => loadRequests();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [loadRequests]);

  const propertyName = home?.property_name || user?.property_name || 'Your building';
  const initials = String(home?.name || user?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', color: TEXT, fontFamily: INTER }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 60, display: 'grid', gridTemplateColumns: '44px minmax(0,1fr) 44px', alignItems: 'center' }}>
          <button type="button" aria-label="Home" onClick={() => go('')} style={{ width: 44, height: 44, border: 0, background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', cursor: 'pointer', padding: 0 }}><Home size={22} color={TEXT} /></button>
          <div data-testid="resident-property" style={{ textAlign: 'center', fontSize: 15, fontWeight: 800, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{propertyName}</div>
          <div style={{ position: 'relative', justifySelf: 'end' }}>
            <button type="button" aria-label="Account" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)} data-testid="resident-account"
              style={{ width: 38, height: 38, borderRadius: '50%', border: 0, background: `${ACCENT}14`, color: ACCENT, fontFamily: INTER, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>{initials}</button>
            {menuOpen && (
              <div role="menu" style={{ position: 'absolute', right: 0, top: 46, width: 250, padding: 8, borderRadius: 16, background: '#fff', border: `1px solid ${BORDER}`, boxShadow: '0 12px 36px rgba(0,0,0,.14)' }}>
                <div style={{ padding: '10px 12px 12px', borderBottom: `1px solid ${BORDER}`, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{home?.name || user?.name}</div>
                  <div style={{ marginTop: 2, fontSize: 13, color: MUTED }}>Unit {home?.unit || user?.unit} · {home?.email || user?.email}</div>
                </div>
                <button type="button" role="menuitem" onClick={onSignOut} data-testid="resident-signout"
                  style={{ width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', border: 0, borderRadius: 10, background: 'none', color: TEXT, fontFamily: INTER, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  <LogOut size={17} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: route.view === 'request' ? 960 : 760, margin: '0 auto', padding: wide ? '36px 24px 64px' : '22px 16px 48px' }} onClick={() => menuOpen && setMenuOpen(false)}>
        {route.view === 'new' && (
          <RequestForm key={route.type} type={route.type} home={home} wide={wide} onCancel={() => go('')}
            onSent={(request) => { setSent(request); setRequests(r => [request, ...r]); go('sent'); }} />
        )}
        {route.view === 'sent' && (sent ? <SentScreen request={sent} go={go} wide={wide} /> : <HomeScreen home={home} requests={requests} loading={loading} wide={wide} go={go} />)}
        {route.view === 'request' && <RequestDetail id={route.id} go={go} wide={wide} />}
        {route.view === 'home' && <HomeScreen home={home} requests={requests} loading={loading} wide={wide} go={go} />}
      </main>
    </div>
  );
}

export default ResidentApp;
