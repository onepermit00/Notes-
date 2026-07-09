import React, { useState } from 'react';
import { Package, Plus, Minus, Check, Truck, RotateCcw, ChevronRight, FileText, ArrowLeft, Camera, MessageCircle, X, Mail, ShoppingBag, Globe, UtensilsCrossed, Box, User, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SignaturePad } from './SignaturePad';
import { authApi } from '../services/authApi';

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

function CarrierCard({ cfg, selected, onSelect, accent = BLUE }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  const { id, Icon, desc, isFood } = cfg;
  const cardAccent = isFood && !selected ? ORANGE : accent;
  return (
    <button onClick={onSelect}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: selected ? `rgba(255,56,92,0.04)` : CARD, border: `1.5px solid ${selected ? BLUE : BORDER}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: selected ? `0 0 0 3px rgba(255,56,92,0.10)` : 'none', transition: 'all 150ms' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: selected ? 'rgba(255,56,92,0.12)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}>
        <Icon size={24} color={selected ? BLUE : isFood ? ORANGE : MUTED} />
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

export const PackageDashboard = ({ onActivityLogged }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const gc = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' };
  const [subTab,      setSubTab]      = useState('deliveries');
  const [view,        setView]        = useState('main');
  const [deliveries,  setDeliveries]  = useState([]);
  const [pickups,     setPickups]     = useState([]);
  const [rtsDropoffs, setRtsDropoffs] = useState([]);
  const [rtsPickups,  setRtsPickups]  = useState([]);

  // Wizard step states
  const [dStep,  setDStep]  = useState(1);
  const [pStep,  setPStep]  = useState(1);
  const [rStep,  setRStep]  = useState(1);
  const [rpStep, setRPStep] = useState(1);

  const [dForm, setDF] = useState({ carrier: '', unit: '', count: 1, storage: 'Luxer Locker', overflowUnit: '', notes: '', photo: null, photoPreview: null });
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
    setView('main');
    setDStep(1); setPStep(1); setRStep(1); setRPStep(1);
  };

  const submitDelivery = () => {
    if (!dForm.carrier || !dForm.unit) return;
    setDeliveries(p => [{ ...dForm, id: Date.now(), time: now(), isFood: dForm.carrier === 'Food Delivery', notified: false, notifiedAt: null }, ...p]);
    onActivityLogged?.({ title: `Package delivery · ${dForm.carrier} → Unit ${dForm.unit}`, category: 'Delivery', notes: dForm.notes, evidenceUrls: dForm.photoPreview ? [dForm.photoPreview] : [] });
    setDF({ carrier: '', unit: '', count: 1, storage: 'Luxer Locker', overflowUnit: '', notes: '', photo: null, photoPreview: null });
    setDStep(1);
    setView('main');
  };

  const submitPickup = () => {
    if (!pForm.unit || !pForm.residentName || !pForm.signature) return;
    setPickups(p => [{ ...pForm, id: Date.now(), time: now() }, ...p]);
    onActivityLogged?.({ title: `Package pickup · ${pForm.residentName} · Unit ${pForm.unit}`, category: 'Delivery', notes: pForm.pickupType === 'third_party' ? `Third party: ${pForm.thirdPartyName}` : '' });
    setPF({ unit: '', residentName: '', count: 1, pickupType: 'resident', thirdPartyName: '', relation: '', idVerified: false, residentAuthorized: false, signature: null, signedAt: null });
    setShowPkgSig(false);
    setPStep(1);
    setView('main');
  };

  const submitRtsDrop = () => {
    if (!rdForm.residentName || !rdForm.unit || !rdForm.carrier) return;
    setRtsDropoffs(p => [{ ...rdForm, id: Date.now(), time: now(), pickedUp: false }, ...p]);
    onActivityLogged?.({ title: `RTS drop-off · ${rdForm.residentName} · ${rdForm.carrier}`, category: 'Delivery', notes: rdForm.notes });
    setRDF({ residentName: '', unit: '', carrier: '', count: 1, tracking: '', notes: '' });
    setRStep(1);
    setView('main');
  };

  const submitRtsPickup = () => {
    if (!rpForm.carrier) return;
    setRtsPickups(p => [{ ...rpForm, id: Date.now(), time: now() }, ...p]);
    setRtsDropoffs(p => p.map(d => !d.pickedUp && d.carrier === rpForm.carrier ? { ...d, pickedUp: true, pickupTime: now() } : d));
    onActivityLogged?.({ title: `RTS carrier pickup · ${rpForm.carrier} · ${rpForm.count} pkg${rpForm.count > 1 ? 's' : ''}`, category: 'Delivery', notes: rpForm.notes });
    setRPF({ carrier: '', count: 1, notes: '' });
    setRPStep(1);
    setView('main');
  };

  // ── LOG DELIVERY WIZARD ───────────────────────────────────────────────────
  if (view === 'delivery') {

    // Step 1: Carrier selection
    if (dStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Delivery" step={1} totalSteps={3} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px' }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            Who is the carrier?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CARRIER_CONFIG.map(cfg => (
              <CarrierCard key={cfg.id} cfg={cfg} selected={dForm.carrier === cfg.id} onSelect={() => setDF(p => ({ ...p, carrier: cfg.id }))} />
            ))}
          </div>
        </div>
        <WizardFooter isFirst onContinue={() => setDStep(2)} continueDisabled={!dForm.carrier} />
      </div>
    );

    // Step 2: Package details
    if (dStep === 2) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Delivery" step={2} totalSteps={3} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Package details
          </h2>
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
        <WizardFooter onBack={() => setDStep(1)} onContinue={() => setDStep(3)} continueDisabled={!dForm.unit} />
      </div>
    );

    // Step 3: Notes & photo
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Delivery" step={3} totalSteps={3} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Notes & photo
          </h2>

          <div>
            <Label>Notes (optional)</Label>
            <textarea placeholder="Damaged box, signature required, suspicious odor..." value={dForm.notes} onChange={e => setDF(p => ({ ...p, notes: e.target.value }))} rows={3}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
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

          <div style={{ background: 'rgba(255,56,92,0.06)', border: '1px solid rgba(255,56,92,0.18)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <MessageCircle size={16} color={BLUE} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              After logging, tap <strong style={{ color: TEXT }}>Notify Resident</strong> on the delivery card to send a text{dForm.photoPreview ? ' with the photo' : ''}.
            </span>
          </div>
        </div>
        <WizardFooter onBack={() => setDStep(2)} onContinue={submitDelivery} continueLabel="Log Delivery" />
      </div>
    );
  }

  // ── LOG PICKUP WIZARD ─────────────────────────────────────────────────────
  if (view === 'pickup') {

    // Step 1: Pickup type + unit + resident
    if (pStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Pickup" step={1} totalSteps={2} onCancel={goBack} />
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
        <WizardFooter isFirst onContinue={() => setPStep(2)} continueDisabled={!pForm.unit || !pForm.residentName} />
      </div>
    );

    // Step 2: Count + third-party details
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Pickup" step={2} totalSteps={2} onCancel={goBack} />
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
        <WizardFooter onBack={() => setPStep(1)} onContinue={submitPickup} continueLabel="Log Pickup" continueDisabled={!pForm.signature} />
      </div>
    );
  }

  // ── RTS DROP-OFF WIZARD ───────────────────────────────────────────────────
  if (view === 'rtsDrop') {

    // Step 1: Select carrier
    if (rStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="RTS Drop-Off" step={1} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px' }}>
          <div style={{ background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.18)', borderRadius: 14, padding: '12px 16px', marginBottom: 20 }}>
            <span style={{ fontFamily: INTER, fontSize: 13, color: RED, fontWeight: 600 }}>Resident is returning a package for carrier pickup</span>
          </div>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            Which carrier?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RTS_CARRIER_CONFIG.map(cfg => (
              <CarrierCard key={cfg.id} cfg={cfg} selected={rdForm.carrier === cfg.id} onSelect={() => setRDF(p => ({ ...p, carrier: cfg.id }))} />
            ))}
          </div>
        </div>
        <WizardFooter isFirst onContinue={() => setRStep(2)} continueDisabled={!rdForm.carrier} />
      </div>
    );

    // Step 2: Resident details
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="RTS Drop-Off" step={2} totalSteps={2} onCancel={goBack} />
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
            <textarea placeholder="Prepaid label attached, damaged, etc." value={rdForm.notes} onChange={e => setRDF(p => ({ ...p, notes: e.target.value }))} rows={2}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <WizardFooter onBack={() => setRStep(1)} onContinue={submitRtsDrop} continueLabel="Log RTS Drop-Off" continueDisabled={!rdForm.residentName || !rdForm.unit} />
      </div>
    );
  }

  // ── RTS CARRIER PICKUP WIZARD ─────────────────────────────────────────────
  if (view === 'rtsPickup') {

    // Step 1: Select carrier
    if (rpStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Carrier Pickup" step={1} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px' }}>
          <div style={{ background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.2)', borderRadius: 14, padding: '12px 16px', marginBottom: 20 }}>
            <span style={{ fontFamily: INTER, fontSize: 13, color: GREEN, fontWeight: 600 }}>Carrier has arrived to collect RTS packages</span>
          </div>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            Which carrier?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RTS_CARRIER_CONFIG.map(cfg => (
              <CarrierCard key={cfg.id} cfg={cfg} selected={rpForm.carrier === cfg.id} onSelect={() => setRPF(p => ({ ...p, carrier: cfg.id }))} />
            ))}
          </div>
        </div>
        <WizardFooter isFirst onContinue={() => setRPStep(2)} continueDisabled={!rpForm.carrier} />
      </div>
    );

    // Step 2: Confirm + notes
    const pendingForCarrier = rtsPending.filter(d => d.carrier === rpForm.carrier);
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Carrier Pickup" step={2} totalSteps={2} onCancel={goBack} />
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
            <textarea placeholder="Driver name, confirmation number, etc." value={rpForm.notes} onChange={e => setRPF(p => ({ ...p, notes: e.target.value }))} rows={2}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <WizardFooter onBack={() => setRPStep(1)} onContinue={submitRtsPickup} continueLabel="Confirm Pickup" />
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
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 24, background: BG }}>

      {/* Sub-tab toggle */}
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ display: 'flex', background: CARD2, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 3, gap: 3 }}>
          {SUB_TABS.map(tab => (
            <button key={tab.id} onClick={() => setSubTab(tab.id)}
              style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: subTab === tab.id ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', background: subTab === tab.id ? CARD : 'transparent', transition: 'background 150ms', boxShadow: subTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: subTab === tab.id ? TEXT : MUTED }}>{tab.label}</span>
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
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <button onClick={() => setView('delivery')}
            style={{ width: '100%', padding: 20, background: BLUE, borderRadius: 20, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: `0 8px 28px ${BLUE}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.20)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={28} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: INTER, fontSize: 17, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>Log Delivery</p>
                <p style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: 0 }}>Record an incoming package</p>
              </div>
            </div>
            <ChevronRight size={24} color="rgba(255,255,255,0.72)" />
          </button>

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
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: CARD2, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Package size={30} color={MUTED} /></div>
              <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: '0 0 5px' }}>No deliveries yet</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Tap above to log one</p>
            </div>
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
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <button onClick={() => setView('pickup')}
            style={{ width: '100%', padding: 20, background: GREEN, borderRadius: 20, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 8px 28px rgba(52,199,89,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.20)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={28} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: INTER, fontSize: 17, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>Log Pickup</p>
                <p style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: 0 }}>Record a resident or third-party pickup</p>
              </div>
            </div>
            <ChevronRight size={24} color="rgba(255,255,255,0.72)" />
          </button>

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
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: CARD2, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Check size={30} color={MUTED} /></div>
              <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: '0 0 5px' }}>No pickups yet</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Tap above to log one</p>
            </div>
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
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setView('rtsDrop')}
              style={{ padding: 18, background: RED, borderRadius: 18, border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, cursor: 'pointer', boxShadow: 'rgba(255,59,48,0.35) 0 8px 24px' }}>
              <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.20)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={24} color="white" /></div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', margin: '0 0 2px' }}>Resident Drop-Off</p>
                <p style={{ fontFamily: INTER, fontSize: 11, color: 'rgba(255,255,255,0.72)', margin: 0 }}>Log a return</p>
              </div>
            </button>
            <button onClick={() => setView('rtsPickup')}
              style={{ padding: 18, background: BLUE, borderRadius: 18, border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, cursor: 'pointer', boxShadow: `${BLUE}40 0 8px 24px` }}>
              <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.20)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Truck size={24} color="white" /></div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', margin: '0 0 2px' }}>Carrier Pickup</p>
                <p style={{ fontFamily: INTER, fontSize: 11, color: 'rgba(255,255,255,0.72)', margin: 0 }}>Mark collected</p>
              </div>
            </button>
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
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: CARD2, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><RotateCcw size={30} color={MUTED} /></div>
              <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: '0 0 5px' }}>No RTS activity yet</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Tap above to log one</p>
            </div>
          )}
        </div>
      )}

      {/* AUDIT */}
      {subTab === 'audit' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: CARD2, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><FileText size={30} color={MUTED} /></div>
              <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: '0 0 5px' }}>No deliveries logged yet</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Deliveries will appear here for your shift audit</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PackageDashboard;
