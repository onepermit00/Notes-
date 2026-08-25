import React, { useState } from 'react';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Clock, CheckCircle,
  Package, Check, AlertTriangle, User, FileText,
  ShoppingCart, RotateCcw, Play, MapPin,
} from 'lucide-react';
import { SHIFT_CALENDAR, CONCIERGE_PROFILE } from '../services/mockData';

// ── Design tokens (Airbnb aesthetic) ─────────────────────────────────────────
const BG          = '#FFFFFF';
const CARD        = '#FFFFFF';
const SIDEBAR_BG  = '#0F172A';   // dark navy — sidebar uses white text on dark bg
const INDIGO_CAL  = '#FF385C';   // coral — matches design token BLUE
const INDIGO      = '#FF385C';   // coral alias (used for Today button & action)
const NIGHT       = '#0284C7';   // sky-blue for night shift (semantic distinction)
const GREEN       = '#34C759';
const RED         = '#FF3B30';
const AMBER       = '#FF9500';
const BLUE        = '#FF385C';
const TEXT        = '#222222';
const MUTED       = '#717171';
const BORDER      = '#EBEBEB';
const INTER       = `'Inter','Plus Jakarta Sans',sans-serif`;

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const ACT_CFG = {
  clock_in:    { color: GREEN,  Icon: Clock,         label: 'Clocked In'      },
  clock_out:   { color: MUTED,  Icon: Clock,         label: 'Clocked Out'     },
  task:        { color: GREEN,  Icon: CheckCircle,   label: 'Task Completed'  },
  package_in:  { color: INDIGO_CAL, Icon: Package,       label: 'Package In'      },
  package_out: { color: GREEN,  Icon: Check,         label: 'Package Pickup'  },
  food:        { color: AMBER,  Icon: ShoppingCart,  label: 'Food Delivery'   },
  incident:    { color: RED,    Icon: AlertTriangle, label: 'Incident'        },
  loaner_out:  { color: AMBER,  Icon: ChevronRight,  label: 'Loaner Out'      },
  loaner_in:   { color: GREEN,  Icon: RotateCcw,     label: 'Loaner Returned' },
  visitor:     { color: INDIGO_CAL, Icon: User,          label: 'Visitor'         },
  note:        { color: MUTED,  Icon: FileText,      label: 'Note'            },
};

