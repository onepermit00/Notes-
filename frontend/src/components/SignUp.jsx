import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { authApi } from '../services/authApi';

const STEPS = [
  { num: 1, title: 'Your Details', desc: 'Tell us about yourself' },
  { num: 2, title: 'Your Property', desc: 'Where you manage' },
  { num: 3, title: 'Security', desc: 'Protect your account' },
];

const inputClass =
  'min-h-12 w-full rounded-xl border border-[#ebebeb] bg-[#f7f7f7] px-4 text-base text-[#222] placeholder:text-[#9b9b9b] focus:border-[#ff385c] focus:outline-none';

const Field = ({ label, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold">{label}</label>
    {children}
  </div>
);

export const SignUp = ({ onSignUp, onGoToSignIn, onBack }) => {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', jobTitle: '',
    propertyName: '', address: '', city: '', state: '', units: '',
    password: '', confirm: '',
  });

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

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
    if (step < 3) { setStep((s) => s + 1); setError(''); return; }
    setLoading(true);
    try {
      const user = await authApi.signUpManager(form);
      onSignUp(user);
    } catch (err2) {
      setError(err2?.response?.data?.detail || err2.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length >= 12 ? 'strong' : form.password.length >= 8 ? 'good' : 'short';

  return (
    <div
      className="flex min-h-[100dvh] bg-white text-[#222]"
      style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* ── Left — editorial narrative + step progress (desktop) ──────────── */}
      <aside className="hidden w-[40%] shrink-0 flex-col justify-between bg-[#0b0b0b] p-12 text-white lg:flex">
        <button onClick={onBack} className="self-start text-left text-[12px] font-extrabold uppercase tracking-[0.24em] text-white" data-testid="signup-brand-back">
          ✦ Notes
        </button>

        <div>
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-9 bg-[#ff385c]" aria-hidden="true" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/55">Manager registration</p>
          </div>
          <h1 className="mt-7 text-[44px] font-extrabold leading-[0.92] tracking-[-0.05em] xl:text-[56px]">
            Set up your<br />property.
          </h1>
          <p className="mt-6 max-w-[320px] text-[14px] leading-[1.75] text-white/50">
            Create your manager account and invite your concierge team — they'll sign in with the credentials you assign.
          </p>
        </div>

        <ol className="flex flex-col gap-5" aria-label="Registration steps">
          {STEPS.map(({ num, title, desc }) => {
            const done = step > num;
            const current = step === num;
            return (
              <li key={num} className="flex items-center gap-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold transition-colors ${
                    done
                      ? 'border-[#34c759] bg-[#34c759] text-white'
                      : current
                        ? 'border-[#ff385c] bg-[#ff385c] text-white'
                        : 'border-white/15 bg-white/[0.06] text-white/40'
                  }`}>
                  {done ? <Check size={15} strokeWidth={3} /> : num}
                </span>
                <span>
                  <span className={`block text-[14px] font-bold ${done || current ? 'text-white' : 'text-white/40'}`}>{title}</span>
                  <span className="block text-[12px] text-white/35">{desc}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* ── Right — form ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-10 md:px-16 md:py-12 lg:items-center">
        <div className="w-full max-w-[460px]">

          {/* Mobile: brand + progress */}
          <div className="mb-8 lg:hidden">
            <button onClick={onBack} className="mb-6 flex min-h-11 items-center text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#222]" data-testid="signup-mobile-back">
              ✦ Notes
            </button>
            <div className="flex items-center gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Step ${step} of 3`}>
              {STEPS.map(({ num }) => (
                <span
                  key={num}
                  className={`h-1 rounded-full transition-all ${step === num ? 'flex-[2]' : 'flex-1'} ${
                    step > num ? 'bg-[#34c759]' : step === num ? 'bg-[#ff385c]' : 'bg-[#ebebeb]'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-[12px] font-medium text-[#717171]">Step {step} of 3 — {STEPS[step - 1].title}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-0.5 w-9 bg-[#ff385c]" aria-hidden="true" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-black/55">Create account</p>
          </div>
          <h2 className="mt-5 text-[34px] font-extrabold leading-[0.97] tracking-[-0.04em] sm:text-[40px]" data-testid="signup-step-heading">
            {STEPS[step - 1].title}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#717171]">
            {step === 1 && (
              <>
                Already have an account?{' '}
                <button onClick={onGoToSignIn} className="font-bold text-[#ff385c]" data-testid="go-to-signin-btn">Sign in</button>
              </>
            )}
            {step === 2 && 'Tell us about the property you manage.'}
            {step === 3 && 'Choose a strong password to protect your account.'}
          </p>

          <form onSubmit={handleNext} className="mt-8 flex flex-col gap-4" noValidate>

            {/* ── Step 1: Personal ── */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name" htmlFor="su-first">
                    <input id="su-first" type="text" autoComplete="given-name" placeholder="George" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputClass} data-testid="signup-firstname-input" />
                  </Field>
                  <Field label="Last name" htmlFor="su-last">
                    <input id="su-last" type="text" autoComplete="family-name" placeholder="Smith" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputClass} data-testid="signup-lastname-input" />
                  </Field>
                </div>
                <Field label="Email address" htmlFor="su-email">
                  <input id="su-email" type="email" autoComplete="email" placeholder="you@property.com" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} data-testid="signup-email-input" />
                </Field>
                <Field label="Phone number" htmlFor="su-phone">
                  <input id="su-phone" type="tel" autoComplete="tel" placeholder="(555) 000-0000" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} data-testid="signup-phone-input" />
                </Field>
                <Field label="Job title" htmlFor="su-job">
                  <input id="su-job" type="text" placeholder="e.g. Property Manager" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} className={inputClass} data-testid="signup-jobtitle-input" />
                </Field>
              </>
            )}

            {/* ── Step 2: Property ── */}
            {step === 2 && (
              <>
                <Field label="Property name" htmlFor="su-property">
                  <input id="su-property" type="text" placeholder="e.g. The Hannah" value={form.propertyName} onChange={(e) => set('propertyName', e.target.value)} className={inputClass} data-testid="signup-property-input" />
                </Field>
                <Field label="Street address" htmlFor="su-address">
                  <input id="su-address" type="text" autoComplete="street-address" placeholder="123 Main St" value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} data-testid="signup-address-input" />
                </Field>
                <div className="grid grid-cols-[1fr_88px] gap-4">
                  <Field label="City" htmlFor="su-city">
                    <input id="su-city" type="text" placeholder="Philadelphia" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputClass} data-testid="signup-city-input" />
                  </Field>
                  <Field label="State" htmlFor="su-state">
                    <input id="su-state" type="text" maxLength={2} placeholder="PA" value={form.state} onChange={(e) => set('state', e.target.value.toUpperCase())} className={`${inputClass} uppercase`} data-testid="signup-state-input" />
                  </Field>
                </div>
                <Field label="Number of units" htmlFor="su-units">
                  <input id="su-units" type="number" min="1" placeholder="e.g. 120" value={form.units} onChange={(e) => set('units', e.target.value)} className={inputClass} data-testid="signup-units-input" />
                </Field>
              </>
            )}

            {/* ── Step 3: Security ── */}
            {step === 3 && (
              <>
                <Field label="Password" htmlFor="su-pass">
                  <div className="relative">
                    <input
                      id="su-pass"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      className={`${inputClass} pr-12`}
                      data-testid="signup-password-input"
                    />
                    <button type="button" onClick={() => setShowPass((p) => !p)} aria-label={showPass ? 'Hide password' : 'Show password'} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#717171]">
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="mt-2">
                      <div className="h-1 overflow-hidden rounded-full bg-[#ebebeb]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            strength === 'strong' ? 'w-full bg-[#34c759]' : strength === 'good' ? 'w-2/3 bg-[#ff9500]' : 'w-1/3 bg-[#ff3b30]'
                          }`}
                        />
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-[#717171]">
                        {strength === 'strong' ? 'Strong' : strength === 'good' ? 'Good' : 'Too short'}
                      </p>
                    </div>
                  )}
                </Field>
                <Field label="Confirm password" htmlFor="su-confirm">
                  <div className="relative">
                    <input
                      id="su-confirm"
                      type={showConf ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={form.confirm}
                      onChange={(e) => set('confirm', e.target.value)}
                      className={`${inputClass} pr-12`}
                      data-testid="signup-confirm-input"
                    />
                    <button type="button" onClick={() => setShowConf((p) => !p)} aria-label={showConf ? 'Hide password' : 'Show password'} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#717171]">
                      {showConf ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </Field>

                {/* Account summary */}
                <div className="rounded-[14px] border border-[#ebebeb] bg-[#f7f7f7] p-4" data-testid="signup-summary">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#717171]">Account summary</p>
                  <p className="mt-2 text-[14px] font-bold">{form.firstName} {form.lastName}</p>
                  <p className="mt-0.5 text-[13px] text-[#717171]">{form.email} · {form.jobTitle}</p>
                  <p className="mt-0.5 text-[13px] text-[#717171]">{form.propertyName} · {form.units} units · {form.city}, {form.state}</p>
                </div>
              </>
            )}

            {error && (
              <p role="alert" data-testid="signup-error" className="rounded-xl border border-[#ff3b30]/20 bg-[#ff3b30]/[0.07] p-3 text-[13px] font-medium leading-relaxed text-[#c22a20]">
                {error}
              </p>
            )}

            {/* Navigation */}
            <div className="mt-1 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setStep((s) => s - 1); setError(''); }}
                  aria-label="Previous step"
                  data-testid="signup-back-btn"
                  className="flex min-h-12 w-12 items-center justify-center rounded-xl border border-[#ebebeb] bg-[#f7f7f7] text-[#555] transition-colors hover:border-[#222]">
                  <ArrowLeft size={18} />
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                data-testid="signup-continue-btn"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#ff385c] bg-[#ff385c] px-5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(255,56,92,.25)] transition-transform hover:-translate-y-px active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:hover:translate-y-0">
                {loading
                  ? 'Creating account…'
                  : step < 3
                    ? (<>Continue <ArrowRight size={17} /></>)
                    : (<>Create account <Check size={17} strokeWidth={2.5} /></>)}
              </button>
            </div>
          </form>

          <p className="mt-7 text-center text-[12px] leading-relaxed text-[#9b9b9b]">
            By signing up you agree to our{' '}
            <span className="cursor-pointer text-[#717171] underline">Terms</span> and{' '}
            <span className="cursor-pointer text-[#717171] underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
