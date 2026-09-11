import React, { useEffect, useState } from 'react';
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

function Label({ children, optional = false }) {
  const { colors } = useTheme();
  const { MUTED, INTER } = colors;
  return (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12,fontFamily:INTER,fontSize:14,fontWeight:800,color:colors.TEXT,marginBottom:9 }}>
      <span>{children}</span>{optional&&<span style={{fontSize:10,fontWeight:600,color:MUTED,letterSpacing:'.12em',textTransform:'uppercase'}}>Optional</span>}
    </div>
  );
}

function WizardHeader({ propertyName, title, description, step, totalSteps, onCancel, compact = false }) {
  const { colors } = useTheme();
  const { INTER, CARD, CARD2, BORDER, TEXT, MUTED } = colors;
  return (
    <div style={{ flexShrink:0, background:CARD, borderBottom:`1px solid ${BORDER}` }}>
      <div style={{ padding:compact?'20px 20px 14px':'26px 30px 18px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
        <div style={{minWidth:0}}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}><span style={{ width:24, height:2, background:BLUE }} /><span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.22em', textTransform:'uppercase' }}>{propertyName}</span></div>
          <div style={{ fontFamily:INTER, fontSize:compact?28:34, fontWeight:800, color:TEXT, letterSpacing:'-.045em', lineHeight:.98 }}>{title}</div>
          {description&&<div style={{maxWidth:470,fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.55,marginTop:9}}>{description}</div>}
          <div style={{ fontFamily:INTER, fontSize:11, color:MUTED, marginTop:8 }}>Step {step} of {totalSteps} · Visitor record</div>
        </div>
        <button onClick={onCancel} aria-label="Close visitor workflow" style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, color:TEXT, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}><X size={19} /></button>
      </div>
      <div style={{ display:'flex', gap:5, padding:compact?'0 20px 16px':'0 30px 20px' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i < step ? BLUE : BORDER, transition:'background 200ms' }} />
        ))}
      </div>
    </div>
  );
}

