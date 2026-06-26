import React, { useState } from 'react';
import {
  Camera, AlertTriangle, Clock, Check,
  ChevronRight, Plus, Trash2, Shield,
  HelpCircle, FileText, Car, Volume2, Package,
  Wrench, Users, Zap
} from 'lucide-react';

const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const BG     = '#FFFFFF';
const CARD   = '#FFFFFF';
const CARD2  = '#F7F7F7';
const TEXT   = '#222222';
const MUTED  = '#717171';
const BLUE   = '#FF385C';
const RED    = '#FF3B30';
const GREEN  = '#34C759';
const BORDER = '#EBEBEB';
const SHADOW = '0 2px 12px rgba(0,0,0,0.08)';

const glass = () => ({
  background: CARD,
  border: `1px solid ${BORDER}`,
});

const glassCard = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
};

const baseInput = {
  width: '100%',
  padding: '14px 16px',
  background: CARD2,
  borderRadius: 12,
  color: TEXT,
  outline: 'none',
  fontSize: 16,
  fontFamily: INTER,
  resize: 'none',
  boxSizing: 'border-box',
};

const INCIDENT_TYPES = [
  { id: 'noise',        label: 'Noise Complaint',       icon: Volume2,       description: 'Noise disturbance, loud music, or after-hours party' },
  { id: 'unauthorized', label: 'Unauthorized Access',   icon: Shield,        description: 'Trespassing, tailgating, or unverified entry' },
  { id: 'parking',      label: 'Parking Violation',     icon: Car,           description: 'Unauthorized vehicle, wrong space, or blocked access' },
  { id: 'maintenance',  label: 'Facility Issue',        icon: Wrench,        description: 'Equipment failure, damage, or hazard in common area' },
  { id: 'disturbance',  label: 'Disturbance / Altercation', icon: Users,     description: 'Resident conflict, aggressive behavior, or altercation' },
  { id: 'package',      label: 'Package Issue',         icon: Package,       description: 'Damaged, missing, misdelivered, or suspicious package' },
  { id: 'utility',      label: 'Utility / Power',       icon: Zap,           description: 'Power outage, water leak, elevator, or gas issue' },
  { id: 'other',        label: 'Other',                 icon: HelpCircle,    description: 'Any other incident requiring documentation' },
];

const SEVERITY_LEVELS = [
  { id: 'low',      label: 'Low',      color: '#16a34a' },
  { id: 'medium',   label: 'Medium',   color: '#ca8a04' },
  { id: 'high',     label: 'High',     color: '#ea580c' },
  { id: 'critical', label: 'Critical', color: '#dc2626' },
];

