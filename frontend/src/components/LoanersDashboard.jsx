import React, { useState } from 'react';
import { ShoppingCart, Archive, Key, Flame, AlertTriangle, Check, FileText, ChevronRight, RotateCcw, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SignaturePad } from './SignaturePad';
import MicButton from './MicButton';

const GREEN  = '#34C759';
const BLUE   = '#FF385C';
const ORANGE = '#FF9500';

const LOANER_INIT = [
  { id: 'cart-1',  name: 'Luggage Cart #1', desc: 'Front lobby, large rolling cart',  Icon: ShoppingCart, checkedOut: false, resident: null, unit: null, checkoutTime: null },
  { id: 'cart-2',  name: 'Luggage Cart #2', desc: 'Storage room, large rolling cart', Icon: ShoppingCart, checkedOut: false, resident: null, unit: null, checkoutTime: null },
  { id: 'firepit', name: 'Firepit Remote',  desc: 'Rooftop deck fire feature control', Icon: Flame,        checkedOut: false, resident: null, unit: null, checkoutTime: null },
  { id: 'grill',   name: 'Grilling Kit',   desc: 'BBQ tools and accessories set',     Icon: Archive,      checkedOut: false, resident: null, unit: null, checkoutTime: null },
  { id: 'tv-key',  name: 'TV Cabinet Key', desc: 'Common room TV cabinet key',        Icon: Key,          checkedOut: false, resident: null, unit: null, checkoutTime: null },
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

export const LoanersDashboard = ({ onActivityLogged }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const gc = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' };
  const [loaners,      setLoaners]      = useState(LOANER_INIT);
  const [subTab,       setSubTab]       = useState('items');
  const [view,         setView]         = useState('main');
  const [lStep,        setLStep]        = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [lForm,        setLF]           = useState({ resident: '', unit: '', notes: '', photo: null, photoPreview: null, signature: null, signedAt: null });
  const [returnNotes,  setReturnNotes]  = useState('');
  const [showSigPad,   setShowSigPad]   = useState(false);

  const openCheckout = (item) => { setSelectedItem(item); setView('checkout'); setLStep(1); };
  const openReturn   = (item) => { setSelectedItem(item); setView('return'); setReturnNotes(''); };
  const goBack       = () => { setView('main'); setSelectedItem(null); setLF({ resident: '', unit: '', notes: '', photo: null, photoPreview: null, signature: null, signedAt: null }); setLStep(1); setShowSigPad(false); setReturnNotes(''); };

  const checkoutLoaner = () => {
    if (!lForm.resident || !lForm.unit) return;
    setLoaners(p => p.map(l => l.id === selectedItem.id
      ? { ...l, checkedOut: true, resident: lForm.resident, unit: lForm.unit, checkoutTime: now() }
      : l
    ));
    onActivityLogged?.({ title: `Loaner checkout · ${selectedItem.name} · ${lForm.resident} · Unit ${lForm.unit}`, category: 'Amenity', notes: lForm.notes.trim(), evidenceUrls: lForm.photoPreview ? [lForm.photoPreview] : [] });
    goBack();
  };

  const checkinLoaner = () => {
    setLoaners(p => p.map(l => l.id === selectedItem.id
      ? { ...l, checkedOut: false, resident: null, unit: null, checkoutTime: null }
      : l
    ));
    onActivityLogged?.({ title: `Loaner return · ${selectedItem.name}`, category: 'Amenity', notes: returnNotes.trim() });
    goBack();
  };

  const openLoaners = loaners.filter(l => l.checkedOut);
  const allIn       = openLoaners.length === 0;

  // ── CHECK OUT WIZARD ──────────────────────────────────────────────────────
  if (view === 'checkout' && selectedItem) {
    const { Icon } = selectedItem;

    // Step 1: Confirm item
    if (lStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Check Out Item" step={1} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px' }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
            Confirm item
          </h2>

          {/* Selected item card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18, background: 'rgba(255,56,92,0.04)', border: `1.5px solid ${BLUE}`, borderRadius: 16, boxShadow: `0 0 0 3px rgba(255,56,92,0.10)` }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,56,92,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={26} color={BLUE} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT }}>{selectedItem.name}</div>
              <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.4 }}>{selectedItem.desc}</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={14} color="white" strokeWidth={3} />
            </div>
          </div>

          {/* Availability badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 16px', background: 'rgba(255,56,92,0.06)', border: '1px solid rgba(255,56,92,0.18)', borderRadius: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
            <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: BLUE }}>Available — ready to check out</span>
          </div>

          <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 20, lineHeight: 1.6 }}>
            On the next step, enter the resident's name and unit number to complete the checkout.
          </p>
        </div>
        <WizardFooter isFirst onContinue={() => setLStep(2)} continueLabel="Continue" />
      </div>
    );

    // Step 2: Resident details
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Check Out Item" step={2} totalSteps={2} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is checking out?
          </h2>

          {/* Item summary chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: CARD2, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            <Icon size={16} color={BLUE} />
            <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: TEXT }}>{selectedItem.name}</span>
          </div>

          <div>
            <Label>Resident Name *</Label>
            <input type="text" placeholder="Full name on record" value={lForm.resident} onChange={e => setLF(p => ({ ...p, resident: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <Label>Unit Number *</Label>
            <input type="text" placeholder="e.g. 412" value={lForm.unit} onChange={e => setLF(p => ({ ...p, unit: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Optional condition photo */}
          <div>
            <Label>Item Condition Photo <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>(optional)</span></Label>
            {lForm.photoPreview ? (
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                <img src={lForm.photoPreview} alt="Item" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                <button onClick={() => setLF(p => ({ ...p, photo: null, photoPreview: null }))}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 14, lineHeight: 1 }}>✕</span>
                </button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: CARD2, border: `1px dashed ${BORDER}`, borderRadius: 12, cursor: 'pointer' }}>
                <Camera size={20} color={MUTED} />
                <span style={{ fontFamily: INTER, fontSize: 14, color: MUTED }}>Document item condition at checkout</span>
                <input type="file" accept="image/*" capture="environment" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => setLF(p => ({ ...p, photo: file, photoPreview: reader.result }));
                  reader.readAsDataURL(file);
                }} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Resident signature */}
          <div>
            <Label>Resident Signature *</Label>
            {lForm.signature ? (
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                <img src={lForm.signature} alt="Signature" style={{ width: '100%', height: 100, objectFit: 'contain', background: CARD2, display: 'block' }} />
                <div style={{ padding: '6px 12px', background: CARD2, borderTop: `1px solid ${BORDER}` }}>
                  <span style={{ fontFamily: INTER, fontSize: 11, color: MUTED }}>Signed {lForm.signedAt}</span>
                </div>
                <button onClick={() => setLF(p => ({ ...p, signature: null, signedAt: null }))}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 14 }}>✕</span>
                </button>
              </div>
            ) : showSigPad ? (
              <SignaturePad signerName={lForm.resident} colors={{ TEXT, MUTED, BORDER, CARD2 }}
                onSave={(dataUrl, ts) => { setLF(p => ({ ...p, signature: dataUrl, signedAt: ts })); setShowSigPad(false); }}
                onCancel={() => setShowSigPad(false)} />
            ) : (
              <button onClick={() => setShowSigPad(true)}
                style={{ width: '100%', padding: '14px 16px', background: CARD2, border: `1px dashed ${BORDER}`, borderRadius: 12, fontFamily: INTER, fontSize: 14, color: MUTED, cursor: 'pointer', textAlign: 'left' }}>
                ✍ Tap to capture resident signature
              </button>
            )}
          </div>

          <div style={{ background: 'rgba(255,56,92,0.06)', border: '1px solid rgba(255,56,92,0.18)', borderRadius: 12, padding: '12px 16px' }}>
            <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              The item will be marked <strong style={{ color: TEXT }}>checked out</strong> and the resident will be responsible for its return before shift close.
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <Label>Notes <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>(optional — or use mic)</span></Label>
            <textarea
              value={lForm.notes}
              onChange={e => setLF(p => ({ ...p, notes: e.target.value }))}
              placeholder="e.g. Item was in good condition, resident needed it for moving boxes…"
              rows={3}
              style={{ width: '100%', padding: '14px 16px', paddingRight: 48, borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
            />
            <MicButton onTranscript={t => setLF(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} />
          </div>
        </div>
        <WizardFooter onBack={() => setLStep(1)} onContinue={checkoutLoaner} continueLabel="Check Out" continueDisabled={!lForm.resident || !lForm.unit || !lForm.signature} />
      </div>
    );
  }

  // ── RETURN CONFIRMATION ───────────────────────────────────────────────────
  if (view === 'return' && selectedItem) {
    const { Icon } = selectedItem;
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Return Item" step={1} totalSteps={1} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Confirm return
          </h2>

          {/* Item card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18, background: 'rgba(255,149,0,0.04)', border: `1.5px solid ${ORANGE}`, borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,149,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={26} color={ORANGE} />
            </div>
            <div>
              <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT }}>{selectedItem.name}</div>
              <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 3 }}>{selectedItem.desc}</div>
            </div>
          </div>

          {/* Who has it */}
          <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Currently Checked Out By</div>
            <div style={{ fontFamily: INTER, fontSize: 18, fontWeight: 700, color: TEXT }}>{selectedItem.resident}</div>
            <div style={{ fontFamily: INTER, fontSize: 14, color: MUTED, marginTop: 5 }}>Unit {selectedItem.unit} · Checked out at {selectedItem.checkoutTime}</div>
          </div>

          <div style={{ background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.22)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <RotateCcw size={15} color={GREEN} style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              Confirming return will mark this item as <strong style={{ color: TEXT }}>available</strong> and clear the checkout record.
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <Label>Return Notes <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>(optional — or use mic)</span></Label>
            <textarea
              value={returnNotes}
              onChange={e => setReturnNotes(e.target.value)}
              placeholder="e.g. Item returned in good condition, no damage observed…"
              rows={3}
              style={{ width: '100%', padding: '14px 16px', paddingRight: 48, borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
            />
            <MicButton onTranscript={t => setReturnNotes(p => p ? p + ' ' + t : t)} />
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: '12px 20px 24px', background: CARD, borderTop: `1px solid ${BORDER}` }}>
          <button onClick={checkinLoaner}
            style={{ width: '100%', padding: '15px 0', background: BLUE, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 6px 20px ${BLUE}28` }}>
            Confirm Return
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN LIST / AUDIT VIEW ────────────────────────────────────────────────
  const availableItems = loaners.filter(l => !l.checkedOut);

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 24, background: BG }}>

      {/* Sub-tab toggle */}
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ display: 'flex', background: CARD2, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 3 }}>
          {[{ id: 'items', label: 'Items' }, { id: 'audit', label: 'Audit' }].map(tab => (
            <button key={tab.id} onClick={() => setSubTab(tab.id)}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: subTab === tab.id ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', background: subTab === tab.id ? CARD : 'transparent', transition: 'background 150ms', boxShadow: subTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: subTab === tab.id ? TEXT : MUTED }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS */}
      {subTab === 'items' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Outstanding alert */}
          {openLoaners.length > 0 && (
            <div style={{ background: 'rgba(255,149,0,0.08)', border: '1.5px solid rgba(255,149,0,0.30)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,149,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color={ORANGE} />
              </div>
              <div>
                <p style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: ORANGE, margin: '0 0 2px' }}>
                  {openLoaners.length} item{openLoaners.length > 1 ? 's' : ''} out
                </p>
                <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0 }}>Must be returned before shift close</p>
              </div>
            </div>
          )}

          {/* Checked Out section */}
          {openLoaners.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RotateCcw size={18} color={ORANGE} />
                  <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: 0 }}>Checked Out</h2>
                </div>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,149,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: ORANGE }}>{openLoaners.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {openLoaners.map(item => {
                  const { Icon } = item;
                  return (
                    <div key={item.id} style={{ background: CARD, border: `1.5px solid rgba(255,149,0,0.30)`, borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(255,149,0,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,149,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={26} color={ORANGE} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 3px' }}>{item.name}</p>
                          <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0 }}>{item.resident} · Unit {item.unit} · since {item.checkoutTime}</p>
                        </div>
                        <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: ORANGE, background: 'rgba(255,149,0,0.12)', borderRadius: 6, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Out</span>
                      </div>
                      <button onClick={() => openReturn(item)}
                        style={{ width: '100%', padding: '13px 0', background: ORANGE, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,149,0,0.30)' }}>
                        Return Item
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={18} color={BLUE} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: 0 }}>Available</h2>
              </div>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: MUTED }}>{availableItems.length}</span>
            </div>
            {availableItems.length === 0 ? (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: CARD2, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <ShoppingCart size={26} color={MUTED} />
                </div>
                <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 15, margin: '0 0 4px' }}>All items checked out</p>
                <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>No items available right now</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {availableItems.map(item => {
                  const { Icon } = item;
                  return (
                    <div key={item.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,56,92,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={26} color={BLUE} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 3px' }}>{item.name}</p>
                          <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0 }}>{item.desc}</p>
                        </div>
                        <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: GREEN, background: 'rgba(52,199,89,0.12)', borderRadius: 6, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Available</span>
                      </div>
                      <button onClick={() => openCheckout(item)}
                        style={{ width: '100%', padding: '13px 0', background: BLUE, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,56,92,0.28)' }}>
                        Check Out
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUDIT */}
      {subTab === 'audit' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'Total',      value: loaners.length,                     color: TEXT,                                Icon: ShoppingCart },
              { label: 'Checked Out',value: openLoaners.length,                  color: openLoaners.length > 0 ? ORANGE : MUTED, Icon: RotateCcw },
              { label: 'Available',  value: loaners.length - openLoaners.length, color: BLUE,                              Icon: Check },
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

          {/* Item Status section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color={BLUE} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: 0 }}>Item Status</h2>
              </div>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: MUTED }}>{loaners.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loaners.map(item => (
                <div key={item.id} style={{ background: CARD, border: `1px solid ${item.checkedOut ? 'rgba(255,149,0,0.25)' : BORDER}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: item.checkedOut ? 'rgba(255,149,0,0.10)' : 'rgba(255,56,92,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.Icon size={20} color={item.checkedOut ? ORANGE : BLUE} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 2px' }}>{item.name}</p>
                    {item.checkedOut && <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0 }}>{item.resident} · Unit {item.unit}</p>}
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 800, color: item.checkedOut ? ORANGE : GREEN, background: item.checkedOut ? 'rgba(255,149,0,0.10)' : 'rgba(52,199,89,0.10)', borderRadius: 7, padding: '3px 9px', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                    {item.checkedOut ? 'Out' : 'In'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shift close status */}
          <div style={{ background: CARD, border: `1.5px solid ${allIn ? 'rgba(52,199,89,0.25)' : 'rgba(255,149,0,0.25)'}`, borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: allIn ? '0 4px 16px rgba(52,199,89,0.08)' : '0 4px 16px rgba(255,149,0,0.08)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: allIn ? 'rgba(52,199,89,0.10)' : 'rgba(255,149,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {allIn ? <Check size={26} color={GREEN} /> : <AlertTriangle size={26} color={ORANGE} />}
            </div>
            <div>
              <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 3px' }}>
                {allIn ? 'All Items Returned' : 'Items Outstanding'}
              </p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>
                {allIn
                  ? 'Loaner inventory complete. Ready to close shift.'
                  : `${openLoaners.length} item${openLoaners.length > 1 ? 's' : ''} must be returned before clocking out.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanersDashboard;
