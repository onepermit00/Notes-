import React, { useState } from 'react';
import { UserCheck, MessageCircle, Clock, Check, LogOut, User, UtensilsCrossed, Package, Wrench, Truck, HelpCircle, Camera, Plus, X, Calendar, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ResidentSearchInput from './ResidentSearchInput';
import MicButton from './MicButton';

const GREEN  = '#34C759';
const BLUE   = '#FF385C';
const ORANGE = '#FF9500';

const PREREG_KEY = 'adltrack_preregs';
const loadPreRegs = () => { try { return JSON.parse(localStorage.getItem(PREREG_KEY)) || []; } catch { return []; } };
const savePreRegs = items => localStorage.setItem(PREREG_KEY, JSON.stringify(items));

const now = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const PURPOSE_CONFIG = [
  { id: 'Personal Visit',        Icon: User,            desc: 'Friend, family, or social visit'         },
  { id: 'Food Delivery',         Icon: UtensilsCrossed, desc: 'DoorDash, Uber Eats, Grubhub, etc.'      },
  { id: 'Package Delivery',      Icon: Package,         desc: 'Parcel or courier drop-off'               },
  { id: 'Service / Maintenance', Icon: Wrench,          desc: 'Contractor or home service visit'         },
  { id: 'Moving Assistance',     Icon: Truck,           desc: 'Move-in, move-out or movers'              },
  { id: 'Other',                 Icon: HelpCircle,      desc: 'Other reason not listed above'            },
];

function Label({ children }) {
  const { colors } = useTheme();
  const { MUTED, INTER } = colors;
  return (
    <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function WizardHeader({ title, step, totalSteps, onCancel }) {
  const { colors } = useTheme();
  const { CARD, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <div style={{ flexShrink: 0, background: CARD, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>{title}</div>
          <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 3 }}>Step {step} of {totalSteps}</div>
        </div>
        <button onClick={onCancel} style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 2 }}>
          Cancel
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4, padding: '0 20px 14px' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? BLUE : BORDER, transition: 'background 200ms' }} />
        ))}
      </div>
    </div>
  );
}

