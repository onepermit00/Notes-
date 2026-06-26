import React, { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

export const SignIn = ({ onSignIn, onGoToSignUp, onBack }) => {
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [role,      setRole]      = useState(UserRole.CAREGIVER);
  const [form,      setForm]      = useState({ email: '', password: '' });
  const [error,     setError]     = useState('');

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    // Simulate auth — wire to real backend here
    setTimeout(() => { setLoading(false); onSignIn(role); }, 900);
  };

  const ROLES = [
    { label: 'Concierge', value: UserRole.CONCIERGE,  color: '#F4845F' },
    { label: 'Manager',   value: UserRole.MANAGER,    color: '#6BBF7A' },
    { label: 'Vendor',    value: UserRole.ENTERPRISE, color: '#C4822A' },
  ];

  const inputStyle = (focused) => ({
    width: '100%', padding: '14px 16px',
    fontSize: '15px', fontFamily: 'Inter, sans-serif',
    border: `1.5px solid ${focused ? '#0F0F0F' : '#E5E5E5'}`,
    borderRadius: '10px', color: '#0F0F0F',
    outline: 'none', backgroundColor: '#FAFAFA',
    transition: 'border-color 200ms', boxSizing: 'border-box',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

      {/* ── Left panel (hidden on mobile) ───────────────────────── */}
      {!isMobile && (
        <div style={{
          width: '44%', backgroundColor: '#FF385C',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px 56px',
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', backgroundColor: '#FFFFFF', opacity: 0.12 }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', backgroundColor: '#FFFFFF', opacity: 0.09 }} />

          {/* Brand */}
          <div>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'white' }}>
                ✦ Notes
              </span>
            </button>
          </div>

          {/* Headline */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>
              ✦ Welcome back
            </p>
            <h1 style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(48px, 5vw, 76px)',
              lineHeight: 0.95, textTransform: 'uppercase',
              letterSpacing: '-0.02em', color: 'white', margin: '0 0 24px',
            }}>
              Good to see<br />you again.
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 320, margin: 0 }}>
              Sign in to access your property shift dashboard, review open incidents, and manage your team's operations.
            </p>
          </div>

          {/* Role pills */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>
              Trusted by
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Concierges', 'Property Managers', 'Vendor Companies'].map((t, i) => (
                <span key={t} style={{
                  padding: '6px 14px', borderRadius: '100px',
                  fontSize: '12px', fontWeight: 500,
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Right panel (form) ──────────────────────────────────── */}
      <div style={{
        flex: 1, backgroundColor: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '40px 24px' : '48px 64px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile brand */}
          {isMobile && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 32px' }}>
              <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F0F0F' }}>
                ✦ Notes
              </span>
            </button>
          )}

          <h2 style={{
            fontFamily: 'Anton, sans-serif', fontSize: 'clamp(32px, 5vw, 44px)',
            textTransform: 'uppercase', letterSpacing: '-0.02em',
            color: '#0F0F0F', margin: '0 0 8px', lineHeight: 1,
          }}>
            Sign In
          </h2>
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 36px', lineHeight: 1.6 }}>
            Don't have an account?{' '}
            <button onClick={onGoToSignUp} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#F4845F', fontWeight: 600, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              Sign up
            </button>
          </p>

          {/* Role selector */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '10px' }}>
              I am a
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {ROLES.map(({ label, value, color }) => (
                <button
                  key={value}
                  onClick={() => setRole(value)}
                  style={{
                    flex: 1, padding: '10px 6px',
                    borderRadius: '10px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600,
                    border: role === value ? `2px solid ${color}` : '2px solid #E5E5E5',
                    backgroundColor: role === value ? `${color}18` : '#FAFAFA',
                    color: role === value ? color : '#888',
                    transition: 'all 200ms',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputStyle(false)}
                onFocus={e  => { e.target.style.borderColor = '#FF385C'; }}
                onBlur={e   => { e.target.style.borderColor = '#E5E5E5'; }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>
                  Password
                </label>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#F4845F', fontWeight: 600, fontFamily: 'Inter, sans-serif', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ ...inputStyle(false), paddingRight: '48px' }}
                  onFocus={e => { e.target.style.borderColor = '#FF385C'; }}
                  onBlur={e  => { e.target.style.borderColor = '#E5E5E5'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#999', padding: 0, display: 'flex',
                  }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ fontSize: '13px', color: '#E05A3A', margin: 0, fontWeight: 500 }}>{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '16px', marginTop: '8px',
                backgroundColor: loading ? '#ddd' : '#FF385C',
                color: 'white', border: 'none', borderRadius: '12px',
                fontFamily: 'Anton, sans-serif', fontSize: '18px',
                textTransform: 'uppercase', letterSpacing: '-0.01em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 200ms, transform 150ms',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.01)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
              {loading ? 'Signing in…' : <> Sign In <ArrowRight size={20} strokeWidth={2.5} /> </>}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', marginTop: '32px', lineHeight: 1.6 }}>
            By signing in you agree to Notes's{' '}
            <span style={{ color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
            {' '}and{' '}
            <span style={{ color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
