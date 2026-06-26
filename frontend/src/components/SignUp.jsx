import React, { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

export const SignUp = ({ onSignUp, onGoToSignIn, onBack }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', role: UserRole.CAREGIVER,
  });

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setError('');
    setLoading(true);
    // Simulate auth — wire to real backend here
    setTimeout(() => { setLoading(false); onSignUp(form.role); }, 900);
  };

  const ROLES = [
    { label: 'Caregiver',  value: UserRole.CAREGIVER,  color: '#F4845F' },
    { label: 'Family',     value: UserRole.FAMILY,     color: '#6BBF7A' },
    { label: 'Enterprise', value: UserRole.ENTERPRISE, color: '#C4822A' },
  ];

  const inputStyle = () => ({
    width: '100%', padding: '14px 16px',
    fontSize: '15px', fontFamily: 'Inter, sans-serif',
    border: '1.5px solid #E5E5E5', borderRadius: '10px',
    color: '#0F0F0F', outline: 'none', backgroundColor: '#FAFAFA',
    transition: 'border-color 200ms', boxSizing: 'border-box',
  });

  const focusIn  = e => { e.target.style.borderColor = '#FF385C'; };
  const focusOut = e => { e.target.style.borderColor = '#E5E5E5'; };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

      {/* ── Left panel ──────────────────────────────────────────── */}
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
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'white' }}>
              ✦ Notes
            </span>
          </button>

          {/* Headline */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>
              ✦ Join the team
            </p>
            <h1 style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(48px, 5vw, 76px)',
              lineHeight: 0.95, textTransform: 'uppercase',
              letterSpacing: '-0.02em', color: 'white', margin: '0 0 24px',
            }}>
              Care starts<br />with you.
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 320, margin: 0 }}>
              Join hundreds of care teams using Notes to deliver better outcomes — for caregivers, families, and enterprise alike.
            </p>
          </div>

          {/* Feature checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Free to get started', 'No credit card required', 'Set up in under 5 minutes'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>✓</span>
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>{item}</span>
              </div>
            ))}
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
            Create Account
          </h2>
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 32px', lineHeight: 1.6 }}>
            Already have an account?{' '}
            <button onClick={onGoToSignIn} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#FF385C', fontWeight: 600, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              Sign in
            </button>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Full name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '8px' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Smith"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={inputStyle()}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>

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
                style={inputStyle()}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>

            {/* Role */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '10px' }}>
                I am a
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {ROLES.map(({ label, value, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: value }))}
                    style={{
                      flex: 1, padding: '10px 6px',
                      borderRadius: '10px', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600,
                      border: form.role === value ? `2px solid ${color}` : '2px solid #E5E5E5',
                      backgroundColor: form.role === value ? `${color}18` : '#FAFAFA',
                      color: form.role === value ? color : '#888',
                      transition: 'all 200ms',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ ...inputStyle(), paddingRight: '48px' }}
                  onFocus={focusIn} onBlur={focusOut}
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

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '8px' }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                style={inputStyle()}
                onFocus={focusIn} onBlur={focusOut}
              />
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
                padding: '16px', marginTop: '4px',
                backgroundColor: loading ? '#ddd' : '#FF385C',
                color: 'white', border: 'none', borderRadius: '12px',
                fontFamily: 'Anton, sans-serif', fontSize: '18px',
                textTransform: 'uppercase', letterSpacing: '-0.01em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 200ms, transform 150ms',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.01)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
              {loading ? 'Creating account…' : <> Create Account <ArrowRight size={20} strokeWidth={2.5} /> </>}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', marginTop: '28px', lineHeight: 1.6 }}>
            By signing up you agree to Notes's{' '}
            <span style={{ color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
            {' '}and{' '}
            <span style={{ color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
