import React, { useState } from 'react';
import {
  Camera, AlertTriangle, Clock, Check,
  ChevronRight, Plus, Trash2, Shield,
  HelpCircle, FileText, Car, Volume2, Package,
  Wrench, Users, Zap, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import MicButton from './MicButton';

const BLUE   = '#FF385C';
const RED    = '#FF3B30';
const GREEN  = '#34C759';

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

const PLAYBOOK_CONFIG = {
  noise: [
    'Note exact unit number and time of complaint',
    'Call or visit the unit calmly — first contact resolution',
    'Document outcome: resolved, unresolved, or police called',
    'Notify property manager if issue persists after 2nd contact',
  ],
  unauthorized: [
    'Do NOT confront the individual if you feel unsafe',
    'Note physical description, direction of travel, and time',
    'Review available camera footage and preserve it',
    'Contact police if person remains on property',
    'Notify property manager immediately',
  ],
  parking: [
    'Photograph the vehicle — include license plate',
    'Verify unauthorized status against parking records',
    'Attempt to locate the vehicle owner via intercom',
    'Contact towing company if owner not reached within 30 min',
    'Document all actions taken in this report',
  ],
  maintenance: [
    'Assess immediate safety risk — secure the area if hazardous',
    'Contact maintenance or after-hours emergency line',
    'Document scope of damage with photos',
    'Notify affected residents if necessary',
    'Follow up on repair timeline with management',
  ],
  disturbance: [
    'Do NOT physically intervene in any altercation',
    'Attempt verbal de-escalation from a safe distance',
    'Call 911 and notify property manager if unresolved',
    'Document all parties involved and what you witnessed',
    'File this formal report for management review',
  ],
  package: [
    'Cross-reference package room logs with delivery records',
    'Check carrier tracking information for confirmation',
    'Notify the resident in writing of the discrepancy',
    'Escalate to manager if package is high-value or confirmed missing',
    'Document all findings and actions taken',
  ],
  utility: [
    'Identify affected area and scope — gas, water, power, elevator',
    'For gas leaks: evacuate affected area and call 911 immediately',
    'Contact the relevant utility provider or building maintenance',
    'Notify affected residents via intercom or phone right away',
    'Monitor and provide regular updates to management',
  ],
  other: [
    'Document all facts and observations accurately',
    'Assess whether the situation requires immediate escalation',
    'Contact property manager if uncertain how to proceed',
    'Secure any evidence: photos, written descriptions',
  ],
};

function EditorialHeader({ propertyName, title, description, step, total = 5, onClose }) {
  const { colors:{ INTER,CARD,CARD2,BORDER,TEXT,MUTED } } = useTheme();
  return <header style={{ flexShrink:0,background:CARD,color:TEXT,borderBottom:`1px solid ${BORDER}` }}>
    <div style={{ padding:'24px 28px 17px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:18 }}>
      <div style={{ minWidth:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:11 }}><span style={{width:24,height:2,background:BLUE}}/><span style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.22em',textTransform:'uppercase'}}>{propertyName}</span></div>
        <h2 style={{ fontFamily:INTER,fontSize:34,fontWeight:800,color:TEXT,letterSpacing:'-.045em',lineHeight:.98,margin:0 }}>{title}</h2>
        <p style={{ maxWidth:470,fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.55,margin:'9px 0 0' }}>{description}</p>
        {step && <p style={{fontFamily:INTER,fontSize:11,color:MUTED,margin:'8px 0 0'}}>Step {step} of {total} · Incident record</p>}
      </div>
      <button onClick={onClose} aria-label="Close incident report" style={{width:44,height:44,borderRadius:999,border:`1px solid ${BORDER}`,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}><X size={19} color={TEXT}/></button>
    </div>
    {step && <div style={{display:'flex',gap:5,padding:'0 28px 20px'}}>{Array.from({length:total}).map((_,i)=><span key={i} style={{flex:1,height:3,borderRadius:2,background:i<step?BLUE:BORDER,transition:'background 200ms'}}/>)}</div>}
  </header>;
}

export const IncidentReportPage = ({ patientName = 'The Greystone at Midtown', incidents = [], onAddIncident, onClose, isPhone = false }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;

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

  const [activeView,       setActiveView]       = useState('history');
  const [step,             setStep]             = useState(1);
  const [incidentType,     setIncidentType]     = useState(null);
  const [severity,         setSeverity]         = useState(null);
  const [description,      setDescription]      = useState('');
  const [unitNumber,       setUnitNumber]       = useState('');
  const [personInvolved,   setPersonInvolved]   = useState('');
  const [actionsTaken,     setActionsTaken]     = useState('');
  const [witnessNames,     setWitnessNames]     = useState('');
  const [noWitnesses,      setNoWitnesses]      = useState(false);
  const [photos,           setPhotos]           = useState([]);
  const [notifyFamily,     setNotifyFamily]     = useState(true);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [submitError,      setSubmitError]      = useState('');
  const [showSuccess,      setShowSuccess]      = useState(false);
  const [escalationCopied, setEscalationCopied] = useState(false);

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
    setSubmitError('');
    const newIncident = {
      type: incidentType, severity, description,
      unitNumber, personInvolved,
      actionsTaken,
      witnesses: noWitnesses ? 'No witnesses present' : witnessNames,
      photos, notifyFamily, followUpRequired,
      location: unitNumber ? `Unit ${unitNumber}` : '',
      notes: actionsTaken,
    };
    try {
      if (onAddIncident) await onAddIncident(newIncident);
      setShowSuccess(true);
    } catch {
      setSubmitError('The incident was not submitted. Your report is still here—check the connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1); setIncidentType(null); setSeverity(null); setDescription('');
    setUnitNumber(''); setPersonInvolved('');
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
          <><EditorialHeader propertyName={patientName} title="Report submitted" description="The incident is documented and ready for management follow-up." onClose={resetForm}/><div style={{ flex:1,overflowY:'auto',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:isPhone?'28px 18px':'36px 28px',textAlign:'center' }}>
            <div style={{ width:64,height:64,background:'rgba(52,199,89,.12)',border:'1px solid rgba(52,199,89,.25)',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:18 }}>
              <Check size={30} color={GREEN} />
            </div>
            <h2 style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 8 }}>Report Submitted</h2>
            <p style={{ fontSize: 15, color: MUTED, marginBottom: 28, lineHeight: 1.6 }}>
              Your incident report has been submitted successfully.
              {notifyFamily && ' Property manager has been notified.'}
            </p>
            {/* One-tap Escalation */}
            <div style={{ width: '100%', maxWidth: 360, background: CARD, border: `1.5px solid rgba(255,59,48,0.2)`, borderRadius: 18, padding: '20px 20px', marginBottom: 20, textAlign: 'left' }}>
              <p style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 12 }}>Escalate to Manager</p>
              {(() => {
                const type = INCIDENT_TYPES.find(t => t.id === incidentType);
                const sev  = SEVERITY_LEVELS.find(s => s.id === severity);
                const msg  = `[INCIDENT ESCALATION]\nProperty: ${patientName}\nType: ${type?.label || incidentType}\nSeverity: ${sev?.label || severity}${unitNumber ? `\nUnit: ${unitNumber}` : ''}${personInvolved ? `\nPerson: ${personInvolved}` : ''}\nDescription: ${description}\nActions Taken: ${actionsTaken || 'None documented'}\nTime: ${new Date().toLocaleString()}`;
                return (
                  <div>
                    <pre style={{ fontFamily: INTER, fontSize: 12, color: TEXT, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: CARD2, borderRadius: 10, padding: 12, marginBottom: 14 }}>{msg}</pre>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => { navigator.clipboard.writeText(msg).then(() => { setEscalationCopied(true); setTimeout(() => setEscalationCopied(false), 2500); }); }}
                        style={{ flex: 1, padding: '11px 0', background: escalationCopied ? GREEN : '#FF3B30', border: 'none', borderRadius: 10, fontFamily: INTER, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                        {escalationCopied ? '✓ Copied!' : 'Copy Message'}
                      </button>
                      <a href={`sms:?body=${encodeURIComponent(msg)}`}
                        style={{ flex: 1, padding: '11px 0', background: 'rgba(255,56,92,0.08)', border: '1px solid rgba(255,56,92,0.2)', borderRadius: 10, fontFamily: INTER, fontSize: 13, fontWeight: 700, color: '#FF385C', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Send SMS
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
            <button onClick={resetForm}
              style={{ minHeight:48,padding:'0 34px',background:BLUE,border:'none',borderRadius:999,fontFamily:INTER,fontSize:14,fontWeight:750,color:'white',cursor:'pointer',boxShadow:`0 7px 22px ${BLUE}28` }}
              data-testid="incident-done-btn">
              Done
            </button>
          </div></>
        ) : (
          <>
            <EditorialHeader propertyName={patientName}
              title={['','Classify the incident','Document what happened','Record witnesses','Attach evidence','Review the report'][step]}
              description={['','Choose the incident type and review the appropriate response protocol.','Set severity and capture the facts, people, location, and actions taken.','Document anyone who observed the event or confirm that no witnesses were present.','Add visual evidence when it helps establish condition, damage, or context.','Confirm the complete operational record before submitting it to management.'][step]}
              step={step} onClose={() => { window.scrollTo(0,0); setActiveView('history'); }} />

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding:isPhone?18:'24px 28px' }}>

                {/* Step 1: Type */}
                {step === 1 && (
                  <div data-testid="incident-step-1">
                    <div style={{marginBottom:18}}><div style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.16em',textTransform:'uppercase',marginBottom:6}}>01 · Classification</div><h3 style={{fontFamily:INTER,fontSize:20,fontWeight:800,color:TEXT,letterSpacing:'-.03em',margin:'0 0 5px'}}>What type of incident occurred?</h3><p style={{fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.5,margin:0}}>Choose the closest category so the correct desk protocol appears.</p></div>
                    <div style={{ display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9 }}>
                      {INCIDENT_TYPES.map((type,index) => {
                        const sel = incidentType === type.id;
                        return (
                          <button key={type.id} onClick={() => setIncidentType(type.id)}
                            style={{ minHeight:92,padding:13,borderRadius:14,textAlign:'left',display:'grid',gridTemplateColumns:'36px 1fr 22px',alignItems:'center',gap:11,cursor:'pointer',
                              background: sel ? 'rgba(239,68,68,0.06)' : CARD,
                              border: `1.5px solid ${sel ? BLUE : BORDER}`,
                              boxShadow: sel ? '0 5px 18px rgba(255,56,92,.10)' : SHADOW,
                            }}
                            data-testid={`incident-type-${type.id}`}>
                            <div style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:sel?'rgba(255,56,92,.12)':CARD2,position:'relative'}}>
                              <type.icon size={18} color={sel ? BLUE : MUTED} /><span style={{position:'absolute',top:-6,left:-6,fontFamily:INTER,fontSize:7,fontWeight:800,color:sel?BLUE:MUTED}}>{String(index+1).padStart(2,'0')}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{fontFamily:INTER,fontWeight:750,color:TEXT,fontSize:13,margin:'0 0 4px'}}>{type.label}</p>
                              <p style={{fontFamily:INTER,fontSize:11,color:MUTED,lineHeight:1.4,margin:0}}>{type.description}</p>
                            </div>
                            {sel&&<div style={{width:22,height:22,borderRadius:'50%',background:BLUE,display:'flex',alignItems:'center',justifyContent:'center'}}><Check size={13} color="white" strokeWidth={3}/></div>}
                          </button>
                        );
                      })}
                    </div>
                    {/* Emergency Playbook — shown when type is selected */}
                    {incidentType && PLAYBOOK_CONFIG[incidentType] && (
                      <div style={{ marginTop: 20, background: 'rgba(255,59,48,0.05)', border: '1.5px solid rgba(255,59,48,0.25)', borderRadius: 16, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,59,48,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Shield size={16} color={RED} />
                          </div>
                          <p style={{ fontFamily: INTER, fontSize: 13, fontWeight: 800, color: RED, textTransform: 'uppercase', letterSpacing: '0.10em' }}>Response Protocol</p>
                        </div>
                        <ol style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {PLAYBOOK_CONFIG[incidentType].map((step, i) => (
                            <li key={i} style={{ fontFamily: INTER, fontSize: 14, color: TEXT, lineHeight: 1.55 }}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Severity & Details */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} data-testid="incident-step-2">
                    <div><div style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.16em',textTransform:'uppercase',marginBottom:6}}>02 · Incident details</div><h3 style={{fontFamily:INTER,fontSize:20,fontWeight:800,color:TEXT,letterSpacing:'-.03em',margin:'0 0 5px'}}>Build the factual record</h3><p style={{fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.5,margin:0}}>Use direct observations and record actions in chronological order.</p></div>
                    <section style={{...glassCard,padding:isPhone?16:20,boxShadow:SHADOW,display:'grid',gap:20}}>
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 12 }}>Severity Level</h3>
                      <div style={{ display:'grid',gridTemplateColumns:isPhone?'repeat(2,1fr)':'repeat(4,1fr)',gap:8 }}>
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

                    {/* Unit Number + Person Involved */}
                    <div style={{ display:'grid',gridTemplateColumns:isPhone?'1fr':'1fr 1fr',gap:12 }}>
                      <div>
                        <h3 style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 10 }}>Unit Number</h3>
                        <input
                          value={unitNumber}
                          onChange={e => setUnitNumber(e.target.value)}
                          placeholder="e.g. 454"
                          style={{ ...baseInput, border: unitNumber ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}` }}
                        />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 10 }}>Person Involved</h3>
                        <input
                          value={personInvolved}
                          onChange={e => setPersonInvolved(e.target.value)}
                          placeholder="Full name"
                          style={{ ...baseInput, border: personInvolved ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}` }}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 12 }}>What happened?</h3>
                      <div style={{ position: 'relative' }}>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the incident — what you observed, how it started, and any other relevant details..." rows={5}
                          style={{ ...baseInput, border: description ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}`, paddingRight: 44 }}
                          data-testid="incident-description" />
                        <MicButton onTranscript={t => setDescription(p => p ? p + ' ' + t : t)} />
                      </div>
                    </div>
                    </section>
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 12 }}>Actions Taken</h3>
                      <div style={{ position: 'relative' }}>
                        <textarea value={actionsTaken} onChange={(e) => setActionsTaken(e.target.value)}
                          placeholder="What did you do to address this?" rows={4}
                          style={{ ...baseInput, border: actionsTaken ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}`, paddingRight: 44 }}
                          data-testid="incident-actions" />
                        <MicButton onTranscript={t => setActionsTaken(p => p ? p + ' ' + t : t)} />
                      </div>
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
                      <div style={{ position: 'relative' }}>
                        <textarea value={witnessNames} onChange={(e) => setWitnessNames(e.target.value)}
                          placeholder="Enter the names of any witnesses present..." rows={5}
                          disabled={noWitnesses}
                          style={{ ...baseInput, opacity: noWitnesses ? 0.5 : 1, border: (witnessNames && !noWitnesses) ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}`, paddingRight: 44 }}
                          data-testid="incident-witnesses" />
                        <MicButton disabled={noWitnesses} onTranscript={t => setWitnessNames(p => p ? p + ' ' + t : t)} />
                      </div>
                    </div>
                    <div style={{ background: '#EEF2FA', border: '1px solid rgba(58,123,213,0.2)', borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: MUTED, fontSize: 12, fontWeight: 700 }}>i</span>
                      </div>
                      <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.7 }}>Include full names and their connection to the event when relevant (for example, “John Smith — Visitor” or “Jane Doe — Vendor representative”).</p>
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
                      {/* Unit + Person row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Unit Number</p>
                          <p style={{ fontSize: 14, color: TEXT }}>{unitNumber || '—'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Person Involved</p>
                          <p style={{ fontSize: 14, color: TEXT }}>{personInvolved || '—'}</p>
                        </div>
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
            <div style={{ flexShrink:0,padding:'14px 28px 20px',background:CARD,borderTop:`1px solid ${BORDER}`,boxShadow:'0 -8px 24px rgba(0,0,0,.04)' }} data-testid="incident-footer">
              {submitError && <p role="alert" style={{ margin: '0 0 10px', padding: '10px 12px', border: `1px solid ${RED}55`, borderRadius: 10, color: RED, fontFamily: INTER, fontSize: 13, lineHeight: 1.45 }}>{submitError}</p>}
              <div style={{ display: 'flex', gap: 12 }}>
                {step > 1 && (
                  <button onClick={handleBack}
                    style={{ flex:1,minHeight:48,...glass(),borderRadius:14,fontFamily:INTER,fontSize:14,fontWeight:700,color:TEXT,cursor:'pointer' }}
                    data-testid="incident-back-btn">
                    Back
                  </button>
                )}
                {step < 5 ? (
                  <button onClick={handleNext} disabled={isNextDisabled()}
                    style={{ flex:1,minHeight:48,background:isNextDisabled()?CARD2:BLUE,border:isNextDisabled()?`1px solid ${BORDER}`:'none',borderRadius:999,fontFamily:INTER,fontSize:14,fontWeight:750,color:isNextDisabled()?MUTED:'white',cursor:isNextDisabled()?'not-allowed':'pointer',boxShadow:isNextDisabled()?'none':`0 7px 22px ${BLUE}28` }}
                    data-testid="incident-next-btn">
                    Continue
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={isSubmitting}
                    style={{ flex:1,minHeight:48,background:BLUE,border:'none',borderRadius:999,fontFamily:INTER,fontSize:14,fontWeight:750,color:'white',cursor:isSubmitting?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 7px 22px ${BLUE}28` }}
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
    <div style={{ flex:1,minHeight:0,display:'flex',flexDirection:'column',background:BG,fontFamily:INTER }}>
      <EditorialHeader propertyName={patientName} title="Incident reports" description="Create structured property records with clear actions, evidence, and escalation context." onClose={onClose}/>

      <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:isPhone?18:'20px 28px 30px' }}>
        <button onClick={() => { window.scrollTo(0, 0); setActiveView('new'); }}
          style={{ width:'100%',minHeight:64,padding:'12px 16px',background:BLUE,borderRadius:16,border:'none',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',boxShadow:`0 7px 22px ${BLUE}28`,marginBottom:20 }}
          data-testid="new-incident-btn">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width:38,height:38,background:'rgba(255,255,255,.17)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Plus size={20} color="white" />
            </div>
            <div>
              <p style={{ fontFamily:INTER,fontSize:14,fontWeight:750,color:'white',margin:'0 0 3px' }}>New incident report</p>
              <p style={{ fontFamily:INTER,fontSize:11,color:'rgba(255,255,255,.72)',margin:0 }}>Document an incident now</p>
            </div>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,.75)" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} color={MUTED} />
              <h2 style={{ fontFamily:INTER,fontWeight:800,color:TEXT,fontSize:16,margin:0 }}>Past reports</h2>
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
                <div key={incident.id} style={{ ...glassCard,padding:16,display:'grid',gridTemplateColumns:'44px 1fr auto',alignItems:'center',gap:13,boxShadow:SHADOW }}>
                  <div style={{ width:44,height:44,background:'rgba(255,56,92,.09)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {type && <type.icon size={20} color={BLUE} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: TEXT, fontSize: 16 }}>{type?.label || 'Incident'}</p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 3 }}>
                      {(incident.unit_number || incident.unitNumber) && (
                        <span style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>Unit {incident.unit_number || incident.unitNumber}</span>
                      )}
                      {(incident.person_involved || incident.personInvolved) && (
                        <span style={{ fontSize: 12, color: MUTED }}>· {incident.person_involved || incident.personInvolved}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{incident.filedAt || incident.createdAt}</p>
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
          <div style={{ ...glassCard,padding:'38px 20px',textAlign:'center',boxShadow:SHADOW }}>
            <div style={{ width:50,height:50,background:CARD2,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}>
              <AlertTriangle size={22} color={MUTED} />
            </div>
            <p style={{ fontFamily:INTER,fontWeight:800,color:TEXT,fontSize:15,margin:'0 0 4px' }}>No incidents reported</p>
            <p style={{ fontFamily:INTER,fontSize:12,color:MUTED,margin:0 }}>New incident records will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportPage;