function WizardFooter({ onBack, onContinue, continueLabel = 'Continue', continueDisabled = false, isFirst = false, compact = false }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <div style={{ flexShrink:0, padding:compact?'12px 20px 30px':'14px 28px 20px', background:CARD, borderTop:`1px solid ${BORDER}`, display:'flex', gap:10, boxShadow:'0 -8px 24px rgba(0,0,0,.04)' }}>
      {!isFirst && (
        <button onClick={onBack}
          style={{ flex:1, minHeight:48, padding:'0 20px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, cursor:'pointer' }}>
          Back
        </button>
      )}
      <button onClick={onContinue} disabled={continueDisabled}
        style={{ flex:1, minHeight:48, padding:'0 20px', background:continueDisabled?CARD2:BLUE, border:continueDisabled?`1px solid ${BORDER}`:'none', borderRadius:999, fontFamily:INTER, fontSize:15, fontWeight:700, color:continueDisabled?MUTED:'white', cursor:continueDisabled?'not-allowed':'pointer', boxShadow:continueDisabled?'none':`0 7px 22px ${BLUE}28` }}>
        {continueLabel}
      </button>
    </div>
  );
}

export const GuestsDashboard = ({ onActivityLogged, onWorkflowChange, propertyName='The Alexen', isPhone=false }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const GuestHeader = props => <WizardHeader propertyName={propertyName} compact={isPhone} {...props}/>;
  const GuestFooter = props => <WizardFooter compact={isPhone} {...props}/>;
  const STATUS_STYLES = {
    waiting:  { bg: 'rgba(255,149,0,0.10)',   color: ORANGE, label: 'Waiting'  },
    notified: { bg: 'rgba(255,56,92,0.10)',   color: BLUE,   label: 'Notified' },
    departed: { bg: 'rgba(113,113,113,0.10)', color: MUTED,  label: 'Departed' },
  };
  const [guests,   setGuests]   = useState([]);
  const [view,     setView]     = useState('list');
  const [guestQueueTab, setGuestQueueTab] = useState('lobby');
  const [gStep,    setGStep]    = useState(1);
  const [form,     setForm]     = useState({ guestName: '', residentName: '', unit: '', purpose: '', notes: '', photo: null, photoPreview: null });
  const [toastId,  setToastId]  = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [notesInterim, setNotesInterim] = useState('');

  // Keep the drawer chrome in sync with the guest screen immediately.  Relying
  // only on an effect here briefly rendered both drawer headers, and could
  // leave the list view without its header during a fast close/reopen.
  const changeView = (nextView) => {
    onWorkflowChange?.(nextView !== 'list');
    setView(nextView);
  };

  useEffect(() => {
    onWorkflowChange?.(view !== 'list');
    return () => onWorkflowChange?.(false);
  }, [view, onWorkflowChange]);

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
    changeView('list');
    setGStep(1);
    setForm({ guestName: '', residentName: '', unit: '', purpose: '', notes: '', photo: null, photoPreview: null });
  };

  const goBackPr = () => {
    changeView('list');
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
    const arrivalNotes = [entry.purpose ? `The visit was for ${entry.purpose.toLowerCase()}` : '', form.notes.trim()].filter(Boolean).join('. ');
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
    onActivityLogged?.({ title: `Guest pre-registration · ${entry.guestName} → ${entry.residentName} · Unit ${entry.unit}`, category: 'Administrative', notes: [entry.purpose, entry.expectedTime ? `Expected ${entry.expectedTime}` : '', entry.notes].filter(Boolean).join('. ') });
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
    onActivityLogged?.({ title: `Resident notified · ${guest.guestName} waiting for ${guest.residentName} · Unit ${guest.unit}`, category: 'Resident Assist', notes: guest.purpose || '' });
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
        <GuestHeader title="Identify the visitor" description="Start the expected-visitor record with their arrival details." step={1} totalSteps={2} onCancel={goBackPr} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px',display:'flex',flexDirection:'column',gap:22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is expected?
          </h2>
          <div>
            <Label>Visitor Name *</Label>
            <input type="text" placeholder="Full name of expected visitor" value={prForm.guestName} onChange={e => setPrForm(p => ({ ...p, guestName: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label optional>Expected Arrival Time</Label>
            <input type="time" value={prForm.expectedTime} onChange={e => setPrForm(p => ({ ...p, expectedTime: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label optional>Purpose</Label>
            <div style={{display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9}}>
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
        <GuestFooter isFirst onContinue={() => setPrStep(2)} continueDisabled={!prForm.guestName.trim()} />
      </div>
    );

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <GuestHeader title="Assign the visit" description="Connect the expected visitor to the resident and unit." step={2} totalSteps={2} onCancel={goBackPr} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px',display:'flex',flexDirection:'column',gap:22 }}>
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
        <GuestFooter onBack={() => setPrStep(1)} onContinue={submitPreReg} continueLabel="Save Pre-registration" continueDisabled={!prForm.residentName.trim() || !prForm.unit.trim()} />
      </div>
    );
  }

  // ── LOG GUEST WIZARD ──────────────────────────────────────────────────────
  if (view === 'form') {
    if (gStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <GuestHeader title="Identify the visitor" description="Start the arrival record with who is at the desk and why." step={1} totalSteps={2} onCancel={goBack} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px',display:'flex',flexDirection:'column',gap:22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is visiting?
          </h2>
          <div>
            <Label>Guest Name *</Label>
            <input type="text" placeholder="Full name of visitor" value={form.guestName} onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label optional>Purpose of Visit</Label>
            <div style={{display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9}}>
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
        <GuestFooter isFirst onContinue={() => setGStep(2)} continueDisabled={!form.guestName.trim()} />
      </div>
    );

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <GuestHeader title="Assign the visit" description="Connect the guest to the resident, unit, and operational notes." step={2} totalSteps={2} onCancel={goBack} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px',display:'flex',flexDirection:'column',gap:22 }}>
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
            <Label optional>Notes</Label>
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
            <Label optional>Photo</Label>
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
        <GuestFooter onBack={() => setGStep(1)} onContinue={logGuest} continueLabel="Log Guest & Notify" continueDisabled={!form.residentName.trim() || !form.unit.trim()} />
      </div>
    );
  }

  // ── GUEST LOG LIST VIEW ───────────────────────────────────────────────────
  const activeGuests   = guests.filter(g => g.status !== 'departed');
  const departedGuests = guests.filter(g => g.status === 'departed');
  const waitingCount   = guests.filter(g => g.status === 'waiting').length;
  const pendingPreRegs = preRegs.filter(p => p.status === 'pending');
  const isQueueEmpty = (guestQueueTab === 'lobby' && activeGuests.length === 0)
    || (guestQueueTab === 'expected' && pendingPreRegs.length === 0)
    || (guestQueueTab === 'history' && departedGuests.length === 0);

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
      <div style={{ flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px 16px 28px':'20px 28px 28px',display:'flex',flexDirection:'column',gap:20 }}>

        {/* Desk context */}
        <div style={{ flexShrink:0,minHeight:82,boxSizing:'border-box',display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,overflow:'hidden',boxShadow:SHADOW }}>
          <div style={{ height:'100%', boxSizing:'border-box', padding:'16px 18px', display:'flex', alignItems:'center', gap:13 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:`${BLUE}10`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><UserCheck size={19} color={BLUE} /></div>
            <div><div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:5 }}>Lobby now</div><div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>{activeGuests.length} active visitor{activeGuests.length === 1 ? '' : 's'}</div></div>
          </div>
          <div style={{ height:'100%',boxSizing:'border-box',padding:'16px 18px',display:'flex',alignItems:'center',gap:13,borderLeft:isPhone?'none':`1px solid ${BORDER}`,borderTop:isPhone?`1px solid ${BORDER}`:'none' }}>
            <div style={{ width:40, height:40, borderRadius:12, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Calendar size={19} color={TEXT} /></div>
            <div><div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:5 }}>Expected</div><div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>{pendingPreRegs.length} scheduled today</div></div>
          </div>
        </div>

        <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:8, marginTop:2 }}><span style={{ width:24, height:2, background:BLUE }} /><span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:BLUE, letterSpacing:'.18em', textTransform:'uppercase' }}>Visitor activity</span></div>

        <div role="tablist" aria-label="Visitor activity" style={{ flexShrink:0, display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:4, padding:4, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14 }}>
          {[['lobby', 'Lobby', activeGuests.length], ['expected', 'Expected', pendingPreRegs.length], ['history', 'History', departedGuests.length]].map(([id, label, count]) => {
            const selected = guestQueueTab === id;
            return <button key={id} role="tab" aria-selected={selected} onClick={() => setGuestQueueTab(id)} style={{ minHeight:44, padding:'0 5px', border:'none', borderRadius:10, background:selected?CARD:'transparent', boxShadow:selected?'0 2px 6px rgba(0,0,0,.08)':'none', color:selected?TEXT:MUTED, cursor:'pointer', fontFamily:INTER, fontSize:13, fontWeight:700, transition:'all 160ms' }}>{label}<span style={{ marginLeft:5, color:selected?BLUE:MUTED }}>{count}</span></button>;
          })}
        </div>

        {/* Pre-registered visitors */}
        {guestQueueTab === 'expected' && pendingPreRegs.length > 0 && (
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
        {isQueueEmpty && (
        <div style={{ flexShrink:0,minHeight:isPhone?220:260,background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:'34px 20px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',boxShadow:SHADOW }}>
            <div style={{ width:52,height:52,borderRadius:14,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>
              {guestQueueTab === 'expected' ? <Calendar size={24} color={MUTED} /> : guestQueueTab === 'history' ? <Check size={24} color={MUTED} /> : <UserCheck size={24} color={MUTED} />}
            </div>
            <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 5px' }}>{guestQueueTab === 'expected' ? 'No visitors expected' : guestQueueTab === 'history' ? 'No visitor history yet' : 'No guests in the lobby'}</p>
            <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>{guestQueueTab === 'expected' ? 'Pre-register an expected visitor below.' : guestQueueTab === 'history' ? 'Completed visits will appear here.' : 'Log a guest arrival or review expected visitors.'}</p>
          </div>
        )}

        {/* In Lobby section */}
        {guestQueueTab === 'lobby' && activeGuests.length > 0 && (
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
        {guestQueueTab === 'history' && departedGuests.length > 0 && (
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
      <div style={{ flexShrink:0,padding:isPhone?'12px 20px 30px':'14px 28px 20px',background:CARD,borderTop:`1px solid ${BORDER}`,boxShadow:'0 -8px 24px rgba(0,0,0,.04)',display:'flex',flexDirection:'column',gap:8 }}>
        <button onClick={() => changeView('form')}
          style={{ width:'100%', minHeight:52, padding:'0 20px', background:BLUE, border:'none', borderRadius:999, fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 7px 22px rgba(255,56,92,.28)' }}>
          <UserCheck size={20} />
          Log Guest Arrival
        </button>
        <button onClick={() => changeView('prereg')}
          style={{ width:'100%', minHeight:46, padding:'0 20px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <Calendar size={17} />
          Pre-register Expected Visitor
        </button>
      </div>
    </div>
  );
};

export default GuestsDashboard;
