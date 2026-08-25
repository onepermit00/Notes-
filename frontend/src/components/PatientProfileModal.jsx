import React, { useState, useMemo } from 'react';
import { X, Phone, MapPin, AlertTriangle, Heart, Pill, Camera, User, Share2, Shield, Activity, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskStatus } from '../types';
import { CARE_IMAGES } from '../services/mockData';

const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const BG     = '#F2F2F7';
const CARD   = '#FFFFFF';
const MUTED  = '#8E8E93';
const GREEN  = '#2E9E5B';
const BLUE   = '#FF385C';
const BORDER = 'rgba(0,0,0,0.09)';
const SHADOW = '0 2px 10px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)';

const glass = () => ({
  background: CARD,
  border: `1px solid ${BORDER}`,
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
});

const glassCard = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  boxShadow: SHADOW,
  borderRadius: 16,
};

export const PatientProfileModal = ({
  isOpen,
  onClose,
  patient,
  onUpdatePhoto,
  tasks = [],
  onSelectDate
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCalendar,     setShowCalendar]     = useState(false);
  const [currentMonth,     setCurrentMonth]     = useState(new Date(2026, 0, 17));

  const today = useMemo(() => new Date(2026, 0, 17), []);

  const historicalTasks = useMemo(() => {
    const taskHistory = {};
    const pastDates = [
      { date: new Date(2026, 0, 16), tasks: [
        { id: 'h1', title: 'Morning Medication',  completedAt: '8:15 AM',  status: TaskStatus.COMPLETED, completionNote: 'Took all medications with breakfast', evidenceUrls: [CARE_IMAGES.medication] },
        { id: 'h2', title: 'Breakfast Assistance', completedAt: '8:45 AM', status: TaskStatus.COMPLETED, completionNote: 'Had oatmeal and fruit',              evidenceUrls: [CARE_IMAGES.meal]       },
        { id: 'h3', title: 'Blood Pressure Check', completedAt: '10:30 AM',status: TaskStatus.COMPLETED, completionNote: 'BP: 128/82',                         evidenceUrls: [CARE_IMAGES.vitals]     },
      ]},
      { date: new Date(2026, 0, 15), tasks: [
        { id: 'h4', title: 'Morning Walk',       completedAt: '10:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Walked 15 minutes in the garden', evidenceUrls: [CARE_IMAGES.walk] },
        { id: 'h5', title: 'Lunch Preparation', completedAt: '12:15 PM', status: TaskStatus.COMPLETED, completionNote: 'Had soup and sandwich',            evidenceUrls: [CARE_IMAGES.meal] },
      ]},
      { date: new Date(2026, 0, 14), tasks: [
        { id: 'h8', title: 'Morning Medication', completedAt: '8:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Medications administered', evidenceUrls: [CARE_IMAGES.medication] },
      ]},
    ];
    pastDates.forEach(({ date, tasks: dateTasks }) => { taskHistory[date.toDateString()] = dateTasks; });
    const todayCompleted = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    if (todayCompleted.length > 0) taskHistory[today.toDateString()] = todayCompleted;
    return taskHistory;
  }, [tasks, today]);

  const hasTasksOnDate = (date) => (historicalTasks[date.toDateString()] || []).length > 0;

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay.getDay() - 1; i >= 0; i--)
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    for (let i = 1; i <= lastDay.getDate(); i++)
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    for (let i = 1; i <= 42 - days.length; i++)
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    return days;
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const formatDate = (date) => `${monthNames[date.getMonth()].substring(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;

  const navigateMonth   = (dir) => setCurrentMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + dir); return d; });
  const handleDateSelect = (date) => { if (onSelectDate) onSelectDate(date, historicalTasks[date.toDateString()] || []); setShowCalendar(false); onClose(); };
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpdatePhoto) { const r = new FileReader(); r.onloadend = () => onUpdatePhoto(r.result); r.readAsDataURL(file); }
  };

  if (!isOpen || !patient) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 50, display: 'flex', flexDirection: 'column', fontFamily: INTER }} onClick={onClose}>

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }} onClick={(e) => e.stopPropagation()}>

        {/* Hero Photo Header */}
        <div style={{ position: 'relative', height: '38vh' }}>
          {patient.photo ? (
            <>
              <img src={patient.photo} alt={patient.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.2) 40%, transparent 100%)' }} />
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={96} color={MUTED} />
            </div>
          )}

          {/* Top-right buttons */}
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
            {onUpdatePhoto && (
              <label style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BORDER}`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW }}>
                <Camera size={20} color="#1C1C1E" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
            <button onClick={onClose}
              style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BORDER}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: SHADOW }}>
              <X size={20} color="#1C1C1E" />
            </button>
          </div>

          {/* Patient name */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: patient.photo ? 'white' : '#1C1C1E', marginBottom: 4 }}>{patient.name}</h2>
            <p style={{ fontSize: 15, color: patient.photo ? 'rgba(255,255,255,0.75)' : MUTED, fontWeight: 500 }}>Age {patient.age} • DOB: {patient.dateOfBirth || '1946-03-15'}</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Care History Button */}
          <button onClick={() => setShowCalendar(true)}
            style={{ width: '100%', background: BLUE, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 16, border: 'none', cursor: 'pointer', boxShadow: `0 8px 24px ${BLUE}40` }}
            data-testid="calendar-tab">
            <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} color="white" />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Care History</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{formatDate(today)}</p>
            </div>
            <ChevronRight size={24} color="white" />
          </button>

          {/* Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div style={{ background: 'rgba(255,59,48,0.06)', border: '2px solid rgba(255,59,48,0.25)', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={20} color="#ef4444" />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>Allergies</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {patient.allergies.map((allergy, idx) => (
                  <span key={idx} style={{ padding: '8px 16px', background: 'rgba(255,59,48,0.10)', color: '#ef4444', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>{allergy}</span>
                ))}
              </div>
            </div>
          )}

          {/* Medical Conditions */}
          {patient.medicalConditions && patient.medicalConditions.length > 0 && (
            <div style={{ ...glassCard, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Heart size={20} color="#ec4899" fill="#ec4899" />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>Medical Conditions</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {patient.medicalConditions.map((condition, idx) => (
                  <li key={idx} style={{ fontSize: 15, color: MUTED, fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: MUTED }}>•</span><span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medications */}
          {patient.medications && patient.medications.length > 0 && (
            <div style={{ ...glassCard, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Pill size={20} color="#3b82f6" />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>Current Medications</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {patient.medications.map((med, idx) => (
                  <div key={idx} style={{ fontSize: 15 }}>
                    <span style={{ fontWeight: 700, color: '#1C1C1E' }}>{med.name}</span>
                    <span style={{ color: MUTED, fontWeight: 500 }}> - {med.dosage}, {med.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Status & Mobility */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {patient.codeStatus && (
              <div style={{ background: 'rgba(234,179,8,0.08)', border: '2px solid rgba(234,179,8,0.25)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
                <Shield size={28} color="#eab308" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 11, color: '#eab308', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Code Status</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>{patient.codeStatus}</p>
              </div>
            )}
            {patient.mobilityStatus && (
              <div style={{ background: 'rgba(59,130,246,0.08)', border: '2px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
                <Activity size={28} color="#3b82f6" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Mobility</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>{patient.mobilityStatus}</p>
              </div>
            )}
          </div>

          {/* Access Instructions */}
          {patient.accessInstructions && (
            <div style={{ ...glassCard, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <MapPin size={20} color="#22c55e" />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>Access Instructions</span>
              </div>
              <p style={{ fontSize: 15, color: MUTED, fontWeight: 500, lineHeight: 1.6 }}>{patient.accessInstructions}</p>
            </div>
          )}

          {/* Emergency Contacts */}
          <div style={{ ...glassCard, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Phone size={20} color="#f97316" />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>Emergency Contacts</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {patient.emergencyContacts?.map((contact, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#1C1C1E', fontSize: 16 }}>{contact.name}</p>
                    <p style={{ fontSize: 13, color: MUTED, fontWeight: 500, marginTop: 2 }}>{contact.relationship}</p>
                  </div>
                  <a href={`tel:${contact.phone}`}
                    style={{ padding: '10px 20px', background: '#22c55e', color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Call
                  </a>
                </div>
              ))}
              {patient.primaryCarePhysician && (
                <div style={{ paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                  <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Primary Care Physician</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: '#1C1C1E', fontSize: 16 }}>{patient.primaryCarePhysician.name}</p>
                      <p style={{ fontSize: 13, color: MUTED, fontWeight: 500, marginTop: 2 }}>{patient.primaryCarePhysician.facility}</p>
                    </div>
                    <a href={`tel:${patient.primaryCarePhysician.phone}`}
                      style={{ padding: '10px 20px', background: '#22c55e', color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                      Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Medical ID */}
          <button onClick={() => setShowShareOptions(true)}
            style={{ width: '100%', padding: 16, background: '#f43f5e', border: 'none', borderRadius: 16, color: 'white', fontFamily: INTER, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 24px rgba(244,63,94,0.35)' }}
            data-testid="share-medical-id">
            <Share2 size={24} />
            Share Medical ID for EMS
          </button>
        </div>

        {/* ── Share Options Modal ─────────────────────────────────────────── */}
        {showShareOptions && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowShareOptions(false)}>
            <div style={{ ...glass(), borderRadius: 24, padding: 24, margin: 16, maxWidth: 384, width: '100%' }}
              onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E', marginBottom: 10 }}>Share Medical ID</h3>
              <p style={{ fontSize: 14, color: MUTED, marginBottom: 20, lineHeight: 1.6 }}>
                This will generate a secure summary of the patient&apos;s critical medical information for emergency services.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => { alert('Medical ID shared with emergency services'); setShowShareOptions(false); }}
                  style={{ width: '100%', padding: '14px 0', background: '#f43f5e', border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                  Share Now
                </button>
                <button onClick={() => setShowShareOptions(false)}
                  style={{ width: '100%', padding: '14px 0', background: '#F2F2F7', border: `1px solid ${BORDER}`, borderRadius: 12, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: MUTED, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Calendar Modal ──────────────────────────────────────────────── */}
        {showCalendar && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setShowCalendar(false)}>
            <div style={{ ...glass(), borderRadius: 24, width: '100%', maxWidth: 448, overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}>
              {/* Calendar header */}
              <div style={{ padding: 16, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>Care History</h3>
                  <button onClick={() => setShowCalendar(false)}
                    style={{ width: 36, height: 36, background: '#F2F2F7', border: `1px solid ${BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={18} color={MUTED} />
                  </button>
                </div>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>Select a date to view all care activities</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={() => navigateMonth(-1)}
                    style={{ width: 36, height: 36, background: '#F2F2F7', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={20} color={MUTED} />
                  </button>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  <button onClick={() => navigateMonth(1)}
                    style={{ width: 36, height: 36, background: '#F2F2F7', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronRight size={20} color={MUTED} />
                  </button>
                </div>
              </div>

              {/* Calendar grid */}
              <div style={{ padding: 16 }}>
                {/* Day names */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                  {dayNames.map((day) => (
                    <div key={day} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: MUTED, padding: '6px 0' }}>{day}</div>
                  ))}
                </div>
                {/* Days */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {getDaysInMonth(currentMonth).map((dayInfo, idx) => {
                    const isToday  = dayInfo.date.toDateString() === today.toDateString();
                    const hasTasks = hasTasksOnDate(dayInfo.date);
                    const isPast   = dayInfo.date <= today;
                    const active   = dayInfo.isCurrentMonth && isPast;
                    return (
                      <button key={idx}
                        onClick={() => active && handleDateSelect(dayInfo.date)}
                        disabled={!active}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 10,
                          fontSize: 14,
                          fontWeight: 500,
                          border: 'none',
                          fontFamily: INTER,
                          cursor: active ? 'pointer' : 'not-allowed',
                          background: isToday ? GREEN : 'transparent',
                          color: !dayInfo.isCurrentMonth ? 'rgba(0,0,0,0.15)' : (!isPast ? 'rgba(0,0,0,0.25)' : isToday ? 'white' : '#1C1C1E'),
                        }}>
                        {dayInfo.day}
                        {hasTasks && dayInfo.isCurrentMonth && (
                          <div style={{ position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: '50%', background: isToday ? 'white' : GREEN }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: MUTED }}>Tap a date to view that day&apos;s care timeline</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfileModal;
