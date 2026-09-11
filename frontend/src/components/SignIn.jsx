import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';
import { authApi, classifyAuthError } from '../services/authApi';

const ACCENT = '#FF385C';

const ROLES = [
  { label: 'Concierge', value: UserRole.CONCIERGE },
  { label: 'Manager', value: UserRole.MANAGER },
];

export const SignIn = ({ onSignIn, onGoToSignUp, onForgotPassword, onBack }) => {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(UserRole.CONCIERGE);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Enter your password.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setError('Check the highlighted fields.'); return; }
    setError('');
    setLoading(true);
    try {
      const apiRole = role === UserRole.MANAGER ? 'manager' : 'concierge';
      const user = await authApi.signIn(apiRole, form.email, form.password);
      onSignIn(role, user);
    } catch (err) {
      setError(classifyAuthError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-[100dvh] bg-white text-[#222]"
      style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* ── Left — editorial narrative (desktop only) ─────────────────────── */}
      <aside className="hidden w-[42%] shrink-0 flex-col justify-between bg-[#0b0b0b] p-12 text-white lg:flex" aria-hidden="true">
        <button onClick={onBack} className="self-start text-left text-[12px] font-extrabold uppercase tracking-[0.24em] text-white" data-testid="signin-brand-back">
          ✦ Noted
        </button>

        <div>
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-9 bg-[#ff385c]" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/55">Welcome back</p>
          </div>
          <h1 className="mt-7 text-[52px] font-extrabold leading-[0.92] tracking-[-0.05em] xl:text-[64px]">
            Good to see<br />you again.
          </h1>
          <p className="mt-6 max-w-[340px] text-[14px] leading-[1.75] text-white/50">
            Sign in to access your property shift dashboard, review open tasks, and manage your team.
          </p>
        </div>

        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">Built for</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {['Property Managers', 'Concierge Staff'].map((t) => (
              <span key={t} className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-[12px] font-semibold text-white/60">
                {t}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right — form ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-10 sm:items-center md:px-16 md:py-12">
        <div className="w-full max-w-[420px]">

          <button onClick={onBack} className="mb-10 flex min-h-11 items-center text-[12px] font-extrabold uppercase tracking-[0.24em] text-[#222] lg:hidden" data-testid="signin-mobile-back">
            ✦ Noted
          </button>

          <div className="flex items-center gap-3">
            <span className="h-0.5 w-9 bg-[#ff385c]" aria-hidden="true" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-black/55">Sign in</p>
          </div>
          <h2 className="mt-5 text-[38px] font-extrabold leading-[0.97] tracking-[-0.04em] sm:text-[44px]" data-testid="signin-heading">
            Sign in
          </h2>

          <p className="mt-3 min-h-[22px] text-[14px] leading-relaxed text-[#717171]">
            {role === UserRole.MANAGER ? (
              <>
                Don't have an account?{' '}
                <button onClick={onGoToSignUp} className="font-bold text-[#ff385c]" data-testid="go-to-signup-btn">
                  Sign up
                </button>
              </>
            ) : (
              <span>Contact your property manager to get access.</span>
            )}
          </p>

          {/* Role selector */}
          <fieldset className="mt-8">
            <legend className="mb-2 block text-[13px] font-semibold text-[#222]">I am a</legend>
            <div className="flex gap-2.5" role="group">
              {ROLES.map(({ label, value }) => {
                const active = role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setRole(value); setError(''); }}
                    aria-pressed={active}
                    data-testid={`role-${label.toLowerCase()}-btn`}
                    className={`min-h-11 flex-1 rounded-xl border px-3 text-[14px] font-bold transition-colors ${
                      active
                        ? 'border-[#222] bg-[#222] text-white'
                        : 'border-[#ebebeb] bg-[#f7f7f7] text-[#717171] hover:border-[#222]'
                    }`}>
                    {label}
                  </button>
                );
              })}
            </div>
            {role === UserRole.CONCIERGE && (
              <p className="mt-2.5 text-[12px] leading-relaxed text-[#717171]">
                Your login credentials were set up by your property manager.
              </p>
            )}
          </fieldset>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5" noValidate>
            <div>
              <label htmlFor="signin-email" className="mb-1.5 block text-[13px] font-semibold">Email address</label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setFieldErrors((p) => ({ ...p, email: '' })); }}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'signin-email-error' : undefined}
                data-testid="signin-email-input"
                className="min-h-12 w-full rounded-xl border border-[#ebebeb] bg-[#f7f7f7] px-4 text-base text-[#222] placeholder:text-[#9b9b9b] focus:border-[#ff385c] focus:outline-none"
              />
              {fieldErrors.email && <p id="signin-email-error" className="mt-1.5 text-[12px] font-semibold text-[#c22a20]">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="signin-password" className="text-[13px] font-semibold">Password</label>
                <button type="button" onClick={onForgotPassword} className="min-h-11 px-1 text-[12px] font-bold text-[#ff385c]">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setFieldErrors((p) => ({ ...p, password: '' })); }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'signin-password-error' : undefined}
                  data-testid="signin-password-input"
                  className="min-h-12 w-full rounded-xl border border-[#ebebeb] bg-[#f7f7f7] px-4 pr-12 text-base text-[#222] placeholder:text-[#9b9b9b] focus:border-[#ff385c] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#717171]">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && <p id="signin-password-error" className="mt-1.5 text-[12px] font-semibold text-[#c22a20]">{fieldErrors.password}</p>}
            </div>

            {error && (
              <p role="alert" data-testid="signin-error" className="rounded-xl border border-[#ff3b30]/20 bg-[#ff3b30]/[0.07] p-3 text-[13px] font-medium leading-relaxed text-[#c22a20]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="signin-submit-btn"
              className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#ff385c] bg-[#ff385c] px-5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(255,56,92,.25)] transition-transform hover:-translate-y-px active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:hover:translate-y-0"
              style={{ borderColor: ACCENT }}>
              {loading ? 'Signing in…' : (<>Sign in <ArrowRight size={17} /></>)}
            </button>
          </form>

          <p className="mt-8 text-center text-[12px] leading-relaxed text-[#9b9b9b]">
            By signing in you agree to our{' '}
            <span className="cursor-pointer text-[#717171] underline">Terms</span> and{' '}
            <span className="cursor-pointer text-[#717171] underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
