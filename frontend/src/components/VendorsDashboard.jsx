import React, { useEffect, useState } from 'react';
import { Wrench, CheckCircle, Clock, Plus, Check, LogOut, ChevronRight, FileText, Thermometer, Droplets, Zap, Wifi, Shield, Truck, Hammer, Sparkles, HelpCircle, Building2, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import MicButton from './MicButton';

const GREEN  = '#34C759';
const BLUE   = '#FF385C';
const ORANGE = '#FF9500';

const PURPOSE_CONFIG = [
  { id: 'HVAC',            Icon: Thermometer, desc: 'Heating, ventilation and air conditioning' },
  { id: 'Plumbing',        Icon: Droplets,    desc: 'Water, pipes, drains and fixtures'         },
  { id: 'Electrical',      Icon: Zap,         desc: 'Wiring, outlets, panels and fixtures'      },
  { id: 'Internet / Cable',Icon: Wifi,        desc: 'Network, cable TV or fiber installation'   },
  { id: 'Pest Control',    Icon: Shield,      desc: 'Extermination and prevention services'     },
  { id: 'Maintenance',     Icon: Wrench,      desc: 'General repairs and upkeep'                },
  { id: 'Moving',          Icon: Truck,       desc: 'Resident move-in or move-out'              },
  { id: 'Renovation',      Icon: Hammer,      desc: 'Unit or common area renovation work'       },
  { id: 'Cleaning',        Icon: Sparkles,    desc: 'Cleaning and janitorial services'          },
  { id: 'Other',           Icon: HelpCircle,  desc: 'Other unlisted service or work'            },
];

const ID_METHODS = ['Photo ID checked', 'Work order on file', 'Management pre-authorized', 'Resident vouched'];
const now        = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const EMPTY_FORM = { company: '', contact: '', purpose: '', unit: '', authorizedBy: '', workOrder: '', idMethod: '', notes: '', photo: null, photoPreview: null };

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
          <div style={{fontFamily:INTER,fontSize:11,color:MUTED,marginTop:8}}>Step {step} of {totalSteps} · Vendor access record</div>
        </div>
        <button onClick={onCancel} aria-label="Close vendor workflow" style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, color:TEXT, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}><span style={{ fontSize:22, lineHeight:1 }}>×</span></button>
      </div>
      <div style={{display:'flex',gap:5,padding:compact?'0 20px 16px':'0 30px 20px'}}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{flex:1,height:3,borderRadius:2,background:i < step?BLUE:BORDER,transition:'background 200ms'}}/>
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
          style={{ flex: 1, padding: '15px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>
          Back
        </button>
      )}
      <button onClick={onContinue} disabled={continueDisabled}
        style={{ flex: 1, padding: '15px 0', background: continueDisabled ? CARD2 : BLUE, border: continueDisabled ? `1px solid ${BORDER}` : 'none', borderRadius: 999, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: continueDisabled ? MUTED : 'white', cursor: continueDisabled ? 'not-allowed' : 'pointer', boxShadow: continueDisabled ? 'none' : `0 6px 20px ${BLUE}28` }}>
        {continueLabel}
      </button>
    </div>
  );
}

