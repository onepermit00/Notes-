import React, { useEffect, useState } from 'react';
import { Lock, Key, Clock, FileText, AlertTriangle, Check, Home, Wrench, CreditCard, UserCheck, Phone, Building2, HelpCircle, Wifi, X, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import MicButton from './MicButton';
import ResidentSearchInput from './ResidentSearchInput';

const GREEN  = '#34C759';
const BLUE   = '#FF385C';

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

function Label({ children, optional=false }) {
  const { colors } = useTheme();
  const { MUTED, INTER } = colors;
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12,fontFamily:INTER,fontSize:14,fontWeight:800,color:colors.TEXT,marginBottom:9}}>
      <span>{children}</span>{optional&&<span style={{fontSize:10,fontWeight:600,color:MUTED,letterSpacing:'.12em',textTransform:'uppercase'}}>Optional</span>}
    </div>
  );
}

function WizardHeader({ propertyName, title, description, step, totalSteps, onCancel, compact=false }) {
  const { colors } = useTheme();
  const { INTER, CARD, CARD2, BORDER, TEXT, MUTED } = colors;
  return (
    <div style={{ flexShrink:0, background:CARD, borderBottom:`1px solid ${BORDER}` }}>
      <div style={{padding:compact?'20px 20px 14px':'26px 30px 18px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
        <div style={{minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:11}}><span style={{width:24,height:2,background:BLUE}}/><span style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.22em',textTransform:'uppercase'}}>{propertyName}</span></div>
          <div style={{fontFamily:INTER,fontSize:compact?28:34,fontWeight:800,color:TEXT,letterSpacing:'-.045em',lineHeight:.98}}>{title}</div>
          {description&&<div style={{maxWidth:470,fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.55,marginTop:9}}>{description}</div>}
          <div style={{fontFamily:INTER,fontSize:11,color:MUTED,marginTop:8}}>Step {step} of {totalSteps} · Secure access record</div>
        </div>
        <button onClick={onCancel} aria-label="Close lockout workflow" style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, color:TEXT, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}><X size={19} /></button>
      </div>
      <div style={{display:'flex',gap:5,padding:compact?'0 20px 16px':'0 30px 20px'}}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{flex:1,height:3,borderRadius:2,background:i < step ? BLUE:BORDER,transition:'background 200ms'}}/>
        ))}
      </div>
    </div>
  );
}

