import React, { useState } from 'react';
import { Lock, Key, Clock, FileText, AlertTriangle, Check, Home, Wrench, CreditCard, UserCheck, Phone, Building2, HelpCircle, Wifi } from 'lucide-react';

const BG     = '#FFFFFF';
const CARD   = '#FFFFFF';
const CARD2  = '#F7F7F7';
const GREEN  = '#34C759';
const BLUE   = '#FF385C';
const BORDER = '#EBEBEB';
const TEXT   = '#222222';
const MUTED  = '#717171';
const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const gc     = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' };

const REASON_CONFIG = [
  { id: 'Lost Key',              Icon: Key,        desc: 'Key cannot be located'                 },
  { id: 'Forgot Key',            Icon: Clock,      desc: 'Left key inside the unit'              },
  { id: 'Key Broken/Damaged',    Icon: Wrench,     desc: 'Key is damaged or not functioning'     },
  { id: 'Moved In / First Lock', Icon: Home,       desc: 'New resident, first-time entry needed' },
  { id: 'Other',                 Icon: HelpCircle, desc: 'Other reason not listed above'         },
];

const ID_CONFIG = [
  { id: 'Photo ID Checked',        Icon: CreditCard, desc: 'Government-issued photo ID reviewed'   },
  { id: 'Recognized Resident',     Icon: UserCheck,  desc: 'Resident is personally known to staff' },
  { id: 'Management Confirmation', Icon: Building2,  desc: 'Property management confirmed identity' },
  { id: 'Called Office # on File', Icon: Phone,      desc: 'Called the phone number on file'        },
  { id: 'Building Key Fob Match',  Icon: Wifi,       desc: 'Resident matched key fob assignment'    },
];

const ENTRY_CONFIG = [
  { id: 'Master Key',           Icon: Key       },
  { id: 'Maintenance Unlocked', Icon: Wrench    },
  { id: 'Property Manager Key', Icon: Building2 },
  { id: 'Locksmith Called',     Icon: Phone     },
  { id: 'Spare Key on File',    Icon: FileText  },
];