export const IncidentReportPage = ({ patientName = 'The Greystone at Midtown', incidents = [], onAddIncident }) => {
  const [activeView,       setActiveView]       = useState('history');
  const [step,             setStep]             = useState(1);
  const [incidentType,     setIncidentType]     = useState(null);
  const [severity,         setSeverity]         = useState(null);
  const [description,      setDescription]      = useState('');
  const [actionsTaken,     setActionsTaken]     = useState('');
  const [witnessNames,     setWitnessNames]     = useState('');
  const [noWitnesses,      setNoWitnesses]      = useState(false);
  const [photos,           setPhotos]           = useState([]);
  const [notifyFamily,     setNotifyFamily]     = useState(true);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [showSuccess,      setShowSuccess]      = useState(false);

  const handlePhotoUpload = (e) => {
    Array.from(e.target.files || []).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotos(prev => [...prev, { id: Date.now() + Math.random(), url: reader.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };

  const handleNext = () => { if (step < 5) { window.scrollTo(0, 0); setStep(step + 1); } };
  const handleBack = () => { if (step > 1) { window.scrollTo(0, 0); setStep(step - 1); } };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newIncident = {
      id: Date.now(), type: incidentType, severity, description, actionsTaken,
      witnesses: noWitnesses ? 'No witnesses present' : witnessNames,
      photos, notifyFamily, followUpRequired, patientName,
      createdAt: new Date().toLocaleString()
    };
    if (onAddIncident) onAddIncident(newIncident);
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setStep(1); setIncidentType(null); setSeverity(null); setDescription('');
    setActionsTaken(''); setWitnessNames(''); setNoWitnesses(false);
    setPhotos([]); setNotifyFamily(true); setFollowUpRequired(false);
    setShowSuccess(false); setActiveView('history');
  };

  const isNextDisabled = () => (step === 1 && !incidentType) || (step === 2 && (!severity || !description));

  const selectedType     = INCIDENT_TYPES.find(t => t.id === incidentType);
  const selectedSeverity = SEVERITY_LEVELS.find(s => s.id === severity);

  // ── New Report Form ──────────────────────────────────────────────────────────
  if (activeView === 'new') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', background: BG, fontFamily: INTER }} data-testid="incident-form-overlay">

        {/* Success Screen */}
        {showSuccess ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: GREEN, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 32px rgba(46,158,91,0.3)' }}>
              <Check size={40} color="white" />
            </div>
            <h2 style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 8 }}>Report Submitted</h2>
            <p style={{ fontSize: 15, color: MUTED, marginBottom: 32, lineHeight: 1.6 }}>
              Your incident report has been submitted successfully.
              {notifyFamily && ' Property manager has been notified.'}
            </p>
            <button onClick={resetForm}
              style={{ padding: '16px 40px', background: BLUE, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 16, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 8px 24px ${BLUE}40` }}
              data-testid="incident-done-btn">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ flexShrink: 0, padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, background: CARD }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontFamily: INTER, fontSize: '1.1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>New Property Incident</h2>
                  <p style={{ fontSize: 13, color: MUTED }}>Step {step} of 5</p>
                </div>
                <button onClick={() => { window.scrollTo(0, 0); setActiveView('history'); }}
                  style={{ padding: '10px 20px', ...glass(), borderRadius: 12, fontSize: 14, fontWeight: 600, color: TEXT, cursor: 'pointer', fontFamily: INTER }}
                  data-testid="incident-cancel-btn">
                  Cancel
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map((s) => (
                  <div key={s} style={{ height: 4, flex: 1, borderRadius: 999, background: s <= step ? RED : 'rgba(0,0,0,0.10)' }} />
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '24px 20px' }}>

                {/* Step 1: Type */}
                {step === 1 && (
                  <div data-testid="incident-step-1">
                    <h3 style={{ fontFamily: INTER, fontSize: '1.2rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 20 }}>What type of property incident?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {INCIDENT_TYPES.map((type) => {
                        const sel = incidentType === type.id;
                        return (
                          <button key={type.id} onClick={() => setIncidentType(type.id)}
                            style={{ padding: 20, borderRadius: 16, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                              background: sel ? 'rgba(239,68,68,0.06)' : CARD,
                              border: sel ? `2px solid ${RED}` : `2px solid ${BORDER}`,
                              boxShadow: sel ? `0 4px 20px rgba(239,68,68,0.12)` : SHADOW,
                            }}
                            data-testid={`incident-type-${type.id}`}>
                            <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: sel ? 'rgba(239,68,68,0.12)' : CARD2 }}>
                              <type.icon size={24} color={sel ? RED : MUTED} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, color: TEXT, fontSize: 18, marginBottom: 2 }}>{type.label}</p>
                              <p style={{ fontSize: 14, color: MUTED }}>{type.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Severity & Details */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} data-testid="incident-step-2">
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 12 }}>Severity Level</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {SEVERITY_LEVELS.map((level) => (
                          <button key={level.id} onClick={() => setSeverity(level.id)}
                            style={{ padding: '12px 0', borderRadius: 12, textAlign: 'center', fontFamily: INTER, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              background: severity === level.id ? level.color : CARD2,
                              border: severity === level.id ? 'none' : `1px solid ${BORDER}`,
                              color: severity === level.id ? 'white' : MUTED,
                            }}
                            data-testid={`severity-${level.id}`}>
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 12 }}>What happened?</h3>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the incident. Include location, unit number, parties involved, and what you observed..." rows={5}
                        style={{ ...baseInput, border: description ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}` }}
                        data-testid="incident-description" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 12 }}>Actions Taken</h3>
                      <textarea value={actionsTaken} onChange={(e) => setActionsTaken(e.target.value)}
                        placeholder="What did you do to address this?" rows={4}
                        style={{ ...baseInput, border: actionsTaken ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}` }}
                        data-testid="incident-actions" />
                    </div>
                  </div>
                )}

                {/* Step 3: Witnesses */}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} data-testid="incident-step-3">
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: '1.2rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 8 }}>Witness Information</h3>
                      <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>Document any witnesses present during the incident for legal and record-keeping purposes.</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: TEXT, display: 'block', marginBottom: 10 }}>Witness Name(s)</label>
                      <textarea value={witnessNames} onChange={(e) => setWitnessNames(e.target.value)}
                        placeholder="Enter the names of any witnesses present..." rows={5}
                        disabled={noWitnesses}
                        style={{ ...baseInput, opacity: noWitnesses ? 0.5 : 1, border: (witnessNames && !noWitnesses) ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}` }}
                        data-testid="incident-witnesses" />
                    </div>
                    <div style={{ background: '#EEF2FA', border: '1px solid rgba(58,123,213,0.2)', borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: MUTED, fontSize: 12, fontWeight: 700 }}>i</span>
                      </div>
                      <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.7 }}>Include full names and their relationship to the patient if applicable (e.g., "John Smith - Family Visitor", "Jane Doe - Nurse on duty")</p>
                    </div>
                    <button onClick={() => setNoWitnesses(!noWitnesses)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      data-testid="no-witnesses-checkbox">
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: noWitnesses ? BLUE : 'transparent', border: noWitnesses ? 'none' : `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {noWitnesses && <Check size={16} color="white" />}
                      </div>
                      <span style={{ fontSize: 15, color: TEXT, fontFamily: INTER }}>No witnesses were present</span>
                    </button>
                  </div>
                )}

                {/* Step 4: Photos */}
                {step === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} data-testid="incident-step-4">
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: '1.1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 8 }}>Add Photos (Optional)</h3>
                      <p style={{ fontSize: 14, color: MUTED }}>Document the incident visually.</p>
                    </div>
                    <label style={{ cursor: 'pointer' }}>
                      <div style={{ width: '100%', padding: '48px 0', border: `2px dashed ${BORDER}`, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: CARD }}>
                        <Camera size={40} color={MUTED} style={{ marginBottom: 12 }} />
                        <p style={{ fontSize: 15, color: MUTED, fontWeight: 600 }}>Tap to add photo</p>
                      </div>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} data-testid="photo-upload-input" />
                    </label>
                    {photos.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {photos.map((photo) => (
                          <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden' }}>
                            <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                              style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <Trash2 size={16} color="white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Review */}
                {step === 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} data-testid="incident-step-5">
                    <h3 style={{ fontFamily: INTER, fontSize: '1.2rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>Review & Submit</h3>
                    <div style={{ ...glassCard, padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
                        {selectedType && (
                          <>
                            <div style={{ width: 48, height: 48, background: 'rgba(239,68,68,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <selectedType.icon size={24} color={RED} />
                            </div>
                            <span style={{ fontWeight: 700, color: TEXT, fontSize: 18 }}>{selectedType.label}</span>
                          </>
                        )}
                        {selectedSeverity && (
                          <span style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: selectedSeverity.color, color: 'white' }}>
                            {selectedSeverity.label.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {description && (
                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Description</p>
                          <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{description}</p>
                        </div>
                      )}
                      {actionsTaken && (
                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Actions Taken</p>
                          <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{actionsTaken}</p>
                        </div>
                      )}
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Witnesses</p>
                        <p style={{ fontSize: 14, color: TEXT }}>{noWitnesses ? 'No witnesses present' : (witnessNames || 'Not provided')}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Photos ({photos.length})</p>
                        <p style={{ fontSize: 14, color: MUTED }}>{photos.length > 0 ? `${photos.length} attached` : 'No photos attached'}</p>
                      </div>
                    </div>

                    {/* Toggle Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { state: notifyFamily,     toggle: () => setNotifyFamily(!notifyFamily),         icon: Shield, label: 'Notify Property Manager', testId: 'notify-family-toggle' },
                        { state: followUpRequired, toggle: () => setFollowUpRequired(!followUpRequired), icon: Clock,  label: 'Follow-up Required',   testId: 'follow-up-toggle'    },
                      ].map(({ state, toggle, icon: Icon, label, testId }) => (
                        <button key={testId} onClick={toggle}
                          style={{ padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                            background: state ? 'rgba(46,158,91,0.06)' : CARD,
                            border: state ? '1px solid rgba(46,158,91,0.3)' : `1px solid ${BORDER}`,
                            boxShadow: SHADOW,
                          }}
                          data-testid={testId}>
                          <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: state ? 'rgba(46,158,91,0.15)' : CARD2 }}>
                            <Icon size={24} color={state ? GREEN : MUTED} />
                          </div>
                          <span style={{ fontSize: 16, fontWeight: 600, color: TEXT, flex: 1, textAlign: 'left', fontFamily: INTER }}>{label}</span>
                          <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: state ? BLUE : 'transparent', border: state ? 'none' : `2px solid ${BORDER}` }}>
                            {state && <Check size={16} color="white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ flexShrink: 0, padding: '12px 20px 20px', background: CARD, borderTop: `1px solid ${BORDER}` }} data-testid="incident-footer">
              <div style={{ display: 'flex', gap: 12 }}>
                {step > 1 && (
                  <button onClick={handleBack}
                    style={{ flex: 1, padding: '16px 0', ...glass(), borderRadius: 14, fontFamily: INTER, fontSize: 16, fontWeight: 600, color: TEXT, cursor: 'pointer' }}
                    data-testid="incident-back-btn">
                    Back
                  </button>
                )}
                {step < 5 ? (
                  <button onClick={handleNext} disabled={isNextDisabled()}
                    style={{ flex: 1, padding: '16px 0', background: isNextDisabled() ? CARD2 : RED, border: isNextDisabled() ? `1px solid ${BORDER}` : 'none', borderRadius: 14, fontFamily: INTER, fontSize: 16, fontWeight: 700, color: isNextDisabled() ? MUTED : 'white', cursor: isNextDisabled() ? 'not-allowed' : 'pointer', boxShadow: isNextDisabled() ? 'none' : `0 8px 24px rgba(239,68,68,0.3)` }}
                    data-testid="incident-next-btn">
                    Continue
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={isSubmitting}
                    style={{ flex: 1, padding: '16px 0', background: RED, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 16, fontWeight: 700, color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 8px 24px rgba(239,68,68,0.3)` }}
                    data-testid="incident-submit-btn">
                    {isSubmitting ? (
                      <>
                        <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Submitting...
                      </>
                    ) : 'Submit Incident'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── History View ─────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: BG, paddingBottom: 32, fontFamily: INTER }}>

      <div style={{ padding: '16px 20px 20px' }}>
        <button onClick={() => { window.scrollTo(0, 0); setActiveView('new'); }}
          style={{ width: '100%', padding: 20, background: RED, borderRadius: 20, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: `0 8px 24px rgba(239,68,68,0.3)` }}
          data-testid="new-incident-btn">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={28} color="white" />
            </div>
            <div>
              <p style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>New Property Incident</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Document an incident now</p>
            </div>
          </div>
          <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} color={MUTED} />
            <h2 style={{ fontWeight: 700, color: TEXT, fontSize: 17 }}>Past Reports</h2>
          </div>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED }}>
            {incidents.length}
          </span>
        </div>

        {incidents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {incidents.map((incident) => {
              const type = INCIDENT_TYPES.find(t => t.id === incident.type);
              const sev  = SEVERITY_LEVELS.find(s => s.id === incident.severity);
              return (
                <div key={incident.id} style={{ ...glassCard, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: 'rgba(239,68,68,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {type && <type.icon size={24} color={RED} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: TEXT, fontSize: 16 }}>{type?.label || 'Incident'}</p>
                    <p style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{incident.createdAt}</p>
                  </div>
                  {sev && (
                    <span style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: sev.color, color: 'white' }}>
                      {sev.label.toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ ...glassCard, padding: 40, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: CARD2, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={40} color={MUTED} />
            </div>
            <p style={{ fontWeight: 700, color: TEXT, fontSize: 17, marginBottom: 6 }}>No incidents reported</p>
            <p style={{ fontSize: 14, color: MUTED }}>Tap the button above to report a new incident</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportPage;
