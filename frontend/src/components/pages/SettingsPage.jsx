import React, { useState } from 'react';
import { ArrowLeft, Bell, Moon, Globe, Shield, ChevronRight } from 'lucide-react';

const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const BG     = '#FFFFFF';
const CARD   = '#FFFFFF';
const TEXT   = '#222222';
const MUTED  = '#717171';
const BORDER = '#EBEBEB';
const SHADOW = '0 2px 12px rgba(0,0,0,0.08)';

const glassCard = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  boxShadow: SHADOW,
  borderRadius: 16,
  overflow: 'hidden',
};

const glassIcon = {
  background: '#F2F2F7',
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const SettingsPage = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const Toggle = ({ checked, onChange, testId }) => (
    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} data-testid={testId}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <div style={{
        width: 51, height: 31, borderRadius: 999,
        background: checked ? '#34C759' : 'rgba(0,0,0,0.12)',
        border: `1px solid ${BORDER}`,
        transition: 'background 200ms',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 27,
          height: 27,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          transition: 'left 200ms',
        }} />
      </div>
    </label>
  );

  return (
    <div data-testid="settings-page" style={{ minHeight: '100vh', background: BG, fontFamily: INTER }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', borderBottom: `1px solid ${BORDER}`, background: CARD }}>
        <button onClick={onBack} data-testid="settings-back-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontFamily: INTER, fontSize: '1.4rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>Settings</h1>
      </div>

      <div style={{ padding: '20px 20px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Toggle card */}
        <div style={glassCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={glassIcon}><Bell size={18} color={MUTED} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: TEXT }}>Push Notifications</span>
            </div>
            <Toggle
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              testId="push-notifications-toggle"
            />
          </div>
          <div style={{ height: 1, background: `${BORDER}`, margin: '0 16px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={glassIcon}><Moon size={18} color={MUTED} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: TEXT }}>Dark Mode</span>
            </div>
            <Toggle
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              testId="dark-mode-toggle"
            />
          </div>
        </div>

        {/* Navigation card */}
        <div style={glassCard}>
          <button
            data-testid="privacy-security-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={glassIcon}><Shield size={18} color={MUTED} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: TEXT }}>Privacy & Security</span>
            </div>
            <ChevronRight size={18} color={MUTED} />
          </button>
          <div style={{ height: 1, background: BORDER, margin: '0 16px' }} />
          <button
            data-testid="language-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={glassIcon}><Globe size={18} color={MUTED} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: TEXT }}>Language</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: MUTED }}>English</span>
              <ChevronRight size={18} color={MUTED} />
            </div>
          </button>
        </div>

        {/* App info */}
        <div style={{ textAlign: 'center', paddingTop: 24 }}>
          <p style={{ fontSize: 14, color: MUTED }}>Notes v1.0.0</p>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.25)', marginTop: 4 }}>© 2026 Notes Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
