import React, { useState } from 'react';
import {
  AlertTriangle, ChevronRight, Shield, Heart,
  Thermometer, Brain, Pill, HelpCircle, CheckCircle, X, ZoomIn, ChevronLeft
} from 'lucide-react';

const INTER = "'Inter','Plus Jakarta Sans',sans-serif";
const BG    = 'radial-gradient(ellipse at 20% 0%, rgba(58,123,213,0.18) 0%, transparent 55%), #080810';
const MUTED = 'rgba(255,255,255,0.4)';
const GREEN = '#2E9E5B';
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`;

const glassCard = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
  borderRadius: 16,
};

const INCIDENT_TYPES = [
  { id: 'fall',       label: 'Fall',               icon: AlertTriangle },
  { id: 'medication', label: 'Medication Issue',    icon: Pill          },
  { id: 'behavioral', label: 'Behavioral Change',   icon: Brain         },
  { id: 'injury',     label: 'Injury',              icon: Heart         },
  { id: 'vital',      label: 'Vital Sign Concern',  icon: Thermometer   },
  { id: 'other',      label: 'Other',               icon: HelpCircle    },
];

const SEVERITY_LEVELS = [
  { id: 'low',      label: 'Low'      },
  { id: 'medium',   label: 'Medium'   },
  { id: 'high',     label: 'High'     },
  { id: 'critical', label: 'Critical' },
];

const getSeverityStyle = (sev) => ({
  critical: { bg: 'rgba(244,63,94,0.18)',   color: '#fb7185' },
  high:     { bg: 'rgba(249,115,22,0.18)',  color: '#fb923c' },
  medium:   { bg: 'rgba(245,158,11,0.18)',  color: '#fbbf24' },
  low:      { bg: 'rgba(16,185,129,0.18)',  color: '#34d399' },
}[sev] || { bg: 'rgba(16,185,129,0.18)', color: '#34d399' });

export const IncidentViewPage = ({ patientName = 'Your loved one', incidents = [] }) => {
  const [selectedIncident,  setSelectedIncident]  = useState(null);
  const [viewingPhoto,      setViewingPhoto]      = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const navigatePhoto = (direction) => {
    if (!selectedIncident?.photos) return;
    const newIndex = currentPhotoIndex + direction;
    if (newIndex >= 0 && newIndex < selectedIncident.photos.length) {
      setCurrentPhotoIndex(newIndex);
      setViewingPhoto(selectedIncident.photos[newIndex]);
    }
  };

  // ── Photo Viewer Modal ───────────────────────────────────────────────────────
  const PhotoViewerModal = () => {
    if (!viewingPhoto) return null;
    const hasMultiple = selectedIncident?.photos?.length > 1;
    const canGoBack   = currentPhotoIndex > 0;
    const canGoForward = currentPhotoIndex < (selectedIncident?.photos?.length || 1) - 1;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setViewingPhoto(null)}>
        <button onClick={() => setViewingPhoto(null)}
          style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          data-testid="close-photo-viewer">
          <X size={24} color="white" />
        </button>
        {hasMultiple && (
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', padding: '8px 16px', background: 'rgba(0,0,0,0.5)', borderRadius: 999 }}>
            <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{currentPhotoIndex + 1} / {selectedIncident.photos.length}</span>
          </div>
        )}
        {hasMultiple && canGoBack && (
          <button onClick={(e) => { e.stopPropagation(); navigatePhoto(-1); }}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            data-testid="photo-prev">
            <ChevronLeft size={24} color="white" />
          </button>
        )}
        {hasMultiple && canGoForward && (
          <button onClick={(e) => { e.stopPropagation(); navigatePhoto(1); }}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            data-testid="photo-next">
            <ChevronRight size={24} color="white" />
          </button>
        )}
        <div style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={(e) => e.stopPropagation()}>
          <img src={viewingPhoto.url} alt={viewingPhoto.name || 'Evidence photo'}
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{viewingPhoto.name || 'Evidence Photo'}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Tap outside or press X to close</p>
        </div>
      </div>
    );
  };

  // ── Detail View ──────────────────────────────────────────────────────────────
  if (selectedIncident) {
    const type          = INCIDENT_TYPES.find(t => t.id === selectedIncident.type);
    const severityLevel = SEVERITY_LEVELS.find(s => s.id === selectedIncident.severity);
    const sevStyle      = getSeverityStyle(selectedIncident.severity);

    return (
      <div style={{ flex: 1, overflowY: 'auto', background: BG, paddingBottom: 96, fontFamily: INTER, position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, backgroundImage: GRAIN, backgroundSize: '200px', opacity: 0.18, pointerEvents: 'none', zIndex: 0 }} />
        <PhotoViewerModal />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ padding: '16px 20px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setSelectedIncident(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                data-testid="incident-detail-back">
                <ChevronRight size={24} color="white" style={{ transform: 'rotate(180deg)' }} />
              </button>
              <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sevStyle.bg }}>
                {type && <type.icon size={24} color={sevStyle.color} />}
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{type?.label || 'Incident'}</h1>
                <p style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{selectedIncident.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Severity badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: sevStyle.bg, color: sevStyle.color }}>
                {severityLevel?.label} Severity
              </span>
              <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                background: selectedIncident.status === 'resolved' ? `${GREEN}20` : 'rgba(245,158,11,0.18)',
                color:      selectedIncident.status === 'resolved' ? GREEN              : '#fbbf24',
              }}>
                {selectedIncident.status === 'resolved' ? 'Resolved' : 'Open'}
              </span>
            </div>

            {/* Description */}
            <div style={{ ...glassCard, padding: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', marginBottom: 8 }}>What Happened</h3>
              <p style={{ color: 'white', lineHeight: 1.65 }}>{selectedIncident.description}</p>
            </div>

            {/* Actions Taken */}
            {selectedIncident.actionsTaken && (
              <div style={{ ...glassCard, padding: 20 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', marginBottom: 8 }}>Actions Taken</h3>
                <p style={{ color: 'white', lineHeight: 1.65 }}>{selectedIncident.actionsTaken}</p>
              </div>
            )}

            {/* Photos */}
            {selectedIncident.photos && selectedIncident.photos.length > 0 && (
              <div style={{ ...glassCard, padding: 20 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', marginBottom: 12 }}>
                  Evidence Photos ({selectedIncident.photos.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {selectedIncident.photos.map((photo, index) => (
                    <button key={photo.id}
                      onClick={() => { setCurrentPhotoIndex(index); setViewingPhoto(photo); }}
                      style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: 'none', cursor: 'pointer', padding: 0 }}
                      data-testid={`view-photo-${photo.id}`}>
                      <img src={photo.url} alt={photo.name || 'Incident evidence'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ZoomIn size={20} color="white" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Caregiver Info */}
            {selectedIncident.createdBy && (
              <div style={{ ...glassCard, padding: 20 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', marginBottom: 12 }}>Reported By</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img src={selectedIncident.createdBy.photo} alt={selectedIncident.createdBy.name}
                    style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: 'white', marginBottom: 2 }}>{selectedIncident.createdBy.name}</p>
                    <p style={{ fontSize: 13, color: MUTED }}>{selectedIncident.createdBy.title}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: GREEN }}>
                    <CheckCircle size={16} color={GREEN} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* Family Notified */}
            {selectedIncident.familyNotified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: `${GREEN}12`, border: `1px solid ${GREEN}40`, borderRadius: 16 }}>
                <Shield size={20} color={GREEN} />
                <p style={{ fontSize: 14, color: 'white', lineHeight: 1.5 }}>You were notified about this incident when it was reported.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── List View ────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: BG, paddingBottom: 96, fontFamily: INTER, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: GRAIN, backgroundSize: '200px', opacity: 0.18, pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px' }}>
          <h1 style={{ fontFamily: INTER, fontSize: '1.8rem', color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Incident Reports</h1>
          <p style={{ fontSize: 14, color: MUTED }}>Care incidents reported for {patientName}</p>
        </div>

        {/* Summary Card */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ ...glassCard, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, color: 'white', fontSize: 16 }}>Summary</h3>
              <span style={{ fontSize: 13, color: MUTED }}>Last 30 days</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>{incidents.length}</p>
                <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Total</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#ff453a' }}>{incidents.filter(i => i.status === 'resolved').length}</p>
                <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Resolved</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#30d158' }}>{incidents.filter(i => i.status !== 'resolved').length}</p>
                <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Open</p>
              </div>
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div style={{ padding: '0 20px' }}>
          {incidents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {incidents.map((incident) => {
                const type          = INCIDENT_TYPES.find(t => t.id === incident.type);
                const severityLevel = SEVERITY_LEVELS.find(s => s.id === incident.severity);
                const sevStyle      = getSeverityStyle(incident.severity);
                return (
                  <button key={incident.id} onClick={() => setSelectedIncident(incident)}
                    style={{ width: '100%', ...glassCard, padding: 16, display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer' }}
                    data-testid={`family-incident-${incident.id}`}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: sevStyle.bg }}>
                      {type && <type.icon size={20} color={sevStyle.color} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontWeight: 600, color: 'white', fontSize: 15 }}>{type?.label || 'Incident'}</p>
                        <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: sevStyle.bg, color: sevStyle.color }}>
                          {severityLevel?.label.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: MUTED, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{incident.description}</p>
                      <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{incident.createdAt}</p>
                    </div>
                    <ChevronRight size={20} color={MUTED} style={{ flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ ...glassCard, padding: 40, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Shield size={40} color={GREEN} fill={GREEN} stroke="#080810" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontWeight: 700, color: 'white', fontSize: 18, marginBottom: 8 }}>No incidents reported</h3>
              <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>When caregivers report incidents, they will appear here with photos and details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentViewPage;