function actTitle(act) {
  switch (act.type) {
    case 'clock_in':    return 'Clocked In';
    case 'clock_out':   return 'Clocked Out';
    case 'task':        return act.title || 'Task';
    case 'package_in':  return `${act.carrier} → Unit ${act.unit}  ·  ${act.count} pkg${act.count > 1 ? 's' : ''}  ·  ${act.storage}`;
    case 'package_out': {
      const who = act.pickupType === 'third_party'
        ? `${act.thirdPartyName} (3rd party for ${act.resident})`
        : act.resident;
      return `${who}  ·  Unit ${act.unit}  ·  ${act.count} pkg${act.count > 1 ? 's' : ''} picked up`;
    }
    case 'food':        return `${act.carrier} → Unit ${act.unit}  ·  URGENT`;
    case 'incident':    return act.title || 'Incident';
    case 'loaner_out':  return `${act.item} → ${act.resident}  ·  Unit ${act.unit}`;
    case 'loaner_in':   return `${act.item} returned by ${act.resident}`;
    case 'visitor':     return `${act.name}  ·  ${act.purpose}${act.verified ? '  ·  ID ✓' : ''}`;
    case 'note':        return 'Note';
    default:            return act.type;
  }
}

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ── Shared stat chip ─────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
  return (
    <div style={{
      background: BG, border: `1px solid ${BORDER}`,
      borderRadius: 10, padding: '10px 18px', textAlign: 'center', minWidth: 62,
    }}>
      <div style={{ fontFamily: INTER, fontSize: 24, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 600, color: MUTED, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Shared timeline ───────────────────────────────────────────────────────────
function Timeline({ activities }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 59, top: 4, bottom: 4, width: 1, background: BORDER, zIndex: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {activities.map((act, idx) => {
          const cfg = ACT_CFG[act.type] || ACT_CFG['note'];
          const { Icon, color, label } = cfg;
          return (
            <div key={idx} style={{ display: 'flex' }}>
              <div style={{ width: 54, flexShrink: 0, paddingTop: 14, paddingRight: 8, textAlign: 'right' }}>
                <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 600, color: MUTED }}>{act.time}</span>
              </div>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: color, border: `2px solid ${CARD}`,
                boxShadow: `0 0 0 2px ${color}40`,
                flexShrink: 0, marginTop: 16, zIndex: 1, position: 'relative',
              }} />
              <div style={{ flex: 1, paddingLeft: 16, paddingBottom: 22, paddingTop: 10 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: `${color}12`, border: `1px solid ${color}28`,
                  borderRadius: 6, padding: '2px 8px', marginBottom: 6,
                }}>
                  <Icon size={11} color={color} />
                  <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {label}
                  </span>
                </span>
                <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: TEXT, lineHeight: 1.5, marginBottom: act.desc ? 4 : 0 }}>
                  {actTitle(act)}
                </div>
                {act.desc && (
                  <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, lineHeight: 1.65 }}>{act.desc}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export const ShiftCalendarPage = ({ property, onBeginShift, onBack, hideSidebar = false, initialView = 'calendar' }) => {
  const TODAY_STR     = '2026-06-08';
  const YESTERDAY_STR = '2026-06-07';

  const [viewYear,         setViewYear]         = useState(2026);
  const [viewMonth,        setViewMonth]        = useState(5);
  const [selectedDate,     setSelectedDate]     = useState(null);
  const [selectedShiftIdx, setSelectedShiftIdx] = useState(0);
  const [showHandoff,      setShowHandoff]      = useState(initialView === 'handoff');

  const calData = (property?.id && SHIFT_CALENDAR[property.id]) || {};

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const dateStr = (day) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // ── Left sidebar (shared across all views) ────────────────────────────────
  const renderLeft = (backFn) => (
    <div style={{
      width: 300, minWidth: 300,
      background: SIDEBAR_BG,
      display: 'flex', flexDirection: 'column',
      padding: '28px 22px 24px',
      minHeight: 0, flex: 1,
      flexShrink: 0,
    }}>
      {/* Brand + back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 34 }}>
        <button onClick={backFn} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
          <ArrowLeft size={15} color='rgba(255,255,255,0.35)' />
          <span style={{ fontFamily: INTER, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Back</span>
        </button>
        <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: BLUE }}>✦ Notes</span>
      </div>

      {/* ── Profile photo – large & prominent ── */}
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{
          width: 118, height: 118, borderRadius: '50%',
          border: '3px solid #312E81',
          boxShadow: '0 0 0 8px rgba(79,70,229,0.14), 0 12px 40px rgba(0,0,0,0.45)',
          overflow: 'hidden',
          margin: '0 auto 16px',
        }}>
          <img
            src={CONCIERGE_PROFILE.photo}
            alt={CONCIERGE_PROFILE.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div style={{ fontFamily: INTER, fontSize: 17, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.01em', marginBottom: 3 }}>
          {CONCIERGE_PROFILE.name}
        </div>
        <div style={{ fontFamily: INTER, fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 11 }}>
          {CONCIERGE_PROFILE.title} · {CONCIERGE_PROFILE.company}
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(52,211,153,0.11)', border: '1px solid rgba(52,211,153,0.28)',
          borderRadius: 999, padding: '4px 13px',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34D399' }} />
          <span style={{ fontFamily: INTER, fontSize: 9, fontWeight: 700, color: '#34D399', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            On Shift · Head Concierge
          </span>
        </span>
      </div>

      {/* Property card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '11px 14px', marginBottom: 18,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <MapPin size={13} color='#818CF8' style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.2 }}>
            {property?.name}
          </div>
          <div style={{ fontFamily: INTER, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3, lineHeight: 1.4 }}>
            {property?.company}
          </div>
          <div style={{ fontFamily: INTER, fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 2, lineHeight: 1.4 }}>
            {property?.address?.split(',').slice(0, 2).join(',')}
          </div>
        </div>
      </div>

      {/* ── Shift policy instruction ── */}
      <div style={{
        background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.26)',
        borderRadius: 14, padding: '15px 15px',
        flex: 1, marginBottom: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(217,119,6,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={13} color={AMBER} />
          </div>
          <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: AMBER, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Shift Policy
          </span>
        </div>
        <p style={{ fontFamily: INTER, fontSize: 12, color: 'rgba(255,255,255,0.58)', lineHeight: 1.78, margin: 0 }}>
          <strong style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>
            Before starting your shift,
          </strong>{' '}
          you are required to read and fully process everything that occurred during the previous shift —
          all open items, incidents, packages, and notes left by the outgoing concierge.
          Your shift officially begins only after completing this review.
        </p>
      </div>

      {/* ── Single CTA ── */}
      <button
        onClick={() => { setShowHandoff(true); setSelectedDate(null); }}
        style={{
          width: '100%', padding: '14px 0',
          background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
          border: 'none', borderRadius: 12, cursor: 'pointer',
          fontFamily: INTER, fontSize: 13, fontWeight: 700, color: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(180,83,9,0.45)',
          letterSpacing: '-0.01em',
        }}>
        <AlertTriangle size={13} color="rgba(255,255,255,0.85)" />
        Review Prior Shift &amp; Start
      </button>

      {/* Footer date */}
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ fontFamily: INTER, fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.02em' }}>
          {new Date(2026, 5, 8).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );

  // ── Right panel wrapper ───────────────────────────────────────────────────
  const RightShell = ({ header, children, footer }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '100%', overflow: 'hidden', background: BG }}>
      <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: '22px 36px', flexShrink: 0 }}>
        {header}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 36px 0' }}>
        {children}
      </div>
      {footer && (
        <div style={{ background: CARD, borderTop: `1px solid ${BORDER}`, padding: '16px 36px', flexShrink: 0 }}>
          {footer}
        </div>
      )}
    </div>
  );

  const StartBtn = () => (
    <button onClick={onBeginShift} style={{
      width: '100%', padding: '15px 0',
      background: INDIGO, border: 'none', borderRadius: 12, cursor: 'pointer',
      fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      boxShadow: `0 4px 18px rgba(255,56,92,0.35)`,
      letterSpacing: '-0.01em',
    }}>
      <Play size={16} fill="white" />
      Start My Shift
    </button>
  );

  // ── HANDOFF NOTES VIEW ────────────────────────────────────────────────────
  if (showHandoff) {
    const priorShifts = calData[YESTERDAY_STR] || [];
    const priorShift  = priorShifts[priorShifts.length - 1];

    return (
      <div style={{ display: 'flex', minHeight: 0, flex: 1, fontFamily: INTER }}>
        {!hideSidebar && renderLeft(() => setShowHandoff(false))}
        <RightShell
          header={
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <span style={{
                  display: 'inline-block', fontFamily: INTER, fontSize: 10, fontWeight: 800,
                  color: AMBER, background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.25)',
                  borderRadius: 6, padding: '2px 9px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
                }}>Prior Shift Handoff</span>
                <h1 style={{ fontFamily: INTER, fontSize: 22, fontWeight: 700, color: TEXT, margin: '0 0 5px', letterSpacing: '-0.01em' }}>
                  {priorShift?.staff || 'Prior Shift'}
                </h1>
                <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>
                  {priorShift?.type} Shift · {priorShift?.startTime} – {priorShift?.endTime} · Sunday, June 7, 2026
                </p>
              </div>
              {priorShift && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <StatChip label="Tasks"     value={`${priorShift.tasksCompleted}/${priorShift.totalTasks}`} color={priorShift.tasksCompleted === priorShift.totalTasks ? GREEN : AMBER} />
                  <StatChip label="Incidents" value={priorShift.incidentCount}  color={priorShift.incidentCount > 0 ? RED : MUTED} />
                  <StatChip label="Pkg In"    value={priorShift.packagesIn}     color={INDIGO_CAL} />
                  <StatChip label="Pkg Out"   value={priorShift.packagesOut}    color={GREEN}  />
                </div>
              )}
            </div>
          }
          footer={<StartBtn />}
        >
          {priorShift ? (
            <>
              <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
                Full Activity Log · {priorShift.activities.length} entries
              </div>
              <Timeline activities={priorShift.activities} />
              <div style={{ height: 32 }} />
            </>
          ) : (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontFamily: INTER, fontSize: 14, color: MUTED }}>No prior shift data available</div>
            </div>
          )}
        </RightShell>
      </div>
    );
  }

  // ── SHIFT DETAIL VIEW ────────────────────────────────────────────────────
  if (selectedDate) {
    const shifts = calData[selectedDate] || [];
    const shift  = shifts[selectedShiftIdx] || shifts[0];
    const isToday = selectedDate === TODAY_STR;

    if (!shift) {
      return (
        <div style={{ display: 'flex', minHeight: 0, flex: 1, fontFamily: INTER }}>
          {!hideSidebar && renderLeft(() => { setSelectedDate(null); setSelectedShiftIdx(0); })}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: INTER, fontSize: 14, color: MUTED }}>No shift data for {fmtDate(selectedDate)}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', minHeight: 0, flex: 1, fontFamily: INTER }}>
        {!hideSidebar && renderLeft(() => { setSelectedDate(null); setSelectedShiftIdx(0); })}
        <RightShell
          header={
            <div>
              {hideSidebar && (
                <button onClick={() => { setSelectedDate(null); setSelectedShiftIdx(0); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 14px', color: MUTED }}>
                  <ChevronLeft size={16} color={MUTED} />
                  <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: MUTED }}>Back to Calendar</span>
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
                <div>
                  {isToday && (
                    <span style={{
                      display: 'inline-block', fontFamily: INTER, fontSize: 10, fontWeight: 800,
                      color: INDIGO_CAL, background: 'rgba(255,56,92,0.08)', border: '1px solid rgba(255,56,92,0.22)',
                      borderRadius: 6, padding: '2px 9px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
                    }}>Today</span>
                  )}
                  <h1 style={{ fontFamily: INTER, fontSize: 22, fontWeight: 700, color: TEXT, margin: '0 0 5px', letterSpacing: '-0.01em' }}>
                    {fmtDate(selectedDate)}
                  </h1>
                  <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>{property?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <StatChip label="Tasks"     value={`${shift.tasksCompleted}/${shift.totalTasks}`} color={shift.tasksCompleted === shift.totalTasks ? GREEN : AMBER} />
                  <StatChip label="Incidents" value={shift.incidentCount} color={shift.incidentCount > 0 ? RED : MUTED} />
                  <StatChip label="Pkg In"    value={shift.packagesIn}    color={INDIGO_CAL} />
                  <StatChip label="Pkg Out"   value={shift.packagesOut}   color={GREEN}  />
                </div>
              </div>

              {/* Shift selector tabs */}
              {shifts.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  {shifts.map((s, i) => (
                    <button key={s.id} onClick={() => setSelectedShiftIdx(i)}
                      style={{
                        padding: '7px 18px', borderRadius: 8, cursor: 'pointer',
                        fontFamily: INTER, fontSize: 12, fontWeight: 600,
                        border: selectedShiftIdx === i ? 'none' : `1px solid ${BORDER}`,
                        background: selectedShiftIdx === i ? (s.type === 'Day' ? INDIGO_CAL : NIGHT) : CARD,
                        color: selectedShiftIdx === i ? 'white' : MUTED,
                        transition: 'all 120ms',
                      }}>
                      {s.type} Shift · {s.staff.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
          footer={isToday && shift.status === 'in_progress' ? <StartBtn /> : null}
        >
          {/* Concierge row */}
          <div style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: '14px 18px', marginBottom: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{shift.staff}</div>
              <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 2 }}>
                {shift.company} · {shift.type} Shift · {shift.startTime} – {shift.endTime}
              </div>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: shift.status === 'in_progress' ? 'rgba(5,150,105,0.10)' : BG,
              border: `1px solid ${shift.status === 'in_progress' ? 'rgba(5,150,105,0.28)' : BORDER}`,
              borderRadius: 999, padding: '5px 13px',
            }}>
              {shift.status === 'in_progress' && (
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }} />
              )}
              <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: shift.status === 'in_progress' ? GREEN : MUTED }}>
                {shift.status === 'in_progress' ? 'In Progress' : 'Completed'}
              </span>
            </span>
          </div>

          <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
            Activity Log · {shift.activities.length} entries
          </div>
          <Timeline activities={shift.activities} />
          <div style={{ height: 32 }} />
        </RightShell>
      </div>
    );
  }

  // ── CALENDAR VIEW ─────────────────────────────────────────────────────────
  const today = new Date(2026, 5, 8);
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div style={{ display: 'flex', minHeight: 0, flex: 1, fontFamily: INTER }}>
      {!hideSidebar && renderLeft(onBack)}

      {/* Right panel */}
      <div style={{ flex: 1, background: BG, display: 'flex', flexDirection: 'column', maxHeight: '100%', overflow: 'hidden' }}>

        {/* Top bar — hidden inside panel shell (hideSidebar) to avoid title duplication */}
        {!hideSidebar && (
          <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: '20px 36px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 style={{ fontFamily: INTER, fontSize: 22, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>
                Shift Calendar
              </h1>
              <button
                onClick={() => { setViewYear(2026); setViewMonth(5); }}
                style={{
                  padding: '7px 18px', background: CARD,
                  border: `1.5px solid ${INDIGO_CAL}`, borderRadius: 8,
                  fontFamily: INTER, fontSize: 12, fontWeight: 700, color: INDIGO_CAL, cursor: 'pointer',
                }}>
                Today
              </button>
            </div>
          </div>
        )}
        {hideSidebar && (
          <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: '10px 20px', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setViewYear(2026); setViewMonth(5); }}
              style={{
                padding: '7px 18px', background: CARD,
                border: `1.5px solid ${INDIGO_CAL}`, borderRadius: 8,
                fontFamily: INTER, fontSize: 12, fontWeight: 700, color: INDIGO_CAL, cursor: 'pointer',
              }}>
              Today
            </button>
          </div>
        )}

        {/* Calendar body — flex column so the grid stretches to fill */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '18px 28px 16px', overflow: 'hidden', minHeight: 0 }}>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexShrink: 0 }}>
            <button onClick={prevMonth} style={{
              width: 32, height: 32, background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <ChevronLeft size={16} color={MUTED} />
            </button>
            <span style={{ fontFamily: INTER, fontSize: 17, fontWeight: 700, color: TEXT, minWidth: 140 }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={{
              width: 32, height: 32, background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <ChevronRight size={16} color={MUTED} />
            </button>
          </div>

          {/* Day header row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 3, flexShrink: 0 }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{
                padding: '7px 0', textAlign: 'center',
                fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.06em',
              }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid — flex:1 + gridAutoRows:1fr fills remaining height */}
          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gridAutoRows: '1fr', gap: 3 }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />;
              const ds      = dateStr(day);
              const shifts  = calData[ds] || [];
              const isToday_ = ds === TODAY_STR;
              const isFuture = new Date(viewYear, viewMonth, day) > today;
              const hasData  = shifts.length > 0;

              return (
                <button
                  key={ds}
                  onClick={() => { if (hasData || isToday_) { setSelectedDate(ds); setSelectedShiftIdx(0); } }}
                  style={{
                    background: isToday_ ? 'rgba(255,56,92,0.05)' : CARD,
                    border: `${isToday_ ? 2 : 1}px solid ${isToday_ ? INDIGO_CAL : BORDER}`,
                    borderRadius: 10, padding: '10px 8px',
                    cursor: hasData || isToday_ ? 'pointer' : 'default',
                    opacity: isFuture ? 0.4 : 1,
                    height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4,
                    textAlign: 'left',
                  }}>
                  <span style={{
                    fontFamily: INTER, fontSize: 14,
                    fontWeight: isToday_ ? 800 : 600,
                    color: isToday_ ? INDIGO_CAL : TEXT,
                    paddingLeft: 2, marginBottom: 2,
                    flexShrink: 0,
                  }}>{day}</span>

                  {shifts.map((s, i) => (
                    <div key={i} style={{
                      flex: 1,
                      background: s.type === 'Day' ? 'rgba(255,56,92,0.10)' : 'rgba(2,132,199,0.10)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3,
                      minHeight: 0,
                    }}>
                      <div style={{
                        fontFamily: INTER, fontSize: 13, fontWeight: 700, lineHeight: 1.2,
                        color: s.type === 'Day' ? INDIGO_CAL : NIGHT,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {s.staff.split(' ')[0]}
                      </div>
                      <div style={{
                        fontFamily: INTER, fontSize: 11, fontWeight: 500,
                        color: s.type === 'Day' ? INDIGO_CAL : '#0EA5E9',
                        lineHeight: 1.2,
                      }}>
                        {s.startTime}
                      </div>
                    </div>
                  ))}

                  {shifts.some(s => s.incidentCount > 0) && (
                    <div style={{ paddingLeft: 3 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: RED }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 22, marginTop: 12,
            paddingTop: 12, borderTop: `1px solid ${BORDER}`, flexShrink: 0,
          }}>
            {[
              { color: INDIGO_CAL, bg: 'rgba(255,56,92,0.10)',  label: 'Day Shift',    dot: false },
              { color: NIGHT,      bg: 'rgba(2,132,199,0.10)',  label: 'Night Shift',  dot: false },
              { color: RED,        bg: RED,                      label: 'Had Incident', dot: true  },
            ].map(({ color, bg, label, dot }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {dot
                  ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  : <div style={{ width: 16, height: 10, borderRadius: 4, background: bg, border: `1.5px solid ${color}50` }} />
                }
                <span style={{ fontFamily: INTER, fontSize: 11, color: MUTED }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftCalendarPage;