export const VendorsDashboard = ({ onActivityLogged, onWorkflowChange, propertyName='The Alexen', isPhone=false }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const gc = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' };
  const VendorHeader = props => <WizardHeader propertyName={propertyName} compact={isPhone} {...props}/>;
  const VendorFooter = props => <WizardFooter compact={isPhone} {...props}/>;
  const [vendors,       setVendors]       = useState([]);
  const [view,          setView]          = useState('list');
  const [vendorTab,     setVendorTab]     = useState('active');
  const [vStep,         setVStep]         = useState(1);
  const [checkoutId,    setCheckoutId]    = useState(null);
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [notesInterim,    setNotesInterim]    = useState('');
  const [checkoutInterim, setCheckoutInterim] = useState('');

  const changeView = (nextView) => { onWorkflowChange?.(nextView !== 'list'); setView(nextView); };
  useEffect(() => { onWorkflowChange?.(view !== 'list'); return () => onWorkflowChange?.(false); }, [view, onWorkflowChange]);
  const setF   = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const goBack = () => { changeView('list'); setForm(EMPTY_FORM); setVStep(1); };

  const checkIn = () => {
    if (!form.company || !form.purpose || !form.unit || !form.authorizedBy || !form.idMethod) return;
    setVendors(p => [...p, { id: Date.now(), ...form, checkInTime: now(), checkOutTime: null, status: 'active' }]);
    const checkInNotes = [`The vendor was directed to ${form.unit}`, form.contact ? `${form.contact} represented the company` : '', `Access was authorized by ${form.authorizedBy}`, `Identity was verified by ${form.idMethod.toLowerCase()}`, form.workOrder ? `Work order ${form.workOrder} was confirmed` : '', form.notes.trim()].filter(Boolean).join('. ');
    onActivityLogged?.({ title: `Vendor check-in · ${form.company} · ${form.purpose}`, category: 'Vendor / Contractor', notes: checkInNotes, evidenceUrls: form.photoPreview ? [form.photoPreview] : [] });
    goBack();
  };

  const checkOut = (id) => {
    const v = vendors.find(x => x.id === id);
    setVendors(p => p.map(x => x.id === id ? { ...x, status: 'out', checkOutTime: now() } : x));
    if (v) {
      const outNotes = [`The vendor departed from ${v.unit}`, `The original check-in was recorded at ${v.checkInTime}`, checkoutNotes.trim()].filter(Boolean).join('. ');
      onActivityLogged?.({ title: `Vendor check-out · ${v.company} · ${v.purpose}`, category: 'Vendor / Contractor', notes: outNotes });
    }
    setCheckoutId(null);
    setCheckoutNotes('');
    changeView('list');
  };

  const active    = vendors.filter(v => v.status === 'active');
  const completed = vendors.filter(v => v.status === 'out');

  // ── LOG VENDOR ENTRY WIZARD ───────────────────────────────────────────────
  if (view === 'entry') {

    // Step 1: Vendor info
    if (vStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <VendorHeader title="Identify the vendor" description="Start the access record with the company and on-site contact." step={1} totalSteps={3} onCancel={goBack} />
        <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px',display:'flex',flexDirection:'column',gap:22}}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is visiting?
          </h2>
          <div>
            <Label>Company / Vendor Name *</Label>
            <input type="text" placeholder="e.g. City Plumbing Co." value={form.company} onChange={e => setF('company', e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label optional>Contact Person</Label>
            <input type="text" placeholder="Technician or rep name" value={form.contact} onChange={e => setF('contact', e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label optional>Work Order #</Label>
            <input type="text" placeholder="If available on paperwork" value={form.workOrder} onChange={e => setF('workOrder', e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <VendorFooter isFirst onContinue={() => setVStep(2)} continueDisabled={!form.company} />
      </div>
    );

    // Step 2: Purpose of visit
    if (vStep === 2) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <VendorHeader title="Classify the visit" description="Choose the service category for this property access record." step={2} totalSteps={3} onCancel={goBack} />
        <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px'}}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            What's the reason for access?
          </h2>
          <div style={{display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9}}>
            {PURPOSE_CONFIG.map(({ id, Icon, desc }) => {
              const sel = form.purpose === id;
              return (
                <button key={id} onClick={() => setF('purpose', id)}
                  style={{minHeight:92,display:'grid',gridTemplateColumns:'36px minmax(0,1fr) 22px',alignItems:'center',gap:11,padding:13,background:sel?'rgba(255,56,92,.045)':CARD,border:`1.5px solid ${sel?BLUE:BORDER}`,borderRadius:14,cursor:'pointer',textAlign:'left',width:'100%',boxShadow:sel?'0 5px 18px rgba(255,56,92,.10)':SHADOW,transition:'all 150ms'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:sel?'rgba(255,56,92,.12)':CARD2,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon size={18} color={sel ? BLUE : MUTED} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{fontFamily:INTER,fontSize:13,fontWeight:750,color:TEXT}}>{id}</div>
                    <div style={{fontFamily:INTER,fontSize:11,color:MUTED,marginTop:4,lineHeight:1.4}}>{desc}</div>
                  </div>
                  {sel && (
                    <div style={{width:22,height:22,borderRadius:'50%',background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Check size={13} color="white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <VendorFooter onBack={() => setVStep(1)} onContinue={() => setVStep(3)} continueDisabled={!form.purpose} />
      </div>
    );

    // Step 3: Access details + ID verification
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <VendorHeader title="Authorize access" description="Record the destination, authorization, and identity check." step={3} totalSteps={3} onCancel={goBack} />
        <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px',display:'flex',flexDirection:'column',gap:24}}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Access details
          </h2>

          {/* Purpose summary chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: CARD2, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            {(() => { const cfg = PURPOSE_CONFIG.find(p => p.id === form.purpose); return cfg ? <cfg.Icon size={16} color={BLUE} /> : null; })()}
            <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: TEXT }}>{form.purpose}</span>
          </div>

          <div>
            <Label>Unit / Area Destination *</Label>
            <input type="text" placeholder="e.g. Unit 412 or Rooftop" value={form.unit} onChange={e => setF('unit', e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <Label>Authorized By *</Label>
            <input type="text" placeholder="Resident or manager name" value={form.authorizedBy} onChange={e => setF('authorizedBy', e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <Label>ID / Authorization Verified *</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ID_METHODS.map(m => {
                const sel = form.idMethod === m;
                return (
                  <button key={m} onClick={() => setF('idMethod', sel ? '' : m)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: sel ? 'rgba(255,56,92,0.05)' : CARD2, border: `1.5px solid ${sel ? BLUE : BORDER}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 150ms' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${sel ? BLUE : BORDER}`, background: sel ? BLUE : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: sel ? 700 : 500, color: sel ? BLUE : TEXT }}>{m}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Optional ID / badge photo */}
          <div>
            <Label optional>ID Photo</Label>
            {form.photoPreview ? (
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                <img src={form.photoPreview} alt="ID" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                <button onClick={() => setForm(p => ({ ...p, photo: null, photoPreview: null }))}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 14, lineHeight: 1 }}>✕</span>
                </button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: CARD2, border: `1px dashed ${BORDER}`, borderRadius: 12, cursor: 'pointer' }}>
                <Camera size={20} color={MUTED} />
                <span style={{ fontFamily: INTER, fontSize: 14, color: MUTED }}>Photograph vendor ID or badge</span>
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

          <div style={{ position: 'relative' }}>
            <Label optional>Notes</Label>
            <textarea
              value={form.notes + (notesInterim ? (form.notes ? ' ' : '') + notesInterim : '')}
              onChange={e => setF('notes', e.target.value)}
              placeholder="e.g. Vendor arrived with two technicians, went to Unit 5B…"
              rows={3}
              style={{ width: '100%', padding: '14px 16px', paddingRight: 48, borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
            />
            <MicButton onTranscript={t => setF('notes', form.notes ? form.notes + ' ' + t : t)} onInterim={setNotesInterim} />
          </div>
        </div>
        <VendorFooter onBack={() => setVStep(2)} onContinue={checkIn} continueLabel="Check In Vendor" continueDisabled={!form.unit || !form.authorizedBy || !form.idMethod} />
      </div>
    );
  }

  // ── CHECKOUT CONFIRMATION ─────────────────────────────────────────────────
  if (view === 'checkout' && checkoutId) {
    const v = vendors.find(x => x.id === checkoutId);
    if (!v) { changeView('list'); return null; }
    const purposeCfg = PURPOSE_CONFIG.find(p => p.id === v.purpose);
    const PIcon = purposeCfg?.Icon ?? Wrench;

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <VendorHeader title="Confirm departure" description="Close the access record and capture the final outcome." step={1} totalSteps={1} onCancel={() => { changeView('list'); setCheckoutId(null); }} />
        <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',padding:isPhone?'18px':'24px 28px',display:'flex',flexDirection:'column',gap:20}}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Confirm departure
          </h2>

          {/* Vendor card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18, background: 'rgba(255,149,0,0.04)', border: `1.5px solid ${ORANGE}`, borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,149,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PIcon size={26} color={ORANGE} />
            </div>
            <div>
              <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT }}>{v.company}</div>
              {v.contact && <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 2 }}>{v.contact}</div>}
              <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 2 }}>{v.purpose} · {v.unit}</div>
            </div>
          </div>

          {/* Check-in summary */}
          <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Access Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>Checked in</span>
                <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: TEXT }}>{v.checkInTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>Authorized by</span>
                <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: TEXT }}>{v.authorizedBy}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>Verification</span>
                <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: GREEN }}>{v.idMethod}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.22)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogOut size={15} color={GREEN} style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              Confirming will mark this vendor as <strong style={{ color: TEXT }}>departed</strong> and record the check-out time.
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <Label optional>Departure Notes</Label>
            <textarea
              value={checkoutNotes + (checkoutInterim ? (checkoutNotes ? ' ' : '') + checkoutInterim : '')}
              onChange={e => setCheckoutNotes(e.target.value)}
              placeholder="e.g. Work completed in Unit 5B, all tools removed, area left clean…"
              rows={3}
              style={{ width: '100%', padding: '14px 16px', paddingRight: 48, borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
            />
            <MicButton onTranscript={t => setCheckoutNotes(p => p ? p + ' ' + t : t)} onInterim={setCheckoutInterim} />
          </div>
        </div>

        <div style={{flexShrink:0,padding:isPhone?'12px 20px 30px':'14px 28px 20px',background:CARD,borderTop:`1px solid ${BORDER}`,boxShadow:'0 -8px 24px rgba(0,0,0,.04)'}}>
          <button onClick={() => checkOut(checkoutId)}
            style={{ width: '100%', padding: '15px 0', background: BLUE, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 6px 20px ${BLUE}28` }}>
            Confirm Check-Out
          </button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',paddingBottom:isPhone?32:24,background:BG}}>
      <div style={{padding:isPhone?'18px 16px 0':'20px 28px 0',display:'flex',flexDirection:'column',gap:20}}>

        <div style={{minHeight:82,boxSizing:'border-box',flexShrink:0,display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,overflow:'hidden',boxShadow:SHADOW}}>
          <div style={{ height:'100%', boxSizing:'border-box', padding:'16px 18px', display:'flex', alignItems:'center', gap:13 }}><div style={{ width:40, height:40, borderRadius:12, background:`${BLUE}10`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Building2 size={19} color={BLUE} /></div><div><div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:5 }}>On site</div><div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>{active.length} active vendor{active.length === 1 ? '' : 's'}</div></div></div>
          <div style={{height:'100%',boxSizing:'border-box',padding:'16px 18px',display:'flex',alignItems:'center',gap:13,borderLeft:isPhone?'none':`1px solid ${BORDER}`,borderTop:isPhone?`1px solid ${BORDER}`:'none'}}><div style={{ width:40, height:40, borderRadius:12, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><CheckCircle size={19} color={GREEN} /></div><div><div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:5 }}>This shift</div><div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>{vendors.length} vendor record{vendors.length === 1 ? '' : 's'}</div></div></div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:-8 }}><span style={{ width:24, height:2, background:BLUE }} /><span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:BLUE, letterSpacing:'.18em', textTransform:'uppercase' }}>Vendor desk</span></div>
        <div role="tablist" aria-label="Vendor activity" style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:4, padding:4, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14 }}>
          {[['active', 'On site', active.length], ['history', 'History', completed.length]].map(([id, label, count]) => { const selected = vendorTab === id; return <button key={id} role="tab" aria-selected={selected} onClick={() => setVendorTab(id)} style={{ minHeight:44, border:'none', borderRadius:10, background:selected?CARD:'transparent', boxShadow:selected?'0 2px 6px rgba(0,0,0,.08)':'none', color:selected?TEXT:MUTED, cursor:'pointer', fontFamily:INTER, fontSize:14, fontWeight:700, transition:'all 160ms' }}>{label}<span style={{ marginLeft:7, color:selected?BLUE:MUTED }}>{count}</span></button>; })}
        </div>

        {/* Hero CTA */}
        <button onClick={() => changeView('entry')}
          style={{width:'100%',minHeight:92,padding:16,background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,display:'grid',gridTemplateColumns:'44px minmax(0,1fr) 38px',alignItems:'center',gap:13,cursor:'pointer',textAlign:'left',boxShadow:SHADOW,transition:'transform 150ms, border-color 150ms, box-shadow 150ms'}}>
          <div style={{width:44,height:44,borderRadius:12,background:'rgba(255,56,92,.11)',display:'flex',alignItems:'center',justifyContent:'center'}}><Plus size={20} color={BLUE}/></div>
          <div style={{minWidth:0}}><div style={{fontFamily:INTER,fontSize:14,fontWeight:800,color:TEXT,marginBottom:4}}>Log vendor entry</div><div style={{fontFamily:INTER,fontSize:11,color:MUTED,lineHeight:1.45}}>Record company access, authorization, and destination.</div></div>
          <div style={{width:38,height:38,borderRadius:999,background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 6px 16px ${BLUE}2b`}}><ChevronRight size={17} color="white"/></div>
        </button>

        {/* Stats (shown when vendors exist) */}
        {vendors.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'In Building', value: active.length,    color: active.length > 0 ? ORANGE : MUTED,    Icon: Building2    },
              { label: 'Checked Out', value: completed.length, color: completed.length > 0 ? GREEN  : MUTED, Icon: CheckCircle  },
              { label: 'Total Today', value: vendors.length,   color: TEXT,                                  Icon: FileText     },
            ].map(({ label, value, color, Icon: SI }) => (
              <div key={label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <SI size={16} color={color} />
                </div>
                <div style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{value}</div>
                <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* In Building section */}
        {vendorTab === 'active' && active.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={20} color={ORANGE} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>In Building</h2>
              </div>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,149,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: ORANGE, fontFamily: INTER }}>{active.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {active.map(v => {
                const cfg = PURPOSE_CONFIG.find(p => p.id === v.purpose);
                const VIcon = cfg?.Icon ?? Wrench;
                return (
                  <div key={v.id} style={{ background: CARD, border: '1.5px solid rgba(255,149,0,0.28)', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(255,149,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                      <div style={{ width: 56, height: 56, background: 'rgba(255,149,0,0.10)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <VIcon size={26} color={ORANGE} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT }}>{v.company}</span>
                          <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: ORANGE, background: 'rgba(255,149,0,0.10)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active</span>
                        </div>
                        {v.contact && <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 6px' }}>{v.contact}</p>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: ORANGE, background: 'rgba(255,149,0,0.08)', borderRadius: 8, padding: '3px 9px' }}>{v.purpose}</span>
                          <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: MUTED, background: CARD2, borderRadius: 8, padding: '3px 9px', border: `1px solid ${BORDER}` }}>{v.unit}</span>
                        </div>
                        <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} />In at {v.checkInTime}</span>
                          <span>Auth: {v.authorizedBy}</span>
                          <span style={{ color: GREEN, fontWeight: 600 }}>✓ {v.idMethod}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { setCheckoutId(v.id); changeView('checkout'); }}
                      style={{ width: '100%', padding: '13px 0', background: BLUE, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 4px 14px ${BLUE}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <LogOut size={16} />Check Out
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Checked Out section */}
        {vendorTab === 'history' && completed.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={20} color={GREEN} strokeWidth={2} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Checked Out</h2>
              </div>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED, fontFamily: INTER }}>{completed.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {completed.map(v => {
                const cfg = PURPOSE_CONFIG.find(p => p.id === v.purpose);
                const VIcon = cfg?.Icon ?? Wrench;
                return (
                  <div key={v.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 52, height: 52, background: 'rgba(52,199,89,0.10)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <VIcon size={24} color={GREEN} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 3px' }}>{v.company}</p>
                      <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: '0 0 2px' }}>{v.purpose} · {v.unit}</p>
                      <p style={{ fontFamily: INTER, fontSize: 11, color: MUTED, margin: 0 }}>In {v.checkInTime} → Out {v.checkOutTime}</p>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,199,89,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle size={18} color={GREEN} strokeWidth={2} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {((vendorTab === 'active' && active.length === 0) || (vendorTab === 'history' && completed.length === 0)) && (
          <div style={{minHeight:isPhone?220:260,background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:'34px 20px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',boxShadow:SHADOW}}>
            <div style={{width:52,height:52,borderRadius:14,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
              <Wrench size={24} color={MUTED} />
            </div>
            <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: '0 0 5px' }}>{vendorTab === 'history' ? 'No vendor history yet' : 'No vendors on site'}</p>
            <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>{vendorTab === 'history' ? 'Checked-out vendors will appear here.' : 'Use the action above to record vendor access.'}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default VendorsDashboard;
