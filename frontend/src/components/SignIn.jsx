import React, { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';
import { authApi } from '../services/authApi';

const BLUE = '#FF385C';
const INTER = "'Inter','Plus Jakarta Sans',sans-serif";

export const SignIn = ({ onSignIn, onGoToSignUp, onBack }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [role,     setRole]     = useState(UserRole.CONCIERGE);
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      const apiRole = role === UserRole.MANAGER ? 'manager' : 'concierge';
      const user = await authApi.signIn(apiRole, form.email, form.password);
      onSignIn(role, user);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { label: 'Concierge', value: UserRole.CONCIERGE, color: '#FF385C' },
    { label: 'Manager',   value: UserRole.MANAGER,   color: '#34C759' },
  ];

  const inputBase = {
    width: '100%', padding: '14px 16px',
    fontSize: '15px', fontFamily: INTER,
    border: '1.5px solid #E5E5E5', borderRadius: '10px',
    color: '#0F0F0F', outline: 'none', backgroundColor: '#FAFAFA',
    transition: 'border-color 200ms', boxSizing: 'border-box',
  };

  const focusIn  = e => { e.target.style.borderColor = BLUE; };
  const focusOut = e => { e.target.style.borderColor = '#E5E5E5'; };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: INTER, overflow: 'hidden' }}>

      {/* ── Left panel ─────────────────────────────────────────── */}
      {!isMobile && (
        <div style={{
          width: '44%', backgroundColor: '#FF385C',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px 56px',
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', backgroundColor: '#FFFFFF', opacity: 0.12 }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', backgroundColor: '#FFFFFF', opacity: 0.09 }} />

          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
            <span style={{ fontFamily: "'Helvetica Neue','Arial',sans-serif", fontSize: '13px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'white' }}>
              onepermit
            </span>
          </button>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>
              ✦ Welcome back
            </p>
            <h1 style={{
              fontFamily: "'Anton','Impact',sans-serif",
              fontSize: 'clamp(48px, 5vw, 72px)',
              lineHeight: 0.95, textTransform: 'uppercase',
              letterSpacing: '-0.02em', color: 'white', margin: '0 0 24px',
            }}>
              Good to see<br />you again.
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 300, margin: 0 }}>
              Sign in to access your property shift dashboard, review open tasks, and manage your team.
            </p>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>
              Built for
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Property Managers', 'Concierge Staff'].map(t => (
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

      {/* ── Right panel ─────────────────────────────────────────── */}
      <div style={{
        flex: 1, backgroundColor: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '40px 24px' : '48px 64px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {isMobile && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 32px' }}>
              <span style={{ fontFamily: "'Helvetica Neue','Arial',sans-serif", fontSize: '13px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#0F0F0F' }}>
                onepermit
              </span>
            </button>
          )}

          <h2 style={{
            fontFamily: "'Anton','Impact',sans-serif", fontSize: 'clamp(32px, 5vw, 44px)',
            textTransform: 'uppercase', letterSpacing: '-0.02em',
            color: '#0F0F0F', margin: '0 0 8px', lineHeight: 1,
          }}>
            Sign In
          </h2>

          {/* Sign-up link — only for Manager */}
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 32px', lineHeight: 1.6, minHeight: 22 }}>
            {role === UserRole.MANAGER ? (
              <>
                Don't have an account?{' '}
                <button onClick={onGoToSignUp} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: BLUE, fontWeight: 600, fontSize: '14px', fontFamily: INTER }}>
                  Sign up
                </button>
              </>
            ) : (
              <span style={{ color: '#aaa' }}>Contact your property manager to get access.</span>
            )}
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
                  type="button"
                  onClick={() => { setRole(value); setError(''); }}
                  style={{
                    flex: 1, padding: '12px 6px',
                    borderRadius: '10px', cursor: 'pointer',
                    fontFamily: INTER, fontSize: '14px', fontWeight: 700,
                    border: role === value ? `2px solid ${color}` : '2px solid #E5E5E5',
                    backgroundColor: role === value ? `${color}12` : '#FAFAFA',
                    color: role === value ? color : '#aaa',
                    transition: 'all 200ms',
                  }}>
                  {label}
                </button>
              ))}
            </div>
            {role === UserRole.CONCIERGE && (
              <p style={{ fontSize: '12px', color: '#aaa', margin: '10px 0 0', lineHeight: 1.5 }}>
                Your login credentials were set up by your property manager.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '8px' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputBase}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>
                  Password
                </label>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: BLUE, fontWeight: 600, fontFamily: INTER, padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ ...inputBase, paddingRight: '48px' }}
                  onFocus={focusIn} onBlur={focusOut}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0, display: 'flex' }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p style={{ fontSize: '13px', color: '#E05A3A', margin: 0, fontWeight: 500 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '16px', marginTop: '8px',
                backgroundColor: loading ? '#ddd' : BLUE,
                color: 'white', border: 'none', borderRadius: '12px',
                fontFamily: "'Anton','Impact',sans-serif", fontSize: '18px',
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
            By signing in you agree to our{' '}
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
