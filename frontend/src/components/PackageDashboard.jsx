import React, { useEffect, useState } from 'react';
import { Package, Plus, Minus, Check, Truck, RotateCcw, ChevronRight, FileText, ArrowLeft, Camera, MessageCircle, X, Mail, ShoppingBag, Globe, UtensilsCrossed, Box, User, Users, Bell, BellOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import MicButton from './MicButton';
import { SignaturePad } from './SignaturePad';
import { authApi } from '../services/authApi';
import ResidentSearchInput from './ResidentSearchInput';

const GREEN  = '#34C759';
const BLUE   = '#FF385C';
const RED    = '#FF3B30';
const ORANGE = '#FF9500';

const CARRIER_CONFIG = [
  { id: 'UPS',           Icon: Package,         desc: 'Standard parcel and express shipping'          },
  { id: 'FedEx',         Icon: Truck,           desc: 'Express overnight and ground delivery'          },
  { id: 'USPS',          Icon: Mail,            desc: 'US Postal Service mail and parcels'             },
  { id: 'Amazon',        Icon: ShoppingBag,     desc: 'Amazon.com retail and fresh packages'           },
  { id: 'DHL',           Icon: Globe,           desc: 'International and express delivery'             },
  { id: 'Food Delivery', Icon: UtensilsCrossed, desc: 'DoorDash, Uber Eats, Grubhub · Marked urgent', isFood: true },
  { id: 'Other',         Icon: Box,             desc: 'Other carrier or unlisted service'              },
];

const RTS_CARRIER_CONFIG = [
  { id: 'UPS',            Icon: Package,    desc: 'UPS return package pickup'     },
  { id: 'FedEx',          Icon: Truck,      desc: 'FedEx return shipment'         },
  { id: 'USPS',           Icon: Mail,       desc: 'USPS return mail'              },
  { id: 'Amazon Returns', Icon: ShoppingBag,desc: 'Amazon return package'         },
  { id: 'DHL',            Icon: Globe,      desc: 'DHL return delivery'           },
  { id: 'Other',          Icon: Box,        desc: 'Other carrier or service'      },
];

const STORAGE_CONFIG = [
  { id: 'Luxer Locker',  desc: 'Secure smart locker system'     },
  { id: 'Package Room',  desc: 'Large items or overflow storage' },
  { id: 'Overflow Unit', desc: 'Overflow into a residential unit'},
];

const PICKUP_TYPES = [
  { id: 'resident',    Icon: User,  label: 'Resident Pickup', desc: 'Package collected by the resident on record'     },
  { id: 'third_party', Icon: Users, label: 'Third Party',     desc: 'Authorized person picking up on behalf of resident' },
];

const now = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function Label({ children, optional }) {
  const { colors } = useTheme();
  const { MUTED, INTER } = colors;
  return (
    <div style={{ display:'flex',justifyContent:'space-between',gap:12,marginBottom:9 }}>
      <span style={{fontFamily:INTER,fontSize:14,fontWeight:800,color:colors.TEXT}}>{children}</span>
      {optional&&<span style={{fontFamily:INTER,fontSize:10,fontWeight:600,color:MUTED,letterSpacing:'.12em',textTransform:'uppercase'}}>Optional</span>}
    </div>
  );
}

function WizardHeader({ propertyName, title, description, step, totalSteps, onCancel, compact = false }) {
  const { colors } = useTheme();
  const { INTER, CARD, CARD2, BORDER, TEXT, MUTED } = colors;
  return (
    <div style={{ flexShrink:0, background:CARD, borderBottom:`1px solid ${BORDER}` }}>
      <div style={{ padding:compact?'20px 20px 14px':'26px 30px 18px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16 }}>
        <div style={{minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:11}}><span style={{width:24,height:2,background:BLUE}}/><span style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.22em',textTransform:'uppercase'}}>{propertyName}</span></div>
          <div style={{fontFamily:INTER,fontSize:compact?28:34,fontWeight:800,color:TEXT,letterSpacing:'-.045em',lineHeight:.98}}>{title}</div>
          <div style={{maxWidth:470,fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.55,marginTop:9}}>{description}</div>
          {step&&<div style={{fontFamily:INTER,fontSize:11,color:MUTED,marginTop:8}}>Step {step} of {totalSteps} · Package record</div>}
        </div>
        <button onClick={onCancel} aria-label="Close package workflow" style={{width:44,height:44,borderRadius:999,border:`1px solid ${BORDER}`,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}><X size={19} color={TEXT}/></button>
      </div>
      {step&&<div style={{display:'flex',gap:5,padding:compact?'0 20px 16px':'0 30px 20px'}}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<step?BLUE:BORDER,transition:'background 200ms'}} />
        ))}
      </div>}
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

function ActionRow({ Icon, title, description, onClick, compact = false }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, SHADOW, INTER } = colors;
  return (
    <button onClick={onClick}
      style={{ width:'100%', minHeight:compact?86:92, padding:compact?'14px':'16px', background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, display:'grid', gridTemplateColumns:'44px minmax(0,1fr) 38px', alignItems:'center', gap:13, cursor:'pointer', textAlign:'left', boxShadow:SHADOW, transition:'transform 150ms, border-color 150ms, box-shadow 150ms' }}>
      <div style={{ width:44,height:44,borderRadius:12,background:'rgba(255,56,92,.11)',display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={20} color={BLUE}/></div>
      <div style={{minWidth:0}}><div style={{fontFamily:INTER,fontSize:14,fontWeight:800,color:TEXT,marginBottom:4}}>{title}</div><div style={{fontFamily:INTER,fontSize:11,color:MUTED,lineHeight:1.45}}>{description}</div></div>
      <div style={{width:38,height:38,borderRadius:999,background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 6px 16px ${BLUE}2b`}}><ChevronRight size={17} color="white"/></div>
    </button>
  );
}

function EmptyState({ Icon, title, description }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, SHADOW, INTER } = colors;
  return (
    <div style={{ background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:'34px 20px',textAlign:'center',boxShadow:SHADOW }}>
      <div style={{width:52,height:52,background:CARD2,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}><Icon size={24} color={MUTED}/></div>
      <p style={{fontFamily:INTER,fontWeight:800,color:TEXT,fontSize:15,margin:'0 0 6px'}}>{title}</p>
      <p style={{fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.5,margin:0}}>{description}</p>
    </div>
  );
}

function Counter({ value, onChange }) {
  const { colors } = useTheme();
  const { CARD2, BORDER, TEXT, INTER } = colors;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <button onClick={() => onChange(Math.max(1, value - 1))}
        style={{ width: 48, height: 48, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Minus size={20} color={TEXT} />
      </button>
      <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: '2.5rem', color: TEXT, letterSpacing: '-0.03em', minWidth: 48, textAlign: 'center' }}>{value}</span>
      <button onClick={() => onChange(value + 1)}
        style={{ width: 48, height: 48, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Plus size={20} color={TEXT} />
      </button>
    </div>
  );
}

function CarrierCard({ cfg, selected, onSelect, accent = BLUE, index }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  const { id, Icon, desc, isFood } = cfg;
  const cardAccent = isFood && !selected ? ORANGE : accent;
  return (
    <button onClick={onSelect}
      style={{minHeight:92,display:'grid',gridTemplateColumns:'36px 1fr 22px',alignItems:'center',gap:11,padding:13,background:selected?'rgba(255,56,92,.045)':CARD,border:`1.5px solid ${selected?BLUE:BORDER}`,borderRadius:14,cursor:'pointer',textAlign:'left',width:'100%',boxShadow:selected?'0 5px 18px rgba(255,56,92,.10)':colors.SHADOW,transition:'all 150ms'}}>
      <div style={{width:36,height:36,borderRadius:10,background:selected?'rgba(255,56,92,.12)':CARD2,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
        <Icon size={18} color={selected?BLUE:isFood?ORANGE:MUTED}/>{index!==undefined&&<span style={{position:'absolute',top:-6,left:-6,fontFamily:INTER,fontSize:7,fontWeight:800,color:selected?BLUE:MUTED}}>{String(index+1).padStart(2,'0')}</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{fontFamily:INTER,fontSize:13,fontWeight:750,color:TEXT}}>{id}</div><div style={{fontFamily:INTER,fontSize:11,color:MUTED,marginTop:4,lineHeight:1.4}}>{desc}</div>
      </div>
      {selected && (
        <div style={{width:22,height:22,borderRadius:'50%',background:BLUE,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Check size={13} color="white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

export const PackageDashboard = ({ onActivityLogged, onWorkflowChange, propertyName='The Alexen', onClose, isPhone=false }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const gc = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' };
  const PackageHeader = props => <WizardHeader propertyName={propertyName} compact={isPhone} {...props} />;
  const PackageFooter = props => <WizardFooter compact={isPhone} {...props} />;
  const [subTab,      setSubTab]      = useState('deliveries');
  const [view,        setView]        = useState('main');
  const [deliveries,  setDeliveries]  = useState([]);
  const [pickups,     setPickups]     = useState([]);
  const [rtsDropoffs, setRtsDropoffs] = useState([]);
  const [rtsPickups,  setRtsPickups]  = useState([]);

  const changeView = (nextView) => {
    onWorkflowChange?.(nextView !== 'main');
    setView(nextView);
  };

  useEffect(() => {
    onWorkflowChange?.(view !== 'main');
    return () => onWorkflowChange?.(false);
  }, [view, onWorkflowChange]);

  // Wizard step states
  const [dStep,  setDStep]  = useState(1);
  const [pStep,  setPStep]  = useState(1);
  const [rStep,  setRStep]  = useState(1);
  const [rpStep, setRPStep] = useState(1);

  const [dForm, setDF] = useState({ carrier: '', unit: '', count: 1, storage: 'Luxer Locker', overflowUnit: '', notes: '', photo: null, photoPreview: null, notifyNow: true, residentName: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleDeliveryPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setDF(p => ({ ...p, photo: file, photoPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const notifyDelivery = async (id) => {
    const d = deliveries.find(x => x.id === id);
    if (!d) return;
    setDeliveries(p => p.map(x => x.id === id ? { ...x, notified: true, notifiedAt: now() } : x));
    showToast(`Notifying Unit ${d.unit}…`);
    try {
      const res = await authApi.notifyPackage({ unit: d.unit, carrier: d.carrier, count: d.count, photoUrl: d.photoPreview || null });
      showToast(res.sent ? `Email sent to ${res.resident_name} · Unit ${d.unit}` : `Logged · No email on file for Unit ${d.unit}`);
    } catch {
      showToast(`Notification queued for Unit ${d.unit}`);
    }
  };

  const [pForm, setPF] = useState({ unit: '', residentName: '', count: 1, pickupType: 'resident', thirdPartyName: '', relation: '', idVerified: false, residentAuthorized: false, signature: null, signedAt: null });
  const [showPkgSig, setShowPkgSig] = useState(false);
  const [rdForm, setRDF] = useState({ residentName: '', unit: '', carrier: '', count: 1, tracking: '', notes: '' });
  const [rpForm, setRPF] = useState({ carrier: '', count: 1, notes: '' });

  const totalIn    = deliveries.reduce((s, d) => s + d.count, 0);
  const totalOut   = pickups.reduce((s, p) => s + p.count, 0);
  const remaining  = Math.max(0, totalIn - totalOut);
  const rtsPending = rtsDropoffs.filter(d => !d.pickedUp);

  const goBack = () => {
    changeView('main');
    setDStep(1); setPStep(1); setRStep(1); setRPStep(1);
  };

  const submitDelivery = async () => {
    if (!dForm.carrier || !dForm.unit) return;
    const newDel = { ...dForm, id: Date.now(), time: now(), isFood: dForm.carrier === 'Food Delivery', notified: dForm.notifyNow, notifiedAt: dForm.notifyNow ? now() : null };
    setDeliveries(p => [newDel, ...p]);
    const deliveryNotes = [`${dForm.count} package${dForm.count === 1 ? '' : 's'} ${dForm.count === 1 ? 'was' : 'were'} stored in ${dForm.storage}`, dForm.notifyNow ? 'The resident notification was sent' : 'Resident notification was not requested', dForm.notes.trim()].filter(Boolean).join('. ');
    onActivityLogged?.({ title: `Package delivery · ${dForm.carrier} → Unit ${dForm.unit}`, category: 'Delivery', notes: deliveryNotes, evidenceUrls: dForm.photoPreview ? [dForm.photoPreview] : [] });
    if (dForm.notifyNow) {
      authApi.notifyPackage({ unit: dForm.unit, carrier: dForm.carrier, count: dForm.count, residentName: dForm.residentName || '', photoUrl: dForm.photoPreview || null });
    }
    setDF({ carrier: '', unit: '', count: 1, storage: 'Luxer Locker', overflowUnit: '', notes: '', photo: null, photoPreview: null, notifyNow: true, residentName: '' });
    setDStep(1);
    changeView('main');
  };

  const submitPickup = () => {
    if (!pForm.unit || !pForm.residentName || !pForm.signature) return;
    setPickups(p => [{ ...pForm, id: Date.now(), time: now() }, ...p]);
    onActivityLogged?.({ title: `Package pickup · ${pForm.residentName} · Unit ${pForm.unit}`, category: 'Delivery', notes: pForm.pickupType === 'third_party' ? `Third party: ${pForm.thirdPartyName}` : '' });
    setPF({ unit: '', residentName: '', count: 1, pickupType: 'resident', thirdPartyName: '', relation: '', idVerified: false, residentAuthorized: false, signature: null, signedAt: null });
    setShowPkgSig(false);
    setPStep(1);
    changeView('main');
  };

  const submitRtsDrop = () => {
    if (!rdForm.residentName || !rdForm.unit || !rdForm.carrier) return;
    setRtsDropoffs(p => [{ ...rdForm, id: Date.now(), time: now(), pickedUp: false }, ...p]);
    onActivityLogged?.({ title: `RTS drop-off · ${rdForm.residentName} · ${rdForm.carrier}`, category: 'Delivery', notes: rdForm.notes });
    setRDF({ residentName: '', unit: '', carrier: '', count: 1, tracking: '', notes: '' });
    setRStep(1);
    changeView('main');
  };

  const submitRtsPickup = () => {
    if (!rpForm.carrier) return;
    setRtsPickups(p => [{ ...rpForm, id: Date.now(), time: now() }, ...p]);
    setRtsDropoffs(p => p.map(d => !d.pickedUp && d.carrier === rpForm.carrier ? { ...d, pickedUp: true, pickupTime: now() } : d));
    onActivityLogged?.({ title: `RTS carrier pickup · ${rpForm.carrier} · ${rpForm.count} pkg${rpForm.count > 1 ? 's' : ''}`, category: 'Delivery', notes: rpForm.notes });
    setRPF({ carrier: '', count: 1, notes: '' });
    setRPStep(1);
    changeView('main');
  };

  // ── LOG DELIVERY WIZARD ───────────────────────────────────────────────────
  if (view === 'delivery') {

    // Step 1: Carrier selection
    if (dStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PackageHeader title="Identify the carrier" description="Start the delivery record with the service that brought the package in." step={1} totalSteps={3} onCancel={goBack} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:isPhone?18:'24px 28px' }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            Who is the carrier?
          </h2>
          <div style={{display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9}}>
            {CARRIER_CONFIG.map((cfg,index) => (
              <CarrierCard key={cfg.id} cfg={cfg} index={index} selected={dForm.carrier === cfg.id} onSelect={() => setDF(p => ({ ...p, carrier: cfg.id }))} />
            ))}
          </div>
        </div>
        <PackageFooter isFirst onContinue={() => setDStep(2)} continueDisabled={!dForm.carrier} />
      </div>
    );

    // Step 2: Package details
    if (dStep === 2) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PackageHeader title="Assign the delivery" description="Link the package to its resident and document where it was secured." step={2} totalSteps={3} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Package details
          </h2>
          <div>
            <Label>Search Resident (optional)</Label>
            <ResidentSearchInput
              colors={{ CARD, CARD2, BORDER, TEXT, MUTED, SHADOW }} INTER={INTER}
              placeholder="Search by name or unit to auto-fill…"
              onSelect={r => r ? setDF(p => ({ ...p, unit: r.unit || p.unit, residentName: r.name || p.residentName })) : null}
            />
          </div>
          <div>
            <Label>Unit Number *</Label>
            <input type="text" placeholder="e.g. 524" value={dForm.unit} onChange={e => setDF(p => ({ ...p, unit: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Package Count</Label>
            <Counter value={dForm.count} onChange={v => setDF(p => ({ ...p, count: v }))} />
          </div>
          <div>
            <Label>Storage Location</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STORAGE_CONFIG.map(({ id, desc }) => {
                const sel = dForm.storage === id;
                return (
                  <button key={id} onClick={() => setDF(p => ({ ...p, storage: id }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: sel ? 'rgba(255,56,92,0.05)' : CARD2, border: `1.5px solid ${sel ? BLUE : BORDER}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 150ms' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${sel ? BLUE : BORDER}`, background: sel ? BLUE : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: sel ? 700 : 500, color: sel ? BLUE : TEXT }}>{id}</div>
                      <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 1 }}>{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {dForm.storage === 'Overflow Unit' && (
              <input type="text" placeholder="Overflow unit # (e.g. 628)" value={dForm.overflowUnit} onChange={e => setDF(p => ({ ...p, overflowUnit: e.target.value }))}
                style={{ width: '100%', marginTop: 10, padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${ORANGE}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: 'rgba(255,149,0,0.03)', outline: 'none', boxSizing: 'border-box' }} />
            )}
          </div>
        </div>
        <PackageFooter onBack={() => setDStep(1)} onContinue={() => setDStep(3)} continueDisabled={!dForm.unit} />
      </div>
    );

    // Step 3: Notes & photo
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PackageHeader title="Complete the record" description="Add condition evidence, notes, and resident notification preferences." step={3} totalSteps={3} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Notes & photo
          </h2>

          <div>
            <Label>Notes (optional)</Label>
            <div style={{ position: 'relative' }}>
              <textarea placeholder="Damaged box, signature required, suspicious odor..." value={dForm.notes} onChange={e => setDF(p => ({ ...p, notes: e.target.value }))} rows={3}
                style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              <MicButton onTranscript={t => setDF(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} />
            </div>
          </div>

          <div>
            <Label>Package Photo (optional)</Label>
            {dForm.photoPreview ? (
              <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
                <img src={dForm.photoPreview} alt="Package" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                <button onClick={() => setDF(p => ({ ...p, photo: null, photoPreview: null }))}
                  style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, background: 'rgba(0,0,0,0.55)', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} color="white" />
                </button>
                <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '4px 10px' }}>
                  <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, color: 'white' }}>Photo attached</span>
                </div>
              </div>
            ) : (
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <div style={{ background: CARD2, border: `2px dashed ${BORDER}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, background: 'rgba(255,56,92,0.08)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Camera size={24} color={BLUE} />
                  </div>
                  <p style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Add package photo</p>
                  <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>Take a photo to include in the resident notification</p>
                </div>
                <input type="file" accept="image/*" capture="environment" onChange={handleDeliveryPhoto} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Notify Resident toggle */}
          <button onClick={() => setDF(p => ({ ...p, notifyNow: !p.notifyNow }))}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', background: dForm.notifyNow ? 'rgba(52,199,89,0.06)' : CARD2, border: `1.5px solid ${dForm.notifyNow ? 'rgba(52,199,89,0.3)' : BORDER}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 150ms' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: dForm.notifyNow ? 'rgba(52,199,89,0.15)' : CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {dForm.notifyNow ? <Bell size={20} color="#34C759" /> : <BellOff size={20} color={MUTED} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: dForm.notifyNow ? TEXT : MUTED }}>
                {dForm.notifyNow ? 'Notify resident on log' : 'No notification'}
              </div>
              <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 2 }}>
                {dForm.notifyNow ? `Text sent to Unit ${dForm.unit || '—'}${dForm.residentName ? ` · ${dForm.residentName}` : ''}` : 'Tap to enable resident text notification'}
              </div>
            </div>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: dForm.notifyNow ? '#34C759' : 'transparent', border: dForm.notifyNow ? 'none' : `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {dForm.notifyNow && <Check size={14} color="white" />}
            </div>
          </button>
        </div>
        <PackageFooter onBack={() => setDStep(2)} onContinue={submitDelivery} continueLabel="Log Delivery" />
      </div>
    );
  }

  // ── LOG PICKUP WIZARD ─────────────────────────────────────────────────────
  if (view === 'pickup') {

    // Step 1: Pickup type + unit + resident
    if (pStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PackageHeader title="Identify the recipient" description="Locate the resident record and confirm who is collecting the package." step={1} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is picking up?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PICKUP_TYPES.map(({ id, Icon, label, desc }) => {
              const sel = pForm.pickupType === id;
              return (
                <button key={id} onClick={() => setPF(p => ({ ...p, pickupType: id }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: sel ? 'rgba(255,56,92,0.04)' : CARD, border: `1.5px solid ${sel ? BLUE : BORDER}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: sel ? `0 0 0 3px rgba(255,56,92,0.10)` : 'none', transition: 'all 150ms' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: sel ? 'rgba(255,56,92,0.12)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={24} color={sel ? BLUE : MUTED} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{label}</div>
                    <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                  </div>
                  {sel && (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={13} color="white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <Label>Unit Number *</Label>
            <input type="text" placeholder="e.g. 524" value={pForm.unit} onChange={e => setPF(p => ({ ...p, unit: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <Label>Resident Name *</Label>
            <input type="text" placeholder="Full name on record" value={pForm.residentName} onChange={e => setPF(p => ({ ...p, residentName: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <PackageFooter isFirst onContinue={() => setPStep(2)} continueDisabled={!pForm.unit || !pForm.residentName} />
      </div>
    );

    // Step 2: Count + third-party details
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PackageHeader title="Confirm the release" description="Record the quantity, authorization details, and recipient acknowledgment." step={2} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Pickup details
          </h2>

          <div>
            <Label>Packages Picked Up</Label>
            <Counter value={pForm.count} onChange={v => setPF(p => ({ ...p, count: v }))} />
          </div>

          {pForm.pickupType === 'third_party' && (
            <div style={{ background: 'rgba(255,149,0,0.04)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Third-Party Authorization</div>

              <div>
                <Label>Name of Person Picking Up</Label>
                <input type="text" placeholder="Full name" value={pForm.thirdPartyName} onChange={e => setPF(p => ({ ...p, thirdPartyName: e.target.value }))}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <Label>Relation to Resident</Label>
                <input type="text" placeholder="e.g. Spouse, Assistant, Friend" value={pForm.relation} onChange={e => setPF(p => ({ ...p, relation: e.target.value }))}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {[
                { key: 'idVerified',         label: 'Photo ID Verified'               },
                { key: 'residentAuthorized', label: 'Resident Pre-Authorized Pickup'  },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setPF(p => ({ ...p, [key]: !p[key] }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${pForm[key] ? BLUE : BORDER}`, background: pForm[key] ? BLUE : CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {pForm[key] && <Check size={14} color="white" strokeWidth={2.5} />}
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 500, color: TEXT }}>{label}</span>
                </button>
              ))}
            </div>
          )}
          {/* Signature */}
          <div>
            <Label>Resident / Recipient Signature *</Label>
            {pForm.signature ? (
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                <img src={pForm.signature} alt="Sig" style={{ width: '100%', height: 100, objectFit: 'contain', background: CARD2, display: 'block' }} />
                <div style={{ padding: '6px 12px', background: CARD2, borderTop: `1px solid ${BORDER}` }}>
                  <span style={{ fontFamily: INTER, fontSize: 11, color: MUTED }}>Signed {pForm.signedAt}</span>
                </div>
                <button onClick={() => setPF(p => ({ ...p, signature: null, signedAt: null }))}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 14 }}>✕</span>
                </button>
              </div>
            ) : showPkgSig ? (
              <SignaturePad signerName={pForm.pickupType === 'third_party' ? pForm.thirdPartyName : pForm.residentName} colors={{ TEXT, MUTED, BORDER, CARD2 }}
                onSave={(dataUrl, ts) => { setPF(p => ({ ...p, signature: dataUrl, signedAt: ts })); setShowPkgSig(false); }}
                onCancel={() => setShowPkgSig(false)} />
            ) : (
              <button onClick={() => setShowPkgSig(true)}
                style={{ width: '100%', padding: '14px 16px', background: CARD2, border: `1px dashed ${BORDER}`, borderRadius: 12, fontFamily: INTER, fontSize: 14, color: MUTED, cursor: 'pointer', textAlign: 'left' }}>
                ✍ Tap to capture signature
              </button>
            )}
          </div>
        </div>
        <PackageFooter onBack={() => setPStep(1)} onContinue={submitPickup} continueLabel="Log Pickup" continueDisabled={!pForm.signature} />
      </div>
    );
  }

  // ── RTS DROP-OFF WIZARD ───────────────────────────────────────────────────
  if (view === 'rtsDrop') {

    // Step 1: Select carrier
    if (rStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PackageHeader title="Identify the return carrier" description="Start a resident return-to-sender record with the expected carrier." step={1} totalSteps={2} onCancel={goBack} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:isPhone?18:'24px 28px' }}>
          <div style={{ background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.18)', borderRadius: 14, padding: '12px 16px', marginBottom: 20 }}>
            <span style={{ fontFamily: INTER, fontSize: 13, color: RED, fontWeight: 600 }}>Resident is returning a package for carrier pickup</span>
          </div>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            Which carrier?
          </h2>
          <div style={{display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9}}>
            {RTS_CARRIER_CONFIG.map((cfg,index) => (
              <CarrierCard key={cfg.id} cfg={cfg} index={index} selected={rdForm.carrier === cfg.id} onSelect={() => setRDF(p => ({ ...p, carrier: cfg.id }))} />
            ))}
          </div>
        </div>
        <PackageFooter isFirst onContinue={() => setRStep(2)} continueDisabled={!rdForm.carrier} />
      </div>
    );

    // Step 2: Resident details
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PackageHeader title="Document the return" description="Link the return to its resident, tracking details, and package count." step={2} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Resident details
          </h2>
          <div>
            <Label>Resident Name *</Label>
            <input type="text" placeholder="Full name" value={rdForm.residentName} onChange={e => setRDF(p => ({ ...p, residentName: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Unit Number *</Label>
            <input type="text" placeholder="e.g. 802" value={rdForm.unit} onChange={e => setRDF(p => ({ ...p, unit: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Package Count</Label>
            <Counter value={rdForm.count} onChange={v => setRDF(p => ({ ...p, count: v }))} />
          </div>
          <div>
            <Label>Tracking Number (optional)</Label>
            <input type="text" placeholder="If visible on label" value={rdForm.tracking} onChange={e => setRDF(p => ({ ...p, tracking: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <div style={{ position: 'relative' }}>
              <textarea placeholder="Prepaid label attached, damaged, etc." value={rdForm.notes} onChange={e => setRDF(p => ({ ...p, notes: e.target.value }))} rows={2}
                style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              <MicButton onTranscript={t => setRDF(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} />
            </div>
          </div>
        </div>
        <PackageFooter onBack={() => setRStep(1)} onContinue={submitRtsDrop} continueLabel="Log RTS Drop-Off" continueDisabled={!rdForm.residentName || !rdForm.unit} />
      </div>
    );
  }

  // ── RTS CARRIER PICKUP WIZARD ─────────────────────────────────────────────
  if (view === 'rtsPickup') {

    // Step 1: Select carrier
    if (rpStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PackageHeader title="Identify the collecting carrier" description="Choose the service arriving to collect pending return packages." step={1} totalSteps={2} onCancel={goBack} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:isPhone?18:'24px 28px' }}>
          <div style={{ background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.2)', borderRadius: 14, padding: '12px 16px', marginBottom: 20 }}>
            <span style={{ fontFamily: INTER, fontSize: 13, color: GREEN, fontWeight: 600 }}>Carrier has arrived to collect RTS packages</span>
          </div>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            Which carrier?
          </h2>
          <div style={{display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9}}>
            {RTS_CARRIER_CONFIG.map((cfg,index) => (
              <CarrierCard key={cfg.id} cfg={cfg} index={index} selected={rpForm.carrier === cfg.id} onSelect={() => setRPF(p => ({ ...p, carrier: cfg.id }))} />
            ))}
          </div>
        </div>
        <PackageFooter isFirst onContinue={() => setRPStep(2)} continueDisabled={!rpForm.carrier} />
      </div>
    );

    // Step 2: Confirm + notes
    const pendingForCarrier = rtsPending.filter(d => d.carrier === rpForm.carrier);
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PackageHeader title="Confirm carrier collection" description="Reconcile the package count and record the completed handoff." step={2} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Confirm collection
          </h2>

          {pendingForCarrier.length > 0 && (
            <div style={{ background: 'rgba(255,56,92,0.06)', border: '1px solid rgba(255,56,92,0.18)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 6 }}>
                {pendingForCarrier.length} pending item{pendingForCarrier.length > 1 ? 's' : ''} will be marked collected
              </div>
              {pendingForCarrier.map(d => (
                <div key={d.id} style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 4 }}>· {d.residentName} · Unit {d.unit} · {d.count} pkg{d.count > 1 ? 's' : ''}</div>
              ))}
            </div>
          )}

          <div>
            <Label>Packages Collected</Label>
            <Counter value={rpForm.count} onChange={v => setRPF(p => ({ ...p, count: v }))} />
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <div style={{ position: 'relative' }}>
              <textarea placeholder="Driver name, confirmation number, etc." value={rpForm.notes} onChange={e => setRPF(p => ({ ...p, notes: e.target.value }))} rows={2}
                style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              <MicButton onTranscript={t => setRPF(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} />
            </div>
          </div>
        </div>
        <PackageFooter onBack={() => setRPStep(1)} onContinue={submitRtsPickup} continueLabel="Confirm Pickup" />
      </div>
    );
  }

  // ── MAIN DASHBOARD VIEW ───────────────────────────────────────────────────
  const SUB_TABS = [
    { id: 'deliveries', label: 'Deliveries' },
    { id: 'pickups',    label: 'Pickups'    },
    { id: 'rts',        label: 'RTS'        },
    { id: 'audit',      label: 'Audit'      },
  ];

  return (
    <div style={{ flex:1,minHeight:0,display:'flex',flexDirection:'column',background:BG }}>
      <PackageHeader title="Packages" description="Receive, release, return, and reconcile property packages in one operational record." onCancel={onClose}/>
      <div style={{ flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',paddingBottom:isPhone?32:24 }}>

      {/* Desk context — mirrors the structured New Task setup panel */}
      <div style={{ padding:isPhone?'18px 16px 0':'20px 28px 0' }}>
        <div style={{ minHeight:82,boxSizing:'border-box',display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,overflow:'hidden',boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
          <div style={{ boxSizing:'border-box',padding:'13px 16px',display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:`${BLUE}10`,display:'flex',alignItems:'center',justifyContent:'center' }}><Package size={17} color={BLUE} /></div>
            <div><div style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:MUTED,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:4}}>On hand</div><div style={{fontFamily:INTER,fontSize:14,fontWeight:800,color:TEXT}}>{remaining} package{remaining===1?'':'s'} tracked</div></div>
          </div>
          <div style={{ boxSizing:'border-box',padding:'13px 16px',display:'flex',alignItems:'center',gap:12,borderLeft:isPhone?'none':`1px solid ${BORDER}`,borderTop:isPhone?`1px solid ${BORDER}`:'none' }}>
            <div style={{width:36,height:36,borderRadius:10,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center'}}><Truck size={17} color={TEXT}/></div>
            <div><div style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:MUTED,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:4}}>This shift</div><div style={{fontFamily:INTER,fontSize:14,fontWeight:800,color:TEXT}}>{totalIn} received · {totalOut} released</div></div>
          </div>
        </div>
      </div>

      {/* Sub-tab toggle */}
      <div style={{ padding:isPhone?'16px 16px 14px':'18px 28px 16px' }}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><span style={{width:24,height:2,background:BLUE}}/><span style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.16em',textTransform:'uppercase'}}>Package workflow</span></div>
        <div role="tablist" aria-label="Package workflow" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', background: CARD2, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 4, gap: 4 }}>
          {SUB_TABS.map(tab => (
            <button key={tab.id} role="tab" aria-selected={subTab === tab.id} onClick={() => setSubTab(tab.id)}
              style={{minHeight:44,padding:'0 6px',borderRadius:11,border:subTab===tab.id?`1px solid ${BORDER}`:'1px solid transparent',cursor:'pointer',background:subTab===tab.id?CARD:'transparent',transition:'all 160ms',boxShadow:subTab===tab.id?'0 2px 8px rgba(0,0,0,.07)':'none'}}>
              <span style={{fontFamily:INTER,fontSize:isPhone?11:12,fontWeight:750,color:subTab===tab.id?TEXT:MUTED}}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ margin: '0 16px 12px', background: TEXT, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Check size={16} color="white" />
          <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: 'white', flex: 1 }}>{toast}</span>
        </div>
      )}

      {/* DELIVERIES */}
      {subTab === 'deliveries' && (
        <div style={{ padding:isPhone?'0 16px':'0 28px',display:'flex',flexDirection:'column',gap:20 }}>
          <ActionRow Icon={Package} title="Log delivery" description="Record an incoming package and notify the resident." onClick={() => changeView('delivery')} compact={isPhone}/>

          {deliveries.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={20} color={BLUE} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Today's Deliveries</h2>
              </div>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,56,92,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: BLUE, flexShrink: 0 }}>{deliveries.length}</span>
            </div>
          )}

          {deliveries.length === 0 && (
            <EmptyState Icon={Package} title="No deliveries yet" description="Incoming packages logged this shift will appear here." />
          )}

          {deliveries.map(d => (
            <div key={d.id} style={{ background: CARD, border: `1px solid ${d.isFood ? 'rgba(255,149,0,0.25)' : BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: d.isFood ? '0 4px 16px rgba(255,149,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
              {d.photoPreview && (
                <div style={{ position: 'relative' }}>
                  <img src={d.photoPreview} alt="Package" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Camera size={11} color="white" />
                    <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: 'white' }}>PHOTO</span>
                  </div>
                </div>
              )}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                  <div style={{ width: 56, height: 56, background: d.isFood ? 'rgba(255,149,0,0.10)' : 'rgba(255,56,92,0.10)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={26} color={d.isFood ? ORANGE : BLUE} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      {d.isFood && <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: ORANGE, background: 'rgba(255,149,0,0.10)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Food · Urgent</span>}
                      <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT }}>{d.carrier}</span>
                      <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>→ Unit {d.unit}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: d.notes ? 4 : 0 }}>
                      <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{d.count} pkg{d.count > 1 ? 's' : ''}</span>
                      <span style={{ fontFamily: INTER, fontSize: 12, color: d.storage === 'Overflow Unit' ? ORANGE : BLUE, fontWeight: 600 }}>
                        {d.storage === 'Overflow Unit' ? `Overflow → Unit ${d.overflowUnit}` : d.storage}
                      </span>
                      <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginLeft: 'auto' }}>{d.time}</span>
                    </div>
                    {d.notes && <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: '0 0 4px', fontStyle: 'italic' }}>{d.notes}</p>}
                    {d.notifiedAt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                        <MessageCircle size={12} color={BLUE} />
                        <span style={{ fontFamily: INTER, fontSize: 11, color: BLUE, fontWeight: 600 }}>Notified {d.notifiedAt}</span>
                      </div>
                    )}
                  </div>
                </div>
                {d.notified ? (
                  <div style={{ padding: '12px 0', background: 'rgba(255,56,92,0.08)', border: '1px solid rgba(255,56,92,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <Check size={15} color={BLUE} />
                    <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: BLUE }}>Resident Notified</span>
                  </div>
                ) : (
                  <button onClick={() => notifyDelivery(d.id)}
                    style={{ width: '100%', padding: '13px 0', background: BLUE, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(255,56,92,0.28)' }}>
                    <MessageCircle size={16} />
                    Notify Resident{d.photoPreview ? ' with Photo' : ''}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PICKUPS */}
      {subTab === 'pickups' && (
        <div style={{ padding:isPhone?'0 16px':'0 28px',display:'flex',flexDirection:'column',gap:20 }}>
          <ActionRow Icon={Check} title="Log pickup" description="Record a resident or authorized third-party release." onClick={() => changeView('pickup')} compact={isPhone}/>

          {pickups.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={20} color={GREEN} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Today's Pickups</h2>
              </div>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(52,199,89,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: GREEN, flexShrink: 0 }}>{pickups.length}</span>
            </div>
          )}

          {pickups.length === 0 && (
            <EmptyState Icon={Check} title="No pickups yet" description="Resident and authorized releases will appear here." />
          )}

          {pickups.map(p => {
            const isThird = p.pickupType === 'third_party';
            const accent  = isThird ? ORANGE : GREEN;
            return (
              <div key={p.id} style={{ background: CARD, border: `1px solid ${isThird ? 'rgba(255,149,0,0.25)' : BORDER}`, borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 52, height: 52, background: `${accent}18`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={24} color={accent} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    {isThird && <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: ORANGE, background: 'rgba(255,149,0,0.10)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>3rd Party</span>}
                    <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{isThird ? p.thirdPartyName : p.residentName}</span>
                    <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>· Unit {p.unit}</span>
                    <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginLeft: 'auto' }}>{p.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{p.count} pkg{p.count > 1 ? 's' : ''}</span>
                    {isThird && (
                      <>
                        <span style={{ fontFamily: INTER, fontSize: 12, color: p.idVerified ? GREEN : RED, fontWeight: 600 }}>ID {p.idVerified ? '✓' : '✗'}</span>
                        {p.residentAuthorized && <span style={{ fontFamily: INTER, fontSize: 12, color: GREEN, fontWeight: 600 }}>Auth ✓</span>}
                        {p.relation && <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{p.relation} of {p.residentName}</span>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RTS */}
      {subTab === 'rts' && (
        <div style={{ padding:isPhone?'0 16px':'0 28px',display:'flex',flexDirection:'column',gap:20 }}>
          <div style={{ display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:10 }}>
            <ActionRow Icon={Plus} title="Resident drop-off" description="Create a return-to-sender record." onClick={() => changeView('rtsDrop')} compact />
            <ActionRow Icon={Truck} title="Carrier pickup" description="Mark awaiting returns as collected." onClick={() => changeView('rtsPickup')} compact />
          </div>

          {rtsPending.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RotateCcw size={20} color={RED} />
                  <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Awaiting Carrier</h2>
                </div>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,59,48,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: RED, flexShrink: 0 }}>{rtsPending.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rtsPending.map(d => (
                  <div key={d.id} style={{ background: CARD, border: '1.5px solid rgba(255,59,48,0.22)', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'flex-start', gap: 16, boxShadow: '0 4px 16px rgba(255,59,48,0.06)' }}>
                    <div style={{ width: 52, height: 52, background: 'rgba(255,59,48,0.10)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><RotateCcw size={24} color={RED} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: RED, background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.18)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>RTS · {d.carrier}</span>
                      </div>
                      <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 3px' }}>{d.residentName}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>Unit {d.unit}</span>
                        <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{d.count} pkg{d.count > 1 ? 's' : ''}</span>
                        {d.tracking && <span style={{ fontFamily: INTER, fontSize: 11, color: BLUE, fontWeight: 600 }}>#{d.tracking}</span>}
                      </div>
                    </div>
                    <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, flexShrink: 0 }}>{d.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rtsPickups.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={20} color={GREEN} />
                  <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Picked Up This Shift</h2>
                </div>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED, flexShrink: 0 }}>{rtsPickups.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rtsPickups.map(p => (
                  <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 44, height: 44, background: 'rgba(52,199,89,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Truck size={20} color={GREEN} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: GREEN, background: 'rgba(52,199,89,0.10)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Collected</span>
                        <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{p.carrier}</span>
                      </div>
                      <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{p.count} pkg{p.count > 1 ? 's' : ''}</span>
                    </div>
                    <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, flexShrink: 0 }}>{p.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rtsDropoffs.length === 0 && rtsPickups.length === 0 && (
            <EmptyState Icon={RotateCcw} title="No RTS activity yet" description="Return drop-offs and carrier collections will appear here." />
          )}
        </div>
      )}

      {/* AUDIT */}
      {subTab === 'audit' && (
        <div style={{ padding:isPhone?'0 16px':'0 28px',display:'flex',flexDirection:'column',gap:16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'Received',  value: totalIn,   color: BLUE,                           Icon: Package },
              { label: 'Picked Up', value: totalOut,  color: GREEN,                          Icon: Check   },
              { label: 'Remaining', value: remaining, color: remaining > 0 ? ORANGE : GREEN, Icon: Box     },
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

          {deliveries.length > 0 ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Truck size={18} color={BLUE} />
                  <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: 0 }}>By Carrier</h2>
                </div>
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
                  {CARRIER_CONFIG.map(({ id: carrier }, idx) => {
                    const count = deliveries.filter(d => d.carrier === carrier).reduce((s, d) => s + d.count, 0);
                    if (!count) return null;
                    return (
                      <div key={carrier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: idx > 0 ? `1px solid ${BORDER}` : 'none' }}>
                        <span style={{ fontFamily: INTER, fontSize: 14, color: TEXT }}>{carrier}</span>
                        <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: BLUE }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Package size={18} color={ORANGE} />
                  <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: 0 }}>By Storage</h2>
                </div>
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
                  {STORAGE_CONFIG.map(({ id: st }, idx) => {
                    const count = deliveries.filter(d => d.storage === st).reduce((s, d) => s + d.count, 0);
                    if (!count) return null;
                    return (
                      <div key={st} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: idx > 0 ? `1px solid ${BORDER}` : 'none' }}>
                        <span style={{ fontFamily: INTER, fontSize: 14, color: TEXT }}>{st}</span>
                        <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: ORANGE }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <EmptyState Icon={FileText} title="No deliveries logged yet" description="Delivery records will populate this shift audit automatically." />
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default PackageDashboard;