const empty = { resident: '', unit: '', reason: '', idMethod: '', entryMethod: '', notes: '' };
const now   = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function Label({ children }) {
  return (
    <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function WizardHeader({ title, step, totalSteps, onCancel }) {
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

function SelectionCard({ id, Icon, desc, selected, onSelect }) {
  return (
    <button onClick={onSelect}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: selected ? 'rgba(255,56,92,0.04)' : CARD, border: `1.5px solid ${selected ? BLUE : BORDER}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: selected ? `0 0 0 3px rgba(255,56,92,0.10)` : 'none', transition: 'all 150ms' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: selected ? 'rgba(255,56,92,0.12)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}>
        <Icon size={24} color={selected ? BLUE : MUTED} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{id}</div>
        <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
      </div>
      {selected && (
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Check size={13} color="white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

export const LockoutPage = ({ onActivityLogged }) => {
  const [log,   setLog]   = useState([]);
  const [view,  setView]  = useState('main');
  const [lStep, setLStep] = useState(1);
  const [form,  setForm]  = useState(empty);

  const set    = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const goBack = () => { setView('main'); setForm(empty); setLStep(1); };

  const submit = () => {
    if (!form.resident || !form.unit || !form.reason || !form.idMethod || !form.entryMethod) return;
    setLog(p => [{ id: Date.now(), ...form, time: now() }, ...p]);
    onActivityLogged?.({ title: `Lockout · ${form.resident} · Unit ${form.unit}`, category: 'Safety / Security', notes: `${form.reason} · ${form.entryMethod}` });
    goBack();
  };

  // ── LOG LOCKOUT WIZARD ────────────────────────────────────────────────────
  if (view === 'form') {

    // Step 1: Resident details
    if (lStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Lockout" step={1} totalSteps={4} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is locked out?
          </h2>
          <div>
            <Label>Resident Name *</Label>
            <input type="text" placeholder="Full name" value={form.resident} onChange={e => set('resident', e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Unit Number *</Label>
            <input type="text" placeholder="e.g. 304" value={form.unit} onChange={e => set('unit', e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <WizardFooter isFirst onContinue={() => setLStep(2)} continueDisabled={!form.resident || !form.unit} />
      </div>
    );

    // Step 2: Reason
    if (lStep === 2) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Lockout" step={2} totalSteps={4} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px' }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            What happened?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REASON_CONFIG.map(({ id, Icon, desc }) => (
              <SelectionCard key={id} id={id} Icon={Icon} desc={desc} selected={form.reason === id} onSelect={() => set('reason', id)} />
            ))}
          </div>
        </div>
        <WizardFooter onBack={() => setLStep(1)} onContinue={() => setLStep(3)} continueDisabled={!form.reason} />
      </div>
    );

    // Step 3: Identity verification
    if (lStep === 3) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Lockout" step={3} totalSteps={4} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px' }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            How was identity confirmed?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ID_CONFIG.map(({ id, Icon, desc }) => (
              <SelectionCard key={id} id={id} Icon={Icon} desc={desc} selected={form.idMethod === id} onSelect={() => set('idMethod', id)} />
            ))}
          </div>
        </div>
        <WizardFooter onBack={() => setLStep(2)} onContinue={() => setLStep(4)} continueDisabled={!form.idMethod} />
      </div>
    );

    // Step 4: Entry method + notes
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Lockout" step={4} totalSteps={4} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            How was the unit opened?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ENTRY_CONFIG.map(({ id, Icon }) => {
              const sel = form.entryMethod === id;
              return (
                <button key={id} onClick={() => set('entryMethod', sel ? '' : id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: sel ? 'rgba(255,56,92,0.05)' : CARD2, border: `1.5px solid ${sel ? BLUE : BORDER}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 150ms' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${sel ? BLUE : BORDER}`, background: sel ? BLUE : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: sel ? 'rgba(255,56,92,0.10)' : CARD, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={sel ? BLUE : MUTED} />
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: sel ? 700 : 500, color: sel ? BLUE : TEXT }}>{id}</span>
                </button>
              );
            })}
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <textarea rows={3} placeholder="Any additional context..." value={form.notes} onChange={e => set('notes', e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <WizardFooter onBack={() => setLStep(3)} onContinue={submit} continueLabel="Submit Log" continueDisabled={!form.entryMethod} />
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 24, background: BG }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero CTA */}
        <button onClick={() => setView('form')}
          style={{ width: '100%', padding: 20, background: BLUE, borderRadius: 20, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: `0 8px 28px ${BLUE}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.20)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={28} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: INTER, fontSize: 17, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>Log Lockout</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: 0 }}>Document resident lockout and entry method</p>
            </div>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.72)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Past Records section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={20} color={BLUE} />
              <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Past Records</h2>
            </div>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: log.length > 0 ? 'rgba(255,56,92,0.10)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: log.length > 0 ? BLUE : MUTED, fontFamily: INTER }}>
              {log.length}
            </span>
          </div>

          {log.length === 0 ? (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Lock size={30} color={MUTED} />
              </div>
              <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: '0 0 5px' }}>No lockouts logged</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Tap the button above to record an incident</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {log.map(entry => {
                const reasonCfg = REASON_CONFIG.find(r => r.id === entry.reason);
                const ReasonIcon = reasonCfg?.Icon ?? Lock;
                const entryCfg  = ENTRY_CONFIG.find(e => e.id === entry.entryMethod);
                const EntryIcon = entryCfg?.Icon ?? Key;
                return (
                  <div key={entry.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                      <div style={{ width: 56, height: 56, background: 'rgba(255,56,92,0.10)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Lock size={26} color={BLUE} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT }}>{entry.resident}</span>
                          <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: BLUE, background: 'rgba(255,56,92,0.10)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lockout</span>
                        </div>
                        <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Unit {entry.unit}</p>
                      </div>
                      <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, flexShrink: 0 }}>{entry.time}</span>
                    </div>

                    {/* Detail pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'rgba(255,56,92,0.08)', border: '1px solid rgba(255,56,92,0.18)', borderRadius: 8 }}>
                        <ReasonIcon size={12} color={BLUE} />
                        <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: BLUE }}>{entry.reason}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.20)', borderRadius: 8 }}>
                        <Check size={12} color={GREEN} />
                        <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: GREEN }}>{entry.idMethod}</span>
                      </div>
                    </div>

                    {/* Entry method */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: CARD2, borderRadius: 10, border: `1px solid ${BORDER}` }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,56,92,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <EntryIcon size={14} color={BLUE} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 1px' }}>Entry Method</p>
                        <p style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{entry.entryMethod}</p>
                      </div>
                    </div>

                    {entry.notes && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                        <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0, fontStyle: 'italic' }}>"{entry.notes}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LockoutPage;
