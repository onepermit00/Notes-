import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const BG     = '#FFFFFF';
const CARD   = '#FFFFFF';
const CARD2  = '#F7F7F7';
const TEXT   = '#222222';
const MUTED  = '#717171';
const GREEN  = '#34C759';
const BLUE   = '#FF385C';
const BORDER = '#EBEBEB';
const SHADOW = '0 2px 12px rgba(0,0,0,0.08)';

const glassCard = (accent) => ({
  background: CARD,
  border: `1px solid ${accent ? accent + '30' : BORDER}`,
  boxShadow: SHADOW,
  borderRadius: 16,
});

const SHIFTS = [
  { date: 'Dec 15, 2024', hours: '8:00 AM - 4:00 PM',  status: 'completed', tasks: 12, completed: 12 },
  { date: 'Dec 14, 2024', hours: '8:00 AM - 4:00 PM',  status: 'completed', tasks: 10, completed: 10 },
  { date: 'Dec 13, 2024', hours: '8:00 AM - 12:00 PM', status: 'completed', tasks: 6,  completed: 5  },
  { date: 'Dec 12, 2024', hours: '12:00 PM - 8:00 PM', status: 'completed', tasks: 8,  completed: 8  },
  { date: 'Dec 11, 2024', hours: '8:00 AM - 4:00 PM',  status: 'cancelled', tasks: 0,  completed: 0  },
];

export const HistoryPage = ({ onBack }) => {
  const [filter, setFilter] = useState('all');

  const filteredShifts = filter === 'all' ? SHIFTS : SHIFTS.filter(s => s.status === filter);

  return (
    <div data-testid="shift-history-page" style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: BG, fontFamily: INTER }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, background: CARD, flexShrink: 0 }}>
        {onBack && (
          <button onClick={onBack} data-testid="history-back-btn" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <ArrowLeft size={18} color={MUTED} />
          </button>
        )}
        <div>
          <h1 style={{ fontFamily: INTER, fontSize: 17, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>Shift History</h1>
          <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '2px 0 0' }}>Your recent shift log</p>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ padding: '14px 20px', display: 'flex', gap: 8 }}>
        {['all', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`filter-${f}`}
            style={{ padding: '8px 18px', borderRadius: 999, fontFamily: INTER, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
              background: filter === f ? BLUE : CARD2,
              border: filter === f ? 'none' : `1px solid ${BORDER}`,
              color: filter === f ? 'white' : MUTED,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Shift cards */}
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredShifts.map((shift, i) => (
          <div
            key={i}
            data-testid={`shift-card-${i}`}
            style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 18, borderLeft: `3px solid ${shift.status === 'completed' ? GREEN : MUTED}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: shift.status === 'completed' ? 'rgba(52,199,89,0.10)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={18} color={shift.status === 'completed' ? GREEN : MUTED} />
                </div>
                <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{shift.date}</span>
              </div>
              {shift.status === 'completed' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(52,199,89,0.10)', color: GREEN, fontFamily: INTER, fontSize: 12, fontWeight: 700 }}>
                  <CheckCircle size={13} fill={GREEN} stroke={CARD} strokeWidth={2} /> Completed
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: CARD2, color: MUTED, fontFamily: INTER, fontSize: 12, fontWeight: 700 }}>
                  <XCircle size={13} /> Cancelled
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 50 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={13} color={MUTED} />
                <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>{shift.hours}</span>
              </div>
              {shift.status === 'completed' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={13} color={GREEN} fill={GREEN} stroke={CARD} strokeWidth={2} />
                  <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>{shift.completed}/{shift.tasks} tasks</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredShifts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: 15, color: MUTED }}>No shifts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

