import React, { useState } from 'react';
import { ArrowLeft, Bell, Moon, Sun, Globe, Shield, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const INTER = `'Inter','Plus Jakarta Sans',sans-serif`;

export const SettingsPage = ({ onBack }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { BG, CARD, TEXT, MUTED, BORDER, SHADOW } = colors;
  const [notifications, setNotifications] = useState(true);

  const glassCard = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    boxShadow: SHADOW,
    borderRadius: 16,
    overflow: 'hidden',
  };

  const glassIcon = (bg) => ({
    background: bg || (isDarkMode ? '#2A2A2A' : '#F2F2F7'),
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    width: 40, height: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  const Toggle = ({ checked, onChange, testId }) => (
    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} data-testid={testId}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <div style={{
        width: 51, height: 31, borderRadius: 999,
        background: checked ? '#34C759' : (isDarkMode ? '#3A3A3A' : 'rgba(0,0,0,0.12)'),
        border: `1px solid ${BORDER}`,
        transition: 'background 200ms',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 27, height: 27,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          transition: 'left 200ms',
        }} />
      </div>
    </label>
  );

  const Row = ({ icon, label, right, divider = true }) => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={glassIcon()}>{icon}</div>
          <span style={{ fontSize: 15, fontWeight: 500, color: TEXT, fontFamily: INTER }}>{label}</span>
        </div>
        {right}
      </div>
      {divider && <div style={{ height: 1, background: BORDER, margin: '0 16px' }} />}
    </>
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

        {/* Preferences */}
        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: INTER, marginBottom: 4 }}>
          Preferences
        </p>
        <div style={glassCard}>
          <Row
            icon={<Bell size={18} color={MUTED} />}
            label="Push Notifications"
            right={
              <Toggle
                checked={notifications}
                onChange={e => setNotifications(e.target.checked)}
                testId="push-notifications-toggle"
              />
            }
          />
          <Row
            icon={isDarkMode ? <Sun size={18} color="#FF9500" /> : <Moon size={18} color={MUTED} />}
            label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            divider={false}
            right={
              <Toggle
                checked={isDarkMode}
                onChange={toggleTheme}
                testId="dark-mode-toggle"
              />
            }
          />
        </div>

        {/* Account */}
        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: INTER, marginBottom: 4, marginTop: 8 }}>
          Account
        </p>
        <div style={glassCard}>
          <button
            data-testid="privacy-security-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={glassIcon()}><Shield size={18} color={MUTED} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: TEXT, fontFamily: INTER }}>Privacy & Security</span>
            </div>
            <ChevronRight size={18} color={MUTED} />
          </button>
          <div style={{ height: 1, background: BORDER, margin: '0 16px' }} />
          <button
            data-testid="language-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={glassIcon()}><Globe size={18} color={MUTED} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: TEXT, fontFamily: INTER }}>Language</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: MUTED, fontFamily: INTER }}>English</span>
              <ChevronRight size={18} color={MUTED} />
            </div>
          </button>
        </div>

        {/* App info */}
        <div style={{ textAlign: 'center', paddingTop: 24 }}>
          <p style={{ fontSize: 14, color: MUTED, fontFamily: INTER }}>ADLTrack v1.0.0</p>
          <p style={{ fontSize: 13, color: isDarkMode ? '#3A3A3A' : 'rgba(0,0,0,0.25)', marginTop: 4, fontFamily: INTER }}>© 2026 ADLTrack Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
