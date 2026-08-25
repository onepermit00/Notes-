import React, { useState } from 'react';
import { X, Camera, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { TaskStatus } from '../types';
import { DECLINE_REASONS } from '../services/mockData';

const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const BG     = '#FFFFFF';
const CARD   = '#FFFFFF';
const TEXT   = '#222222';
const MUTED  = '#717171';
const BORDER = '#EBEBEB';
const GREEN  = '#34C759';
const BLUE   = '#FF385C';
const RED    = '#FF3B30';
const SHADOW = '0 2px 12px rgba(0,0,0,0.08)';

const glassInner = {
  background: BG,
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
};

export const TaskCompletionModal = ({ task, onClose, onComplete }) => {
  const [mode, setMode] = useState('complete');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState([]); // [{ preview: string }]
  const [selectedReason, setSelectedReason] = useState('');

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(p => [...p, { preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (idx) => setPhotos(p => p.filter((_, i) => i !== idx));

  const handleComplete = () => {
    if (task.requiresPhoto && photos.length === 0 && mode === 'complete') {
      alert('This task requires a photo as evidence.');
      return;
    }
    onComplete({
      ...task,
      status: mode === 'complete' ? TaskStatus.COMPLETED : TaskStatus.MISSED,
      completedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      completionNote: note,
      evidenceUrls: photos.map(p => p.preview),
      missedReason: mode === 'cantComplete' ? selectedReason : null
    });
    onClose();
  };

  return (
    <div
      data-testid="task-completion-modal"
      style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', fontFamily: INTER, background: BG }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: `1px solid ${BORDER}`, background: CARD }}>
        <div>
          <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, margin: '0 0 2px' }}>Complete Task</p>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>{task.title}</h2>
        </div>
        <button onClick={onClose} data-testid="task-modal-close" style={{ width: 36, height: 36, background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <X size={18} color={MUTED} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => setMode('complete')}
            data-testid="mode-complete-btn"
            style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: mode !== 'complete' ? `1px solid ${BORDER}` : 'none', fontFamily: INTER, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 200ms',
              background: mode === 'complete' ? BLUE : CARD,
              color: mode === 'complete' ? 'white' : MUTED,
              boxShadow: mode === 'complete' ? '0 4px 16px rgba(255,56,92,0.3)' : SHADOW,
            }}
          >
            <CheckCircle size={18} /> Complete
          </button>
          <button
            onClick={() => setMode('cantComplete')}
            data-testid="mode-cant-complete-btn"
            style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: mode !== 'cantComplete' ? `1px solid ${BORDER}` : 'none', fontFamily: INTER, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 200ms',
              background: mode === 'cantComplete' ? RED : CARD,
              color: mode === 'cantComplete' ? 'white' : MUTED,
              boxShadow: mode === 'cantComplete' ? '0 4px 16px rgba(255,59,48,0.3)' : SHADOW,
            }}
          >
            <XCircle size={18} /> Can't Complete
          </button>
        </div>

        {/* Instructions */}
        <div style={{ ...glassInner, padding: '16px 18px', marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Instructions</p>
          <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{task.instructions || task.description}</p>
        </div>

        {mode === 'complete' ? (
          <>
            {/* Photo upload */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
                Photo Evidence ({task.requiresPhoto ? 'Required' : 'Optional'})
              </p>

              {/* Existing previews */}
              {photos.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                  {photos.map((p, i) => (
                    <div key={i} style={{ position: 'relative', width: 90, height: 90, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={p.preview} alt={`Evidence ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <button
                        onClick={() => removePhoto(i)}
                        style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, background: 'rgba(0,0,0,0.55)', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={12} color="white" />
                      </button>
                    </div>
                  ))}
                  {/* Add more button */}
                  <label style={{ width: 90, height: 90, borderRadius: 12, border: `2px dashed ${BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: BG, gap: 4 }}>
                    <Plus size={20} color={MUTED} />
                    <span style={{ fontFamily: INTER, fontSize: 11, color: MUTED }}>Add</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </label>
                </div>
              )}

              {/* Empty state — upload zone */}
              {photos.length === 0 && (
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{ ...glassInner, padding: '32px 20px', textAlign: 'center', border: `2px dashed ${BORDER}` }}>
                    <div style={{ width: 60, height: 60, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: SHADOW }}>
                      <Camera size={28} color={MUTED} />
                    </div>
                    <p style={{ fontSize: 15, color: TEXT, fontWeight: 600 }}>Tap to add photos</p>
                    <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>You can upload multiple photos</p>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Notes */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Notes</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any relevant notes here..."
                data-testid="task-note-input"
                rows={4}
                style={{ width: '100%', padding: '14px 16px', ...glassInner, color: TEXT, fontFamily: INTER, fontSize: 15, resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </>
        ) : (
          /* Can't complete */
          <div>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, color: RED, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
              <AlertTriangle size={14} /> Reason for Not Completing
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  style={{ width: '100%', padding: '16px 18px', borderRadius: 14, textAlign: 'left', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: INTER, transition: 'all 150ms',
                    ...(selectedReason === reason
                      ? { background: 'rgba(255,59,48,0.08)', border: '2px solid rgba(255,59,48,0.3)', color: RED }
                      : { ...glassInner, border: `1px solid ${BORDER}`, color: TEXT })
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom button */}
      <div style={{ flexShrink: 0, padding: '14px 24px 20px', background: CARD, borderTop: `1px solid ${BORDER}` }}>
        <button
          onClick={handleComplete}
          disabled={mode === 'cantComplete' && !selectedReason}
          data-testid="submit-task-completion"
          style={{ width: '100%', padding: '16px 0', borderRadius: 14, border: 'none', fontFamily: INTER, fontSize: 16, fontWeight: 700, cursor: (mode === 'cantComplete' && !selectedReason) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 200ms',
            background: mode === 'complete' ? BLUE : RED,
            color: 'white',
            opacity: (mode === 'cantComplete' && !selectedReason) ? 0.4 : 1,
            boxShadow: mode === 'complete' ? '0 8px 24px rgba(255,56,92,0.3)' : '0 8px 24px rgba(239,68,68,0.3)',
          }}
        >
          <CheckCircle size={20} />
          {mode === 'complete' ? 'Mark as Complete' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
};

export default TaskCompletionModal;
