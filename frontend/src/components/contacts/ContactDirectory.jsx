import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Building2, Check, Pencil, Phone, Plus, Star, Trash2, UserCheck, Users, X } from 'lucide-react';
import { CONTACT_GROUPS } from '../../services/authApi';

// Numbers every desk keeps, whatever the manager adds.
export const FIXED_EMERGENCY_NUMBERS = [
  { id: 'fixed-911', label: 'Police / Fire / EMS', number: '911', urgent: true, fixed: true },
  { id: 'fixed-poison', label: 'Poison Control', number: '(800) 222-1222', fixed: true },
];

const GROUP_STYLE = {
  'Emergency services': { Icon: AlertTriangle, tone: 'danger', title: 'Emergency Numbers' },
  'Staff':              { Icon: UserCheck,     tone: 'accent', title: 'Staff' },
  'Building & vendors': { Icon: Building2,     tone: 'warning', title: 'Building & Vendors' },
};

const toneOf = (colors, tone) => colors[tone] || colors.accent;
const telHref = number => `tel:${String(number || '').replace(/[^\d+]/g, '')}`;

/** Splits the manager's contacts into the groups the desk reads, emergency first. */
export function groupContacts(contacts) {
  const groups = new Map(CONTACT_GROUPS.map(name => [name, []]));
  contacts.forEach(c => {
    const name = c.category || 'Building & vendors';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(c);
  });
  return Array.from(groups.entries()).map(([name, items]) => ({ name, items }));
}

const SectionHeader = ({ Icon, color, title, count, colors }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={20} color={color} />
      <h2 style={{ fontWeight: 700, color: colors.text, fontSize: 17, margin: 0 }}>{title}</h2>
    </div>
    <span style={{ width: 32, height: 32, borderRadius: '50%', background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: colors.muted, flexShrink: 0 }}>{count}</span>
  </div>
);