function WizardFooter({ onBack, onContinue, continueLabel = 'Continue', continueDisabled = false, isFirst = false, compact=false }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <div style={{flexShrink:0,padding:compact?'12px 20px 30px':'14px 28px 20px',background:CARD,borderTop:`1px solid ${BORDER}`,display:'flex',gap:10,boxShadow:'0 -8px 24px rgba(0,0,0,.04)'}}>
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

function SelectionCard({ id, Icon, desc, selected, onSelect }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <button onClick={onSelect}
      style={{minHeight:92,display:'grid',gridTemplateColumns:'36px minmax(0,1fr) 22px',alignItems:'center',gap:11,padding:13,background:selected?'rgba(255,56,92,.045)':CARD,border:`1.5px solid ${selected?BLUE:BORDER}`,borderRadius:14,cursor:'pointer',textAlign:'left',width:'100%',boxShadow:selected?'0 5px 18px rgba(255,56,92,.10)':colors.SHADOW,transition:'all 150ms'}}>
      <div style={{width:36,height:36,borderRadius:10,background:selected?'rgba(255,56,92,.12)':CARD2,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Icon size={18} color={selected ? BLUE : MUTED} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{fontFamily:INTER,fontSize:13,fontWeight:750,color:TEXT}}>{id}</div>
        <div style={{fontFamily:INTER,fontSize:11,color:MUTED,marginTop:4,lineHeight:1.4}}>{desc}</div>
      </div>
      {selected && (
        <div style={{width:22,height:22,borderRadius:'50%',background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <Check size={13} color="white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

export const LockoutPage = ({ onActivityLogged, onWorkflowChange, propertyName='The Alexen', isPhone=false }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const gc = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' };
  const LockoutHeader = props => <WizardHeader propertyName={propertyName} compact={isPhone} {...props}/>;
  const LockoutFooter = props => <WizardFooter compact={isPhone} {...props}/>;
  const [log,   setLog]   = useState([]);
  const [view,  setView]  = useState('main');
  const [recordTab, setRecordTab] = useState('records');
  const [lStep, setLStep] = useState(1);
  const [form,  setForm]  = useState(empty);

  const changeView = (nextView) => {
    onWorkflowChange?.(nextView !== 'main');
    setView(nextView);
  };

  useEffect(() => {
    onWorkflowChange?.(view !== 'main');
    return () => onWorkflowChange?.(false);
  }, [view, onWorkflowChange]);

  const set    = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const goBack = () => { changeView('main'); setForm(empty); setLStep(1); };

  const submit = () => {
    if (!form.resident || !form.unit || !form.reason || !form.idMethod || !form.entryMethod) return;
    setLog(p => [{ id: Date.now(), ...form, time: now() }, ...p]);
    const lockoutNotes = [`The resident reported a ${form.reason.toLowerCase()}`, `Identity was verified using ${form.idMethod.toLowerCase()}`, `Access was handled using ${form.entryMethod.toLowerCase()}`, form.notes.trim()].filter(Boolean).join('. ');
    onActivityLogged?.({ title: `Lockout · ${form.resident} · Unit ${form.unit}`, category: 'Safety / Security', notes: lockoutNotes });
    goBack();
  };

  // ── LOG LOCKOUT WIZARD ────────────────────────────────────────────────────
  if (view === 'form') {

    // Step 1: Resident details
    if (lStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <LockoutHeader title="Identify the resident" description="Start the secure access record with the resident and unit." step={1} totalSteps={4} onCancel={goBack} />
        <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px',display:'flex',flexDirection:'column',gap:22}}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is locked out?
          </h2>
          <div>
            <Label optional>Search Resident</Label>
            <ResidentSearchInput
              colors={{ CARD, CARD2, BORDER, TEXT, MUTED, SHADOW }} INTER={INTER}
              placeholder="Search by name or unit to auto-fill…"
              onSelect={r => r ? setForm(p => ({ ...p, resident: r.name || p.resident, unit: r.unit || p.unit })) : null}
            />
          </div>
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
        <LockoutFooter isFirst onContinue={() => setLStep(2)} continueDisabled={!form.resident || !form.unit} />
      </div>
    );

    // Step 2: Reason
    if (lStep === 2) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <LockoutHeader title="Document the reason" description="Record why access is needed before beginning verification." step={2} totalSteps={4} onCancel={goBack} />
        <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px'}}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            What happened?
          </h2>
          <div style={{display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9}}>
            {REASON_CONFIG.map(({ id, Icon, desc }) => (
              <SelectionCard key={id} id={id} Icon={Icon} desc={desc} selected={form.reason === id} onSelect={() => set('reason', id)} />
            ))}
          </div>
        </div>
        <LockoutFooter onBack={() => setLStep(1)} onContinue={() => setLStep(3)} continueDisabled={!form.reason} />
      </div>
    );

    // Step 3: Identity verification
    if (lStep === 3) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <LockoutHeader title="Verify identity" description="Choose the verification method completed before granting entry." step={3} totalSteps={4} onCancel={goBack} />
        <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px'}}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            How was identity confirmed?
          </h2>
          <div style={{display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9}}>
            {ID_CONFIG.map(({ id, Icon, desc }) => (
              <SelectionCard key={id} id={id} Icon={Icon} desc={desc} selected={form.idMethod === id} onSelect={() => set('idMethod', id)} />
            ))}
          </div>
        </div>
        <LockoutFooter onBack={() => setLStep(2)} onContinue={() => setLStep(4)} continueDisabled={!form.idMethod} />
      </div>
    );

    // Step 4: Entry method + notes
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <LockoutHeader title="Record the entry" description="Document how access was restored and add any final context." step={4} totalSteps={4} onCancel={goBack} />
        <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px',display:'flex',flexDirection:'column',gap:24}}>
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
            <Label optional>Notes</Label>
            <div style={{ position: 'relative' }}>
              <textarea rows={3} placeholder="Any additional context..." value={form.notes} onChange={e => set('notes', e.target.value)}
                style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              <MicButton onTranscript={t => setForm(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} />
            </div>
          </div>
        </div>
        <LockoutFooter onBack={() => setLStep(3)} onContinue={submit} continueLabel="Submit Log" continueDisabled={!form.entryMethod} />
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',paddingBottom:isPhone?32:24,background:BG}}>
      <div style={{padding:isPhone?'18px 16px 0':'20px 28px 0',display:'flex',flexDirection:'column',gap:20}}>

        {/* Desk context */}
        <div style={{minHeight:82,boxSizing:'border-box',flexShrink:0,display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,overflow:'hidden',boxShadow:SHADOW}}>
          <div style={{ height:'100%', boxSizing:'border-box', padding:'16px 18px', display:'flex', alignItems:'center', gap:13 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:`${BLUE}10`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Lock size={19} color={BLUE} /></div>
            <div><div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:5 }}>This shift</div><div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>{log.length} lockout{log.length === 1 ? '' : 's'} recorded</div></div>
          </div>
          <div style={{height:'100%',boxSizing:'border-box',padding:'16px 18px',display:'flex',alignItems:'center',gap:13,borderLeft:isPhone?'none':`1px solid ${BORDER}`,borderTop:isPhone?`1px solid ${BORDER}`:'none'}}>
            <div style={{ width:40, height:40, borderRadius:12, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Check size={19} color={GREEN} /></div>
            <div><div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:5 }}>Protocol</div><div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>Verify before entry</div></div>
          </div>
        </div>

        {/* Hero CTA */}
        <button onClick={() => changeView('form')}
          style={{width:'100%',minHeight:92,padding:16,background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,display:'grid',gridTemplateColumns:'44px minmax(0,1fr) 38px',alignItems:'center',gap:13,cursor:'pointer',textAlign:'left',boxShadow:SHADOW,transition:'transform 150ms, border-color 150ms, box-shadow 150ms'}}>
          <div style={{width:44,height:44,borderRadius:12,background:'rgba(255,56,92,.11)',display:'flex',alignItems:'center',justifyContent:'center'}}><Lock size={20} color={BLUE}/></div>
          <div style={{minWidth:0}}><div style={{fontFamily:INTER,fontSize:14,fontWeight:800,color:TEXT,marginBottom:4}}>Log lockout</div><div style={{fontFamily:INTER,fontSize:11,color:MUTED,lineHeight:1.45}}>Document the resident, verification, and entry method.</div></div>
          <div style={{width:38,height:38,borderRadius:999,background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 6px 16px ${BLUE}2b`}}><ChevronRight size={17} color="white"/></div>
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:-8 }}><span style={{ width:24, height:2, background:BLUE }} /><span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:BLUE, letterSpacing:'.18em', textTransform:'uppercase' }}>Access record</span></div>
        <div role="tablist" aria-label="Lockout records" style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:4, padding:4, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14 }}>
          {[['records', 'Records', log.length], ['protocol', 'Protocol', null]].map(([id, label, count]) => {
            const selected = recordTab === id;
            return <button key={id} role="tab" aria-selected={selected} onClick={() => setRecordTab(id)} style={{ minHeight:44, border:'none', borderRadius:10, background:selected?CARD:'transparent', boxShadow:selected?'0 2px 6px rgba(0,0,0,.08)':'none', color:selected?TEXT:MUTED, cursor:'pointer', fontFamily:INTER, fontSize:14, fontWeight:700, transition:'all 160ms' }}>{label}{count !== null && <span style={{ marginLeft:7, color:selected?BLUE:MUTED }}>{count}</span>}</button>;
          })}
        </div>

        {/* Past Records section */}
        {recordTab === 'records' && <div>
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
            <div style={{minHeight:isPhone?220:260,background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:'34px 20px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',boxShadow:SHADOW}}>
              <div style={{width:52,height:52,borderRadius:14,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
                <Lock size={24} color={MUTED} />
              </div>
              <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: '0 0 5px' }}>No lockouts logged</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Completed access records will appear here.</p>
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
        </div>}

        {recordTab === 'protocol' && (
          <div style={{ minHeight:260, background:CARD, border:`1px solid ${BORDER}`, borderRadius:18, padding:24, display:'flex', flexDirection:'column', gap:18 }}>
            <div style={{ width:52, height:52, borderRadius:16, background:`${BLUE}10`, display:'flex', alignItems:'center', justifyContent:'center' }}><UserCheck size={24} color={BLUE} /></div>
            <div><div style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:TEXT, letterSpacing:'-.025em' }}>Verify before entry</div><div style={{ marginTop:6, fontFamily:INTER, fontSize:13, lineHeight:1.6, color:MUTED }}>Complete the identity check before selecting an entry method. This keeps the access record clear and auditable.</div></div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {['Confirm resident identity', 'Record the reason for access', 'Document the entry method'].map((item, index) => <div key={item} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', border:`1px solid ${BORDER}`, borderRadius:12, background:CARD2 }}><span style={{ width:24, height:24, borderRadius:999, background:`${BLUE}12`, color:BLUE, display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily:INTER, fontSize:11, fontWeight:800 }}>{index + 1}</span><span style={{ fontFamily:INTER, fontSize:14, fontWeight:650, color:TEXT }}>{item}</span></div>)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LockoutPage;
