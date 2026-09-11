import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { authApi, classifyAuthError } from '../services/authApi';

const inputClass =
  'min-h-12 w-full rounded-xl border border-[#ebebeb] bg-[#f7f7f7] px-4 pr-12 text-base text-[#222] placeholder:text-[#9b9b9b] focus:border-[#ff385c] focus:outline-none';

const buttonClass =
  'mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#ff385c] bg-[#ff385c] px-5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(255,56,92,.25)] transition-transform hover:-translate-y-px active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:hover:translate-y-0';

const linkClass =
  'mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#222] px-6 text-[14px] font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff385c]';

const Field = ({ label, htmlFor, error, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold">{label}</label>
    {children}
    {error && <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-[12px] font-semibold text-[#c22a20]">{error}</p>}
  </div>
);

function PasswordInput({ id, value, onChange, error, autoComplete, placeholder, testId }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        data-testid={testId}
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#717171]">
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function ErrorBanner({ message, testId }) {
  if (!message) return null;
  return (
    <p role="alert" data-testid={testId} className="rounded-xl border border-[#ff3b30]/20 bg-[#ff3b30]/[0.07] p-3 text-[13px] font-medium leading-relaxed text-[#c22a20]">
      {message}
    </p>
  );
}

function Shell({ eyebrow, icon: Icon, title, children }) {
  return (
    <main className="min-h-[100dvh] bg-[#f2f1ee] px-4 py-4 text-[#222] sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100dvh-2rem)] max-w-[1280px] overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(15,15,15,.08)] lg:grid-cols-[.9fr_1.1fr] sm:min-h-[calc(100dvh-3rem)]">
        <section className="flex min-h-[260px] flex-col justify-between bg-[#0b0b0b] p-7 text-white sm:p-10 lg:min-h-0 lg:p-14">
          <Link to="/" className="text-[13px] font-extrabold uppercase tracking-[.22em]">✦ Noted</Link>
          <div className="mt-16 lg:mt-0">
            <p className="text-[11px] font-bold uppercase tracking-[.22em] text-white/50">Property knowledge, protected</p>
            <p className="mt-5 max-w-md text-[34px] font-extrabold leading-[1.02] tracking-[-.045em] sm:text-[48px]">Access should always be clear and trustworthy.</p>
          </div>
        </section>
        <section className="flex items-center px-7 py-12 sm:px-12 lg:px-20">
          <div className="w-full max-w-[440px]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f3] text-[#ff385c]"><Icon size={22} /></span>
            <p className="mt-8 text-[11px] font-extrabold uppercase tracking-[.22em] text-[#ff385c]">{eyebrow}</p>
            <h1 className="mt-3 text-[32px] font-extrabold leading-[1.05] tracking-[-.045em] sm:text-[40px]">{title}</h1>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

// ── Forgot password ──────────────────────────────────────────────────────────

function ForgotPasswordPanel() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('form'); // form | loading | submitted

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setFieldError('Enter a valid email address.'); return; }
    setFieldError(''); setError(''); setStatus('loading');
    try {
      await authApi.requestPasswordReset(email.trim().toLowerCase());
      setStatus('submitted');
    } catch (err) {
      setStatus('form');
      setError(classifyAuthError(err).message);
    }
  };

  if (status === 'submitted') {
    return (
      <Shell eyebrow="Password recovery" icon={Mail} title="Check your email.">
        <p className="mt-5 text-[15px] leading-7 text-[#717171]">
          If an account exists for <strong>{email}</strong>, we've sent instructions to reset the password. The link expires in 45 minutes.
        </p>
        <div role="status" data-testid="forgot-submitted" className="mt-7 rounded-2xl border border-[#ebebeb] bg-[#f7f7f7] p-5 text-[13px] leading-6 text-[#555]">
          Didn't get it? Check spam, or confirm this is the email you signed up with.
        </div>
        <Link to="/login" className={linkClass}><ArrowLeft size={17} /> Return to sign in</Link>
      </Shell>
    );
  }

  return (
    <Shell eyebrow="Password recovery" icon={Mail} title="Forgot your password?">
      <p className="mt-5 text-[15px] leading-7 text-[#717171]">Enter the email on your account and we'll send a link to reset your password.</p>
      <form onSubmit={submit} className="mt-7 flex flex-col gap-5" noValidate>
        <Field label="Email address" htmlFor="forgot-email" error={fieldError}>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
            aria-invalid={!!fieldError}
            aria-describedby={fieldError ? 'forgot-email-error' : undefined}
            data-testid="forgot-email-input"
            className="min-h-12 w-full rounded-xl border border-[#ebebeb] bg-[#f7f7f7] px-4 text-base text-[#222] placeholder:text-[#9b9b9b] focus:border-[#ff385c] focus:outline-none"
          />
        </Field>
        <ErrorBanner message={error} testId="forgot-error" />
        <button type="submit" disabled={status === 'loading'} data-testid="forgot-submit-btn" className={buttonClass}>
          {status === 'loading' ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <Link to="/login" className={linkClass}><ArrowLeft size={17} /> Return to sign in</Link>
    </Shell>
  );
}

// ── Reset password ───────────────────────────────────────────────────────────

function ResetPasswordPanel() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [status, setStatus] = useState(token ? 'form' : 'invalid'); // form | loading | success | invalid

  const submit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (password.length < 8) errors.password = 'Use at least 8 characters.';
    if (!confirm) errors.confirm = 'Confirm your new password.';
    else if (password !== confirm) errors.confirm = 'Passwords do not match.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setError(''); setStatus('loading');
    try {
      await authApi.resetPassword(token, password);
      setStatus('success');
    } catch (err) {
      if (err?.response?.status === 400) {
        setStatus('invalid');
      } else {
        setStatus('form');
        setError(classifyAuthError(err).message);
      }
    }
  };

  if (status === 'invalid') {
    return (
      <Shell eyebrow="Reset password" icon={Clock3} title="This reset link can't be used.">
        <p className="mt-5 text-[15px] leading-7 text-[#717171]">
          It's invalid, expired, or has already been used — reset links work once and expire after 45 minutes.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link to="/forgot-password" data-testid="reset-request-new-link" className={linkClass}>Request a new link</Link>
        </div>
      </Shell>
    );
  }

  if (status === 'success') {
    return (
      <Shell eyebrow="Reset password" icon={CheckCircle2} title="Password updated.">
        <p className="mt-5 text-[15px] leading-7 text-[#717171]" data-testid="reset-success">
          Your password has been reset and you've been signed out everywhere else. Sign in with your new password.
        </p>
        <Link to="/login" className={linkClass}><ArrowLeft size={17} /> Continue to sign in</Link>
      </Shell>
    );
  }

  return (
    <Shell eyebrow="Reset password" icon={KeyRound} title="Choose a new password.">
      <form onSubmit={submit} className="mt-7 flex flex-col gap-5" noValidate>
        <Field label="New password" htmlFor="reset-password" error={fieldErrors.password}>
          <PasswordInput
            id="reset-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
            error={fieldErrors.password}
            testId="reset-password-input"
          />
        </Field>
        <Field label="Confirm new password" htmlFor="reset-confirm" error={fieldErrors.confirm}>
          <PasswordInput
            id="reset-confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setFieldErrors((p) => ({ ...p, confirm: '' })); }}
            error={fieldErrors.confirm}
            testId="reset-confirm-input"
          />
        </Field>
        <ErrorBanner message={error} testId="reset-error" />
        <button type="submit" disabled={status === 'loading'} data-testid="reset-submit-btn" className={buttonClass}>
          {status === 'loading' ? 'Updating…' : 'Reset password'}
        </button>
      </form>
    </Shell>
  );
}

// ── Invitation ────────────────────────────────────────────────────────────────

const INVITE_UNUSABLE = {
  expired: { eyebrow: 'Invitation expired', icon: Clock3, title: 'This invitation has expired.', copy: 'Ask your property manager to send a new invitation.' },
  used:    { eyebrow: 'Invitation used', icon: ShieldAlert, title: 'This invitation was already used.', copy: 'Looks like this account is already set up — sign in instead.' },
  invalid: { eyebrow: 'Invitation unavailable', icon: ShieldAlert, title: 'This invitation link is not valid.', copy: 'Ask your property manager to confirm your invitation and resend it.' },
};

function InvitePanel() {
  const { token } = useParams();
  const [state, setState] = useState('loading'); // loading | valid | expired | used | invalid | accepted
  const [invitation, setInvitation] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await authApi.verifyInvitation(token);
        if (!cancelled) { setInvitation(data); setState('valid'); }
      } catch (err) {
        if (cancelled) return;
        const kind = classifyAuthError(err).kind;
        setState(kind === 'expired' || kind === 'used' ? kind : 'invalid');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (password.length < 8) errors.password = 'Use at least 8 characters.';
    if (!confirm) errors.confirm = 'Confirm your password.';
    else if (password !== confirm) errors.confirm = 'Passwords do not match.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setError(''); setSubmitting(true);
    try {
      await authApi.acceptInvitation(token, password);
      setState('accepted');
    } catch (err) {
      setError(classifyAuthError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (state === 'loading') {
    return (
      <Shell eyebrow="Invitation" icon={Loader2} title="Checking your invitation…">
        <p className="mt-5 text-[15px] leading-7 text-[#717171]" data-testid="invite-loading">One moment.</p>
      </Shell>
    );
  }

  if (state === 'expired' || state === 'used' || state === 'invalid') {
    const item = INVITE_UNUSABLE[state];
    return (
      <Shell eyebrow={item.eyebrow} icon={item.icon} title={item.title}>
        <p className="mt-5 text-[15px] leading-7 text-[#717171]" data-testid={`invite-${state}`}>{item.copy}</p>
        <Link to="/login" className={linkClass}><ArrowLeft size={17} /> Return to sign in</Link>
      </Shell>
    );
  }

  if (state === 'accepted') {
    return (
      <Shell eyebrow="Welcome" icon={CheckCircle2} title="Your account is ready.">
        <p className="mt-5 text-[15px] leading-7 text-[#717171]" data-testid="invite-accepted">
          Sign in with the email and password you just set to get started.
        </p>
        <Link to="/login" className={linkClass}><ArrowLeft size={17} /> Continue to sign in</Link>
      </Shell>
    );
  }

  return (
    <Shell eyebrow="Invitation" icon={KeyRound} title={`Welcome, ${invitation.name || invitation.email}.`}>
      <p className="mt-5 text-[15px] leading-7 text-[#717171]">
        You've been invited to join <strong>{invitation.property_name}</strong> as a concierge. Set a password to activate your account.
      </p>
      <form onSubmit={submit} className="mt-7 flex flex-col gap-5" noValidate>
        <Field label="Password" htmlFor="invite-password" error={fieldErrors.password}>
          <PasswordInput
            id="invite-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
            error={fieldErrors.password}
            testId="invite-password-input"
          />
        </Field>
        <Field label="Confirm password" htmlFor="invite-confirm" error={fieldErrors.confirm}>
          <PasswordInput
            id="invite-confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setFieldErrors((p) => ({ ...p, confirm: '' })); }}
            error={fieldErrors.confirm}
            testId="invite-confirm-input"
          />
        </Field>
        <ErrorBanner message={error} testId="invite-error" />
        <button type="submit" disabled={submitting} data-testid="invite-submit-btn" className={buttonClass}>
          {submitting ? 'Activating…' : 'Activate account'}
        </button>
      </form>
    </Shell>
  );
}

export function AuthSupportPage({ mode }) {
  if (mode === 'reset') return <ResetPasswordPanel />;
  if (mode === 'invite') return <InvitePanel />;
  return <ForgotPasswordPanel />;
}

export default AuthSupportPage;