function ContactRow({ contact, color, colors, isPhone, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const urgent = !!contact.urgent;
  const iconBtn = { width: 40, height: 40, borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
  return (
    <div style={{ background: colors.card, border: `1px solid ${urgent ? 'rgba(255,59,48,0.35)' : confirming ? colors.danger : colors.border}`, borderRadius: 16, padding: isPhone ? 16 : 18, boxShadow: urgent ? '0 4px 20px rgba(255,59,48,0.08)' : colors.shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: isPhone ? 'wrap' : 'nowrap', gap: isPhone ? 12 : 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: urgent ? 'rgba(255,59,48,0.10)' : `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Phone size={22} color={urgent ? colors.danger : color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: colors.text, fontSize: 15, margin: '0 0 2px', overflowWrap: 'anywhere' }}>{contact.label}</p>
          {contact.role && <p style={{ fontSize: 13, color: colors.muted, margin: '0 0 2px' }}>{contact.role}</p>}
          <p style={{ fontSize: 14, color: colors.muted, margin: 0 }}>{contact.number}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: isPhone ? 64 : 0 }}>
          <a aria-label={`Call ${contact.label} at ${contact.number}`} href={telHref(contact.number)}
            style={{ minHeight: 40, padding: '0 18px', background: urgent ? colors.danger : colors.accent, color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Call
          </a>
          {onEdit && !contact.fixed && (
            <button type="button" aria-label={`Edit ${contact.label}`} title="Edit" onClick={() => onEdit(contact)} style={iconBtn}><Pencil size={15} color={colors.muted} /></button>
          )}
          {onDelete && !contact.fixed && (
            <button type="button" aria-label={`Delete ${contact.label}`} title="Delete" onClick={() => setConfirming(true)} style={iconBtn}><Trash2 size={15} color={colors.danger} /></button>
          )}
        </div>
      </div>
      {confirming && (
        <div role="alert" style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ flex: '1 1 200px', fontSize: 14, color: colors.text, margin: 0 }}>Delete <b>{contact.label}</b>? The desk will no longer see this number.</p>
          <button type="button" onClick={() => setConfirming(false)} style={{ minHeight: 40, padding: '0 16px', borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.text, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Keep</button>
          <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await onDelete(contact); } finally { setBusy(false); setConfirming(false); } }}
            style={{ minHeight: 40, padding: '0 16px', borderRadius: 10, border: 'none', background: colors.danger, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The property's contact directory, grouped. The manager passes onEdit and
 * onDelete; the desk passes neither and gets the same list, read-only.
 * `afterEmergency` is rendered right after the emergency numbers (the team list).
 */
export function ContactGroups({ contacts, colors, isPhone, onEdit, onDelete, afterEmergency = null }) {
  const groups = groupContacts(contacts);
  return (
    <>
      {groups.map(({ name, items }) => {
        const isEmergency = name === 'Emergency services';
        const rows = isEmergency ? [...FIXED_EMERGENCY_NUMBERS, ...items] : items;
        if (!rows.length) return null;
        const style = GROUP_STYLE[name] || { Icon: Star, tone: 'warning', title: name };
        const color = toneOf(colors, style.tone);
        return (
          <React.Fragment key={name}>
            <section aria-label={style.title}>
              <SectionHeader Icon={style.Icon} color={color} title={style.title} count={rows.length} colors={colors} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rows.map(c => <ContactRow key={c.id} contact={c} color={isEmergency ? colors.muted : color} colors={colors} isPhone={isPhone} onEdit={onEdit} onDelete={onDelete} />)}
              </div>
            </section>
            {isEmergency && afterEmergency}
          </React.Fragment>
        );
      })}
    </>
  );
}

const GROUP_CHOICES = [
  { id: 'Emergency services', Icon: AlertTriangle, hint: '911, fire, police, hospital, security company' },
  { id: 'Staff',              Icon: Users,         hint: 'Managers, maintenance, porters, on-call staff' },
  { id: 'Building & vendors', Icon: Building2,     hint: 'Elevator company, locksmith, plumber, utilities' },
  { id: '__custom__',         Icon: Plus,          hint: 'Name your own group' },
];

/** Add or edit one contact. `team` is the property's people, so staff can be picked instead of typed. */
export function ContactForm({ initial, team = [], colors, onSave, onCancel }) {
  const preset = initial?.category && !CONTACT_GROUPS.includes(initial.category);
  const [group, setGroup] = useState(preset ? '__custom__' : (initial?.category || 'Emergency services'));
  const [customGroup, setCustomGroup] = useState(preset ? initial.category : '');
  const [draft, setDraft] = useState({ label: initial?.label || '', number: initial?.number || '', role: initial?.role || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);
  useEffect(() => { formRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' }); }, []);
  const category = group === '__custom__' ? customGroup.trim() : group;
  const canSave = !!draft.label.trim() && /\d/.test(draft.number) && !!category && !saving;
  const staffChoices = team.filter(m => m.phone);
  const input = (filled) => ({ width: '100%', padding: '14px 16px', background: colors.surface, borderRadius: 12, border: `1.5px solid ${filled ? colors.accent : colors.border}`, color: colors.text, outline: 'none', fontSize: 16, boxSizing: 'border-box', fontFamily: 'inherit' });
  const label = { fontSize: 13, fontWeight: 700, color: colors.text, display: 'block', marginBottom: 8 };

  const save = async () => {
    if (!canSave) return;
    setSaving(true); setError('');
    try {
      await onSave({ label: draft.label.trim(), number: draft.number.trim(), role: draft.role.trim(), category });
    } catch (e) {
      setError(typeof e?.response?.data?.detail === 'string' ? e.response.data.detail : 'The contact could not be saved. Check your connection and try again.');
      setSaving(false);
    }
  };

  return (
    <div ref={formRef} style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 18, scrollMarginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: colors.text, margin: 0 }}>{initial?.id ? 'Edit contact' : 'New contact'}</p>
        <button type="button" onClick={onCancel} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 10, background: colors.surface, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={15} color={colors.muted} /></button>
      </div>

      <div>
        <span style={label}>What kind of contact?</span>
        <div role="radiogroup" aria-label="Contact group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8 }}>
          {GROUP_CHOICES.map(({ id, Icon, hint }) => {
            const on = group === id;
            return (
              <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setGroup(id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, textAlign: 'left', cursor: 'pointer', background: on ? `${colors.accent}0D` : colors.card, border: `1.5px solid ${on ? colors.accent : colors.border}` }}>
                <Icon size={18} color={on ? colors.accent : colors.muted} style={{ flexShrink: 0 }} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: colors.text }}>{id === '__custom__' ? 'Your own label' : id}</span>
                  <span style={{ display: 'block', fontSize: 12, color: colors.muted, lineHeight: 1.35 }}>{hint}</span>
                </span>
                {on && <Check size={16} color={colors.accent} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
        {group === '__custom__' && (
          <input aria-label="Group name" value={customGroup} maxLength={40} onChange={e => setCustomGroup(e.target.value)} placeholder="e.g. Elevator company, After-hours line"
            style={{ ...input(!!customGroup), marginTop: 10 }} />
        )}
      </div>

      {group === 'Staff' && !initial?.id && staffChoices.length > 0 && (
        <div>
          <span style={label}>Pick from your team</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {staffChoices.map(m => {
              const on = draft.label === m.name && draft.number === m.phone;
              return (
                <button key={m.id || m.name} type="button" onClick={() => setDraft({ label: m.name, number: m.phone, role: m.title || '' })}
                  style={{ minHeight: 40, padding: '0 14px', borderRadius: 999, border: `1.5px solid ${on ? colors.accent : colors.border}`, background: on ? `${colors.accent}0D` : colors.surface, color: colors.text, fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
                  {m.name}{m.title ? ` · ${m.title}` : ''}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: colors.muted, margin: '8px 0 0' }}>Or type someone who is not on Noted below.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label htmlFor="contact-label" style={label}>Name</label>
          <input id="contact-label" value={draft.label} maxLength={80} onChange={e => setDraft(d => ({ ...d, label: e.target.value }))} placeholder="e.g. Night Security, Otis Elevator, Jordan Miles" style={input(!!draft.label)} />
        </div>
        <div>
          <label htmlFor="contact-number" style={label}>Phone number</label>
          <input id="contact-number" type="tel" value={draft.number} maxLength={40} onChange={e => setDraft(d => ({ ...d, number: e.target.value }))} placeholder="e.g. (215) 555-0199" style={input(!!draft.number)} />
        </div>
        <div>
          <label htmlFor="contact-role" style={label}>Role or note <span style={{ fontWeight: 500, color: colors.muted }}>(optional)</span></label>
          <input id="contact-role" value={draft.role} maxLength={80} onChange={e => setDraft(d => ({ ...d, role: e.target.value }))} placeholder="e.g. Call first for elevator outages" style={input(!!draft.role)} />
        </div>
      </div>

      {error && <p role="alert" style={{ fontSize: 13, fontWeight: 600, color: colors.danger, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '13px 0', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, color: colors.text, cursor: 'pointer' }}>Cancel</button>
        <button type="button" onClick={save} disabled={!canSave}
          style={{ flex: 2, padding: '13px 0', background: canSave ? colors.accent : colors.surface, border: canSave ? 'none' : `1px solid ${colors.border}`, borderRadius: 12, fontSize: 14, fontWeight: 700, color: canSave ? 'white' : colors.muted, cursor: canSave ? 'pointer' : 'not-allowed' }}>
          {saving ? 'Saving…' : initial?.id ? 'Save changes' : 'Add contact'}
        </button>
      </div>
    </div>
  );
}