function WizardFooter({ onBack, onContinue, continueLabel = 'Continue', continueDisabled = false, isFirst = false }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <div style={{ flexShrink: 0, padding: '12px 20px 24px', background: CARD, borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 10 }}>
      {!isFirst && (
        <button onClick={onBack}
          style={{ flex: 1, padding: '15px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>
          Back
        </button>
      )}
      <button onClick={onContinue} disabled={continueDisabled}
        style={{ flex: 1, padding: '15px 0', background: continueDisabled ? CARD2 : BLUE, border: continueDisabled ? `1px solid ${BORDER}` : 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: continueDisabled ? MUTED : 'white', cursor: continueDisabled ? 'not-allowed' : 'pointer', boxShadow: continueDisabled ? 'none' : `0 6px 20px ${BLUE}28` }}>
        {continueLabel}
      </button>
    </div>
  );
}

export const GuestsDashboard = ({ onActivityLogged }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const STATUS_STYLES = {
    waiting:  { bg: 'rgba(255,149,0,0.10)',   color: ORANGE, label: 'Waiting'  },
    notified: { bg: 'rgba(255,56,92,0.10)',   color: BLUE,   label: 'Notified' },
    departed: { bg: 'rgba(113,113,113,0.10)', color: MUTED,  label: 'Departed' },
  };
  const [guests,   setGuests]   = useState([]);
  const [view,     setView]     = useState('list');
  const [gStep,    setGStep]    = useState(1);
  const [form,     setForm]     = useState({ guestName: '', residentName: '', unit: '', purpose: '', notes: '', photo: null, photoPreview: null });
  const [toastId,  setToastId]  = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [notesInterim, setNotesInterim] = useState('');

  // Pre-registration state
  const [preRegs,  setPreRegs]  = useState(loadPreRegs);
  const [prStep,   setPrStep]   = useState(1);
  const [prForm,   setPrForm]   = useState({ guestName: '', residentName: '', unit: '', purpose: '', notes: '', expectedTime: '' });

  const showToast = (msg, guestId) => {
    setToastId(guestId);
    setToastMsg(msg);
    setTimeout(() => setToastId(null), 3000);
  };

  const goBack = () => {
    setView('list');
    setGStep(1);
    setForm({ guestName: '', residentName: '', unit: '', purpose: '', notes: '', photo: null, photoPreview: null });
  };

  const goBackPr = () => {
    setView('list');
    setPrStep(1);
    setPrForm({ guestName: '', residentName: '', unit: '', purpose: '', notes: '', expectedTime: '' });
  };

  const logGuest = () => {
    if (!form.guestName.trim() || !form.residentName.trim() || !form.unit.trim()) return;
    const entry = {
      id:           Date.now(),
      guestName:    form.guestName.trim(),
      residentName: form.residentName.trim(),
      unit:         form.unit.trim(),
      purpose:      form.purpose.trim(),
      arrivedAt:    now(),
      status:       'waiting',
      notifiedAt:   null,
      departedAt:   null,
    };
    setGuests(prev => [entry, ...prev]);
    const arrivalNotes = [entry.purpose, form.notes.trim()].filter(Boolean).join('. ');
    onActivityLogged?.({ title: `Guest arrival · ${entry.guestName} → ${entry.residentName} · Unit ${entry.unit}`, category: 'Resident Assist', notes: arrivalNotes, evidenceUrls: form.photoPreview ? [form.photoPreview] : [] });
    goBack();
    showToast(`Guest logged · Notify ${entry.residentName} now`, entry.id);
  };

  const submitPreReg = () => {
    if (!prForm.guestName.trim() || !prForm.residentName.trim() || !prForm.unit.trim()) return;
    const entry = { ...prForm, id: Date.now(), createdAt: now(), status: 'pending' };
    const next = [entry, ...preRegs];
    setPreRegs(next);
    savePreRegs(next);
    goBackPr();
    showToast(`${prForm.guestName} pre-registered for ${prForm.expectedTime || 'today'}`, entry.id);
  };

  const checkInPreReg = (pr) => {
    // Remove from pre-reg list
    const next = preRegs.filter(p => p.id !== pr.id);
    setPreRegs(next);
    savePreRegs(next);
    // Add to active guests
    const entry = {
      id:           Date.now(),
      guestName:    pr.guestName,
      residentName: pr.residentName,
      unit:         pr.unit,
      purpose:      pr.purpose,
      arrivedAt:    now(),
      status:       'waiting',
      notifiedAt:   null,
      departedAt:   null,
    };
    setGuests(prev => [entry, ...prev]);
    const preRegNotes = [pr.purpose, pr.notes?.trim()].filter(Boolean).join('. ');
    onActivityLogged?.({ title: `Guest check-in (pre-reg) · ${pr.guestName} → ${pr.residentName} · Unit ${pr.unit}`, category: 'Resident Assist', notes: preRegNotes });
    showToast(`${pr.guestName} checked in from pre-registration`, entry.id);
  };

  const cancelPreReg = (id) => {
    const next = preRegs.filter(p => p.id !== id);
    setPreRegs(next);
    savePreRegs(next);
  };

  const notifyResident = (id) => {
    const guest = guests.find(g => g.id === id);
    if (!guest) return;
    setGuests(prev => prev.map(g => g.id === id ? { ...g, status: 'notified', notifiedAt: now() } : g));
    showToast(`Text sent to ${guest.residentName} · Unit ${guest.unit}`, id);
  };

  const markDeparted = (id) => {
    setGuests(prev => {
      const entry = prev.find(g => g.id === id);
      if (entry) {
        onActivityLogged?.({
          title: `Guest departure · ${entry.guestName} → ${entry.residentName} · Unit ${entry.unit}`,
          category: 'Resident Assist',
          notes: entry.purpose || ''
        });
      }
      return prev.map(g => g.id === id ? { ...g, status: 'departed', departedAt: now() } : g);
    });
  };

  // ── PRE-REGISTRATION WIZARD ───────────────────────────────────────────────
  if (view === 'prereg') {
    if (prStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Pre-register Visitor" step={1} totalSteps={2} onCancel={goBackPr} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is expected?
          </h2>
          <div>
            <Label>Visitor Name *</Label>
            <input type="text" placeholder="Full name of expected visitor" value={prForm.guestName} onChange={e => setPrForm(p => ({ ...p, guestName: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Expected Arrival Time <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>(optional)</span></Label>
            <input type="time" value={prForm.expectedTime} onChange={e => setPrForm(p => ({ ...p, expectedTime: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Purpose <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>(optional)</span></Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PURPOSE_CONFIG.map(({ id, Icon, desc }) => {
                const sel = prForm.purpose === id;
                return (
                  <button key={id} onClick={() => setPrForm(p => ({ ...p, purpose: p.purpose === id ? '' : id }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: sel ? 'rgba(255,56,92,0.04)' : CARD, border: `1.5px solid ${sel ? BLUE : BORDER}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 150ms' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: sel ? 'rgba(255,56,92,0.12)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={sel ? BLUE : MUTED} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{id}</div>
                      <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 1 }}>{desc}</div>
                    </div>
                    {sel && <div style={{ width: 22, height: 22, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={12} color="white" strokeWidth={3} /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <WizardFooter isFirst onContinue={() => setPrStep(2)} continueDisabled={!prForm.guestName.trim()} />
      </div>
    );

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Pre-register Visitor" step={2} totalSteps={2} onCancel={goBackPr} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Which resident are they visiting?
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: CARD2, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            <Calendar size={16} color={BLUE} />
            <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: TEXT }}>{prForm.guestName}</span>
            {prForm.expectedTime && <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>· Expected {prForm.expectedTime}</span>}
          </div>
          <div>
            <Label>Search Resident (optional)</Label>
            <ResidentSearchInput
              colors={{ CARD, CARD2, BORDER, TEXT, MUTED, SHADOW }} INTER={INTER}
              placeholder="Search by name or unit to auto-fill…"
              onSelect={r => r ? setPrForm(p => ({ ...p, residentName: r.name || p.residentName, unit: r.unit || p.unit })) : null}
            />
          </div>
          <div>
            <Label>Resident Name *</Label>
            <input type="text" placeholder="Name of resident being visited" value={prForm.residentName} onChange={e => setPrForm(p => ({ ...p, residentName: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Unit Number *</Label>
            <input type="text" placeholder="e.g. 412" value={prForm.unit} onChange={e => setPrForm(p => ({ ...p, unit: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ background: 'rgba(255,56,92,0.06)', border: '1px solid rgba(255,56,92,0.18)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Bell size={15} color={BLUE} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
              When this visitor arrives, tap <strong style={{ color: TEXT }}>Check In</strong> on their pre-registration card to log their arrival instantly.
            </span>
          </div>
        </div>
        <WizardFooter onBack={() => setPrStep(1)} onContinue={submitPreReg} continueLabel="Save Pre-registration" continueDisabled={!prForm.residentName.trim() || !prForm.unit.trim()} />
      </div>
    );
  }

  // ── LOG GUEST WIZARD ──────────────────────────────────────────────────────
  if (view === 'form') {
    if (gStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Guest Arrival" step={1} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is visiting?
          </h2>
          <div>
            <Label>Guest Name *</Label>
            <input type="text" placeholder="Full name of visitor" value={form.guestName} onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Purpose of Visit <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>(optional)</span></Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PURPOSE_CONFIG.map(({ id, Icon, desc }) => {
                const sel = form.purpose === id;
                return (
                  <button key={id} onClick={() => setForm(p => ({ ...p, purpose: p.purpose === id ? '' : id }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: sel ? 'rgba(255,56,92,0.04)' : CARD, border: `1.5px solid ${sel ? BLUE : BORDER}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: sel ? `0 0 0 3px rgba(255,56,92,0.10)` : 'none', transition: 'all 150ms' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: sel ? 'rgba(255,56,92,0.12)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}>
                      <Icon size={24} color={sel ? BLUE : MUTED} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{id}</div>
                      <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                    </div>
                    {sel && <div style={{ width: 26, height: 26, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={13} color="white" strokeWidth={3} /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <WizardFooter isFirst onContinue={() => setGStep(2)} continueDisabled={!form.guestName.trim()} />
      </div>
    );

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Guest Arrival" step={2} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who are they here to see?
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: CARD2, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            <UserCheck size={16} color={BLUE} />
            <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: TEXT }}>{form.guestName}</span>
            {form.purpose && <><span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>·</span><span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>{form.purpose}</span></>}
          </div>
          <div>
            <Label>Search Resident (optional)</Label>
            <ResidentSearchInput
              colors={{ CARD, CARD2, BORDER, TEXT, MUTED, SHADOW }} INTER={INTER}
              placeholder="Search by name or unit to auto-fill…"
              onSelect={r => r ? setForm(p => ({ ...p, residentName: r.name || p.residentName, unit: r.unit || p.unit })) : null}
            />
          </div>
          <div>
            <Label>Resident Name *</Label>
            <input type="text" placeholder="Name of resident being visited" value={form.residentName} onChange={e => setForm(p => ({ ...p, residentName: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Unit Number *</Label>
            <input type="text" placeholder="e.g. 412" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Label>Notes <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>(optional — or use mic)</span></Label>
            <textarea
              value={form.notes + (notesInterim ? (form.notes ? ' ' : '') + notesInterim : '')}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="e.g. Guest arrived with luggage, went directly to elevator…"
              rows={3}
              style={{ width: '100%', padding: '14px 16px', paddingRight: 48, borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
            />
            <MicButton onTranscript={t => setForm(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} onInterim={setNotesInterim} />
          </div>
          <div>
            <Label>Photo <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>(optional)</span></Label>
            {form.photoPreview ? (
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                <img src={form.photoPreview} alt="Guest" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                <button onClick={() => setForm(p => ({ ...p, photo: null, photoPreview: null }))}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} color="white" />
                </button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: CARD2, border: `1px dashed ${BORDER}`, borderRadius: 12, cursor: 'pointer' }}>
                <Camera size={20} color={MUTED} />
                <span style={{ fontFamily: INTER, fontSize: 14, color: MUTED }}>Take or upload a photo</span>
                <input type="file" accept="image/*" capture="environment" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => setForm(p => ({ ...p, photo: file, photoPreview: reader.result }));
                  reader.readAsDataURL(file);
                }} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          <div style={{ background: 'rgba(255,56,92,0.06)', border: '1px solid rgba(255,56,92,0.18)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <MessageCircle size={16} color={BLUE} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
              After logging, tap <strong style={{ color: TEXT }}>Notify Resident</strong> on the guest card to send a text to {form.residentName || 'the resident'}.
            </span>
          </div>
        </div>
        <WizardFooter onBack={() => setGStep(1)} onContinue={logGuest} continueLabel="Log Guest & Notify" continueDisabled={!form.residentName.trim() || !form.unit.trim()} />
      </div>
    );
  }

  // ── GUEST LOG LIST VIEW ───────────────────────────────────────────────────
  const activeGuests   = guests.filter(g => g.status !== 'departed');
  const departedGuests = guests.filter(g => g.status === 'departed');
  const waitingCount   = guests.filter(g => g.status === 'waiting').length;
  const pendingPreRegs = preRegs.filter(p => p.status === 'pending');

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>

      {/* Toast */}
      {toastId && (
        <div style={{ margin: '12px 16px 0', background: TEXT, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Check size={16} color="white" />
          <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: 'white', flex: 1 }}>{toastMsg}</span>
        </div>
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Pre-registered visitors */}
        {pendingPreRegs.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={20} color={ORANGE} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Expected Today</h2>
              </div>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,149,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: ORANGE, fontFamily: INTER }}>{pendingPreRegs.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingPreRegs.map(pr => {
                const purposeCfg = PURPOSE_CONFIG.find(p => p.id === pr.purpose);
                const GIcon = purposeCfg?.Icon ?? UserCheck;
                return (
                  <div key={pr.id} style={{ background: CARD, border: `1.5px solid rgba(255,149,0,0.28)`, borderRadius: 16, padding: 16, boxShadow: '0 4px 16px rgba(255,149,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                      <div style={{ width: 48, height: 48, background: 'rgba(255,149,0,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <GIcon size={22} color={ORANGE} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                          <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{pr.guestName}</span>
                          <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: ORANGE, background: 'rgba(255,149,0,0.12)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pre-reg</span>
                        </div>
                        <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 3px' }}>
                          Visiting <span style={{ fontWeight: 600, color: TEXT }}>{pr.residentName}</span> · Unit {pr.unit}
                        </p>
                        {pr.expectedTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Clock size={11} color={MUTED} />
                            <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>Expected {pr.expectedTime}</span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => cancelPreReg(pr.id)}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <X size={13} color={MUTED} />
                      </button>
                    </div>
                    <button onClick={() => checkInPreReg(pr)}
                      style={{ width: '100%', padding: '12px 0', background: ORANGE, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                      <Check size={16} /> Check In Now
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {guests.length === 0 && pendingPreRegs.length === 0 && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,56,92,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <UserCheck size={28} color={BLUE} strokeWidth={1.5} />
            </div>
            <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 5px' }}>No guests logged</p>
            <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Tap "Log Guest" below or pre-register an expected visitor</p>
          </div>
        )}

        {/* In Lobby section */}
        {activeGuests.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={20} color={BLUE} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>In Lobby</h2>
              </div>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: waitingCount > 0 ? 'rgba(255,149,0,0.10)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: waitingCount > 0 ? ORANGE : MUTED, fontFamily: INTER }}>
                {activeGuests.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeGuests.map(g => {
                const st         = STATUS_STYLES[g.status];
                const isWaiting  = g.status === 'waiting';
                const isNotified = g.status === 'notified';
                const purposeCfg = PURPOSE_CONFIG.find(p => p.id === g.purpose);
                const GIcon      = purposeCfg?.Icon ?? UserCheck;
                return (
                  <div key={g.id} style={{ background: CARD, border: `1.5px solid ${isWaiting ? 'rgba(255,149,0,0.28)' : BORDER}`, borderRadius: 16, padding: 20, boxShadow: isWaiting ? '0 4px 16px rgba(255,149,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                      <div style={{ width: 56, height: 56, background: `${st.color}18`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <GIcon size={26} color={st.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT }}>{g.guestName}</span>
                          <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: st.color, background: st.bg, borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{st.label}</span>
                        </div>
                        <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 3px' }}>
                          Visiting <span style={{ fontWeight: 600, color: TEXT }}>{g.residentName}</span> · Unit {g.unit}
                        </p>
                        {g.purpose && <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: '0 0 4px', fontStyle: 'italic' }}>{g.purpose}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                          <Clock size={11} color={MUTED} />
                          <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>Arrived {g.arrivedAt}</span>
                          {g.notifiedAt && <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>· Notified {g.notifiedAt}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isWaiting && (
                        <button onClick={() => notifyResident(g.id)}
                          style={{ flex: 2, padding: '13px 0', background: BLUE, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 14px rgba(255,56,92,0.28)' }}>
                          <MessageCircle size={16} />Notify Resident
                        </button>
                      )}
                      {isNotified && (
                        <div style={{ flex: 2, padding: '13px 0', background: 'rgba(255,56,92,0.08)', border: `1px solid rgba(255,56,92,0.20)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                          <Check size={15} color={BLUE} />
                          <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: BLUE }}>Text Sent</span>
                        </div>
                      )}
                      <button onClick={() => markDeparted(g.id)}
                        style={{ flex: 1, padding: '13px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <LogOut size={15} />
                        {isNotified && 'Departed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Departed section */}
        {departedGuests.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LogOut size={20} color={MUTED} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Departed</h2>
              </div>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED, fontFamily: INTER }}>{departedGuests.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {departedGuests.map(g => {
                const purposeCfg = PURPOSE_CONFIG.find(p => p.id === g.purpose);
                const GIcon = purposeCfg?.Icon ?? UserCheck;
                return (
                  <div key={g.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, background: CARD2, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GIcon size={22} color={MUTED} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 2px' }}>{g.guestName}</p>
                      <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0 }}>Unit {g.unit} · Departed {g.departedAt}</p>
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={16} color={MUTED} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fixed CTA */}
      <div style={{ flexShrink: 0, padding: '12px 16px 20px', background: CARD, borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => setView('form')}
          style={{ width: '100%', padding: '16px 0', background: BLUE, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 16, fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 6px 20px rgba(255,56,92,0.32)' }}>
          <UserCheck size={20} />
          Log Guest Arrival
        </button>
        <button onClick={() => setView('prereg')}
          style={{ width: '100%', padding: '13px 0', background: 'rgba(255,149,0,0.08)', border: `1.5px solid rgba(255,149,0,0.3)`, borderRadius: 14, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: ORANGE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Calendar size={17} />
          Pre-register Expected Visitor
        </button>
      </div>
    </div>
  );
};

export default GuestsDashboard;
