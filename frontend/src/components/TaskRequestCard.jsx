import React, { useState } from 'react';
import { Check, X, Clock, User, Bell } from 'lucide-react';
import { DECLINE_REASONS } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';

export const TaskRequestCard = ({ task, onAccept, onDecline }) => {
  const { colors } = useTheme();
  const { CARD, BORDER, TEXT, MUTED, BLUE, RED, INTER } = colors;

  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [selectedReason, setSelectedReason]   = useState('');

  const handleDecline = () => {
    if (!selectedReason) return;
    onDecline(task.id, selectedReason);
    setShowDeclineForm(false);
  };

  return (
    <div style={{ background: CARD, border: '1.5px solid rgba(255,56,92,0.22)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(255,56,92,0.06)', fontFamily: INTER }}>
      <div style={{ padding: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, background: 'rgba(255,56,92,0.10)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bell size={24} color={BLUE} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: BLUE, background: 'rgba(255,56,92,0.10)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Request</span>
            </div>
            <h3 style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: 0, lineHeight: 1.3 }}>{task.title}</h3>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: INTER, fontSize: 12, color: MUTED }}>
            <Clock size={12} color={MUTED} />{task.scheduledTime}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: INTER, fontSize: 12, color: MUTED }}>
            <User size={12} color={MUTED} />{task.proposedBy}
          </span>
        </div>

        {task.description && (
          <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 14px', lineHeight: 1.5 }}>{task.description}</p>
        )}

        {/* Actions */}
        {showDeclineForm ? (
          <div>
            <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: RED, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>Select reason:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              {DECLINE_REASONS.map(reason => (
                <button key={reason} onClick={() => setSelectedReason(reason)}
                  style={{ width: '100%', padding: '10px 12px', background: selectedReason === reason ? 'rgba(255,59,48,0.08)' : CARD, border: selectedReason === reason ? '1px solid rgba(255,59,48,0.30)' : `1px solid ${BORDER}`, borderRadius: 10, textAlign: 'left', fontFamily: INTER, fontSize: 13, fontWeight: 500, color: selectedReason === reason ? RED : MUTED, cursor: 'pointer', transition: 'all 150ms' }}>
                  {reason}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowDeclineForm(false)}
                style={{ flex: 1, padding: '12px 0', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, fontFamily: INTER, fontSize: 13, fontWeight: 600, color: MUTED, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDecline} disabled={!selectedReason}
                style={{ flex: 1, padding: '12px 0', background: RED, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 13, fontWeight: 700, color: 'white', cursor: selectedReason ? 'pointer' : 'not-allowed', opacity: selectedReason ? 1 : 0.4 }}>
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onAccept(task)} data-testid={`accept-request-${task.id}`}
              style={{ flex: 2, padding: '13px 0', background: BLUE, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 14px rgba(255,56,92,0.28)' }}>
              <Check size={16} /> Accept
            </button>
            <button onClick={() => setShowDeclineForm(true)} data-testid={`decline-request-${task.id}`}
              style={{ flex: 1, padding: '13px 0', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <X size={16} /> Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskRequestCard;
