import React from 'react';
import { MapPin, ChevronRight, Package, AlertTriangle } from 'lucide-react';
import { USER_PROPERTIES } from '../services/mockData';

const BG     = '#F2F2F7';
const CARD   = '#FFFFFF';
const GREEN  = '#2E9E5B';
const RED    = '#FF3B30';
const BLUE   = '#3A7BD5';
const BORDER = 'rgba(0,0,0,0.09)';
const TEXT   = '#222222';
const MUTED  = '#8E8E93';
const SHADOW = '0 2px 10px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)';
const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;

export const PropertySelectPage = ({ onSelect, userName = 'George Nwachukwu' }) => {
  const firstName = userName.split(' ')[0];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: INTER }}>

      {/* Header */}
      <div style={{ background: CARD, padding: '52px 20px 24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.16em', marginBottom: 8 }}>
          CLOCKIT · PROPERTY SELECT
        </div>
        <div style={{ fontFamily: INTER, fontSize: 'clamp(1.5rem,6vw,2.2rem)', color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Good {getGreeting()},<br />{firstName}
        </div>
        <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 8 }}>
          Which property are you covering today?
        </div>
      </div>

      {/* Property cards */}
      <div style={{ padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {USER_PROPERTIES.map(prop => (
          <button key={prop.id} onClick={() => onSelect(prop)}
            style={{ width: '100%', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: SHADOW, cursor: 'pointer', textAlign: 'left', padding: 0 }}>

            {/* Photo banner */}
            <div style={{ position: 'relative', height: 150, overflow: 'hidden' }}>
              <img src={prop.photo} alt={prop.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: INTER, fontSize: '1.3rem', color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{prop.name}</div>
                  <div style={{ fontFamily: INTER, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{prop.company}</div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999, padding: '5px 12px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN }} />
                  <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, color: 'white' }}>{prop.yourRole}</span>
                </div>
              </div>
            </div>

            {/* Info section */}
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                <MapPin size={13} color={MUTED} />
                <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{prop.address}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, color: GREEN, background: 'rgba(46,158,91,0.08)', border: '1px solid rgba(46,158,91,0.2)', borderRadius: 8, padding: '4px 10px' }}>
                  {prop.units} units
                </span>
                {prop.activeIncidents > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: INTER, fontSize: 11, fontWeight: 600, color: RED, background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 8, padding: '4px 10px' }}>
                    <AlertTriangle size={11} color={RED} />
                    {prop.activeIncidents} open incident{prop.activeIncidents > 1 ? 's' : ''}
                  </span>
                )}
                {prop.pendingPackages > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: INTER, fontSize: 11, fontWeight: 600, color: BLUE, background: 'rgba(58,123,213,0.08)', border: '1px solid rgba(58,123,213,0.2)', borderRadius: 8, padding: '4px 10px' }}>
                    <Package size={11} color={BLUE} />
                    {prop.pendingPackages} pkg{prop.pendingPackages > 1 ? 's' : ''}
                  </span>
                )}
                <ChevronRight size={18} color={MUTED} style={{ marginLeft: 'auto' }} />
              </div>

              <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginTop: 10 }}>
                Last shift: {prop.lastShift}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
}

export default PropertySelectPage;

