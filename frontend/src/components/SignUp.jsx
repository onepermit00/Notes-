import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { UserRole } from '../types';
import { authApi } from '../services/authApi';

const BLUE  = '#FF385C';
const GREEN = '#34C759';
const INTER = "'Inter','Plus Jakarta Sans',sans-serif";

const STEPS = [
  { num: 1, title: 'Your Details',  desc: 'Tell us about yourself' },
  { num: 2, title: 'Your Property', desc: 'Where you manage' },
  { num: 3, title: 'Security',      desc: 'Protect your account' },
];

const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '8px' }}>
    {children}
  </label>
);

const Field = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);

export const SignUp = ({ onSignUp, onGoToSignIn, onBack }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [step,     setStep]     = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const [form, setForm] = useState({
    // Step 1 — personal
    firstName: '', lastName: '', email: '', phone: '', jobTitle: '',
    // Step 2 — property
    propertyName: '', address: '', city: '', state: '', units: '',
    // Step 3 — security
    password: '', confirm: '',
  });

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const validateStep = () => {
    if (step === 1) {
      if (!form.firstName || !form.lastName) return 'Please enter your full name.';
      if (!form.email) return 'Please enter your email address.';
      if (!form.phone) return 'Please enter your phone number.';
      if (!form.jobTitle) return 'Please enter your job title.';
    }
    if (step === 2) {
      if (!form.propertyName) return 'Please enter the property name.';
      if (!form.address) return 'Please enter the property address.';
      if (!form.city || !form.state) return 'Please enter city and state.';
      if (!form.units) return 'Please enter the number of units.';
    }
    if (step === 3) {
      if (!form.password) return 'Please enter a password.';
      if (form.password.length < 8) return 'Password must be at least 8 characters.';
      if (form.password !== form.confirm) return 'Passwords do not match.';
    }
    return null;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    if (step < 3) { setStep(s => s + 1); setError(''); return; }
    setLoading(true);
    try {
      const user = await authApi.signUpManager(form);
      onSignUp(user);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width: '100%', padding: '13px 16px',
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
          width: '40%', backgroundColor: '#0F0F0F',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px 52px',
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', backgroundColor: BLUE, opacity: 0.08 }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '220px', height: '220px', borderRadius: '50%', backgroundColor: BLUE, opacity: 0.06 }} />

          {/* Brand */}
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
            <span style={{ fontFamily: "'Helvetica Neue','Arial',sans-serif", fontSize: '13px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'white' }}>
              onepermit
            </span>
          </button>

          {/* Headline */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: '18px' }}>
              ✦ Manager Registration
            </p>
            <h1 style={{
              fontFamily: "'Anton','Impact',sans-serif",
              fontSize: 'clamp(40px, 4vw, 62px)',
              lineHeight: 0.95, textTransform: 'uppercase',
              letterSpacing: '-0.02em', color: 'white', margin: '0 0 20px',
            }}>
              Set up your<br />property.
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 280, margin: 0 }}>
              Create your manager account and invite your concierge team — they'll sign in with the credentials you assign.
            </p>
          </div>

          {/* Step progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {STEPS.map(({ num, title, desc }) => {
              const done    = step > num;
              const current = step === num;
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Circle */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? GREEN : current ? BLUE : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${done ? GREEN : current ? BLUE : 'rgba(255,255,255,0.12)'}`,
                    transition: 'all 300ms',
                  }}>
                    {done
                      ? <Check size={15} color="white" strokeWidth={3} />
                      : <span style={{ fontFamily: INTER, fontSize: '13px', fontWeight: 700, color: current ? 'white' : 'rgba(255,255,255,0.3)' }}>{num}</span>
                    }
                  </div>
                  {/* Labels */}
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: '14px', fontWeight: 700, color: done || current ? 'white' : 'rgba(255,255,255,0.3)', margin: '0 0 2px', transition: 'color 300ms' }}>{title}</p>
                    <p style={{ fontFamily: INTER, fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>{desc}</p>
                  </div>
                </div>
              );
            })}
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
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile: brand + step indicator */}
          {isMobile && (
            <div style={{ marginBottom: '32px' }}>
              <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 24px' }}>
                <span style={{ fontFamily: "'Helvetica Neue','Arial',sans-serif", fontSize: '13px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#0F0F0F' }}>
                  onepermit
                </span>
              </button>
              {/* Mobile progress dots */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {STEPS.map(({ num }) => (
                  <div key={num} style={{ height: 4, borderRadius: 2, flex: step === num ? 2 : 1, background: step > num ? GREEN : step === num ? BLUE : '#E5E5E5', transition: 'all 300ms' }} />
                ))}
              </div>
              <p style={{ fontFamily: INTER, fontSize: '12px', color: '#aaa', margin: '8px 0 0' }}>Step {step} of 3 — {STEPS[step-1].title}</p>
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: "'Anton','Impact',sans-serif", fontSize: 'clamp(28px, 4vw, 40px)',
              textTransform: 'uppercase', letterSpacing: '-0.02em',
              color: '#0F0F0F', margin: '0 0 6px', lineHeight: 1,
            }}>
              {STEPS[step-1].title}
            </h2>
            <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.6 }}>
              {step === 1 && <>Already have an account?{' '}<button onClick={onGoToSignIn} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: BLUE, fontWeight: 600, fontSize: '14px', fontFamily: INTER }}>Sign in</button></>}
              {step === 2 && 'Tell us about the property you manage.'}
              {step === 3 && 'Choose a strong password to protect your account.'}
            </p>
          </div>

          <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Step 1: Personal info ── */}
            {step === 1 && <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="First Name">
                  <input type="text" placeholder="George" value={form.firstName} onChange={e => set('firstName', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                </Field>
                <Field label="Last Name">
                  <input type="text" placeholder="Smith" value={form.lastName} onChange={e => set('lastName', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                </Field>
              </div>
              <Field label="Email Address">
                <input type="email" placeholder="you@property.com" value={form.email} onChange={e => set('email', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="Phone Number">
                <input type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="Job Title">
                <input type="text" placeholder="e.g. Property Manager" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
              </Field>
            </>}

            {/* ── Step 2: Property info ── */}
            {step === 2 && <>
              <Field label="Property Name">
                <input type="text" placeholder="e.g. The Hannah" value={form.propertyName} onChange={e => set('propertyName', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="Street Address">
                <input type="text" placeholder="123 Main St" value={form.address} onChange={e => set('address', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '16px' }}>
                <Field label="City">
                  <input type="text" placeholder="Philadelphia" value={form.city} onChange={e => set('city', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                </Field>
                <Field label="State">
                  <input type="text" placeholder="PA" maxLength={2} value={form.state} onChange={e => set('state', e.target.value.toUpperCase())} style={{ ...inputBase, textTransform: 'uppercase' }} onFocus={focusIn} onBlur={focusOut} />
                </Field>
              </div>
              <Field label="Number of Units">
                <input type="number" placeholder="e.g. 120" min="1" value={form.units} onChange={e => set('units', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
              </Field>
            </>}

            {/* ── Step 3: Security ── */}
            {step === 3 && <>
              <Field label="Password">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    style={{ ...inputBase, paddingRight: '48px' }}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0, display: 'flex' }}>
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: 4, borderRadius: 2, background: '#E5E5E5', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, transition: 'width 300ms, background 300ms',
                        width: form.password.length >= 12 ? '100%' : form.password.length >= 8 ? '65%' : '30%',
                        background: form.password.length >= 12 ? GREEN : form.password.length >= 8 ? '#FF9500' : BLUE,
                      }} />
                    </div>
                    <p style={{ fontFamily: INTER, fontSize: '11px', color: '#aaa', margin: '4px 0 0' }}>
                      {form.password.length >= 12 ? 'Strong' : form.password.length >= 8 ? 'Good' : 'Too short'}
                    </p>
                  </div>
                )}
              </Field>
              <Field label="Confirm Password">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConf ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    style={{ ...inputBase, paddingRight: '48px' }}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                  <button type="button" onClick={() => setShowConf(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0, display: 'flex' }}>
                    {showConf ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              {/* Summary box */}
              <div style={{ background: '#F8F8F8', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontFamily: INTER, fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Account Summary</p>
                <p style={{ fontFamily: INTER, fontSize: '14px', fontWeight: 600, color: '#222', margin: 0 }}>{form.firstName} {form.lastName}</p>
                <p style={{ fontFamily: INTER, fontSize: '13px', color: '#888', margin: 0 }}>{form.email} · {form.jobTitle}</p>
                <p style={{ fontFamily: INTER, fontSize: '13px', color: '#888', margin: 0 }}>{form.propertyName} · {form.units} units · {form.city}, {form.state}</p>
              </div>
            </>}

            {/* Error */}
            {error && <p style={{ fontSize: '13px', color: '#E05A3A', margin: 0, fontWeight: 500 }}>{error}</p>}

            {/* Nav buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setStep(s => s - 1); setError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '16px 20px', borderRadius: '12px',
                    background: 'white', border: '1.5px solid #E5E5E5',
                    fontFamily: INTER, fontSize: '15px', fontWeight: 600,
                    color: '#555', cursor: 'pointer',
                  }}>
                  <ArrowLeft size={18} />
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '16px',
                  backgroundColor: loading ? '#ddd' : (step === 3 ? GREEN : BLUE),
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontFamily: "'Anton','Impact',sans-serif", fontSize: '18px',
                  textTransform: 'uppercase', letterSpacing: '-0.01em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 200ms, transform 150ms',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.01)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
                {loading ? 'Creating account…' : step < 3 ? <> Continue <ArrowRight size={20} strokeWidth={2.5} /> </> : <> Create Account <Check size={20} strokeWidth={2.5} /> </>}
              </button>
            </div>
          </form>

          <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', marginTop: '28px', lineHeight: 1.6 }}>
            By signing up you agree to our{' '}
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
