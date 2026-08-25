import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Calendar, Activity, FileCheck, Check, ShieldCheck, ListChecks, Users, Quote, Building2 } from 'lucide-react';
import { UserRole } from '../types';

// ── Content (preserved from the original product copy) ──────────────────────

const FEATURES = [
  {
    Icon: FileCheck,
    num: '01',
    title: 'Shift Verification',
    desc: 'Every task completed on shift is timestamped and photo-verified. Know exactly what happened, when, and by whom — before the next person walks in.',
  },
  {
    Icon: Activity,
    num: '02',
    title: 'Incident Documentation',
    desc: 'Structured incident reports with photo evidence, severity levels, and automatic escalation. No more verbal reports that disappear after a shift change.',
  },
  {
    Icon: Calendar,
    num: '03',
    title: 'Handoff Continuity',
    desc: 'Incoming staff read a structured briefing the moment they clock in. Open issues, unresolved incidents, and notes from the previous shift — all in one place.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Set up your property',
    desc: 'Add your building, create staff accounts for your team and vendors, and configure shift tasks in minutes.',
  },
  {
    num: '02',
    title: 'Run shifts on the desk tablet',
    desc: 'Each concierge logs in at shift start, completes tasks with photo evidence, files incidents, and submits a handoff before clocking out.',
  },
  {
    num: '03',
    title: 'Management sees everything',
    desc: 'Property managers and vendor supervisors review shifts, close incidents, and track staff performance from any device — in real time.',
  },
];

const ROLES = [
  {
    name: 'Concierge',
    tagline: 'Run your shift with confidence.',
    desc: 'Shift tasks, incident reports, building status, and handoff notes — everything you need at the front desk, on a shared property tablet.',
    userRole: UserRole.CONCIERGE,
  },
  {
    name: 'Management',
    tagline: 'Full visibility. Total control.',
    desc: 'Live building overview, shift history, incident management, and staff accountability — for property managers and head concierge.',
    userRole: UserRole.MANAGER,
  },
  {
    name: 'Vendor',
    tagline: 'Your staff. Every property.',
    desc: "Cross-property view of your team's shifts, task completion, and incidents. Built for concierge, cleaning, and security companies.",
    userRole: UserRole.ENTERPRISE,
  },
];

const BENEFITS = [
  {
    title: 'Built for deskless workers',
    desc: 'Designed for the front desk tablet. Fast, photo-first, and usable on a first shift with zero training.',
  },
  {
    title: 'Eliminates verbal handoffs',
    desc: 'Incoming staff read a structured shift briefing at login. No phone calls, no WhatsApp chains, no memory lapses.',
  },
  {
    title: 'Multi-vendor accountability',
    desc: 'Third-party staff log in with individual credentials on the property device. Every action is attributed, timestamped, and auditable.',
  },
  {
    title: 'Management visibility everywhere',
    desc: 'Property managers and vendor supervisors monitor activity from any device, in real time, without being on-site.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Before Notes, our night shift team had no idea what happened during the day. Now they read a full briefing the moment they clock in. Incidents that used to escalate quietly are caught before the next shift starts.',
    name: 'George A.',
    role: 'Head Concierge · Greystar',
  },
  {
    quote: "As a property manager I was always the last to know. Now I get a real-time feed of every incident and every shift from my phone. I don't have to chase anyone for updates anymore.",
    name: 'Sarah T.',
    role: 'Property Manager · Bozzuto',
  },
  {
    quote: "We manage 60 properties worth of concierge coverage. Notes gives us one view of every one of our staff members — who's on shift, what they did, and where issues happened. It's completely changed how we manage contracts.",
    name: 'Paul W.',
    role: 'Operations Manager · Maverick Concierge',
  },
];

const PLANS = [
  {
    name: 'Property',
    price: '$99',
    period: '/mo',
    desc: 'One property, unlimited staff logins.',
    features: ['1 property / building', 'Unlimited concierge logins', 'Shift tasks & incident reports', 'Shift handoff system', 'Management portal access'],
    featured: false,
    cta: 'Get Started',
  },
  {
    name: 'Portfolio',
    price: '$249',
    period: '/mo',
    desc: 'For operators managing multiple buildings.',
    features: ['Up to 10 properties', 'All Property features', 'Cross-property dashboard', 'Vendor portal access', 'AI shift summaries', 'Priority support'],
    featured: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large operators and vendor companies.',
    features: ['Unlimited properties', 'Vendor company portal', 'Analytics & reporting', 'API access', 'SSO & audit exports', 'Dedicated account manager'],
    featured: false,
    cta: 'Contact Sales',
  },
];

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Process', href: '#process' },
  { label: 'Roles', href: '#roles' },
  { label: 'Pricing', href: '#pricing' },
];

// ── Shared building blocks ───────────────────────────────────────────────────

const Eyebrow = ({ children, tone = 'light' }) => (
  <div className="flex items-center gap-3">
    <span className="h-0.5 w-9 bg-[#ff385c]" aria-hidden="true" />
    <p className={`text-[10px] font-extrabold uppercase tracking-[0.24em] ${tone === 'dark' ? 'text-white/55' : 'text-black/55'}`}>
      {children}
    </p>
  </div>
);

/* Section intro — icon + bold title + helper text (reference: "Unit operations" block) */
const SectionIntro = ({ Icon, title, helper, tone = 'light', id }) => (
  <div>
    <div className="flex items-center gap-3.5">
      <Icon size={30} strokeWidth={2.2} className="shrink-0 text-[#ff385c]" aria-hidden="true" />
      <h2 id={id} className="text-[30px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[38px]">{title}</h2>
    </div>
    <p className={`mt-4 max-w-[560px] text-[15px] leading-[1.65] md:text-[16px] ${tone === 'dark' ? 'text-white/55' : 'text-[#717171]'}`}>
      {helper}
    </p>
  </div>
);

const useReveal = () => {
  const reduceMotion = useReducedMotion();
  return reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-10%' },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      };
};

// ── Component ────────────────────────────────────────────────────────────────

export const LandingPage = ({ onGetStarted, onSignIn, onSignUp }) => {
  const reveal = useReveal();

  return (
    <div className="bg-white font-sans text-[#222222]" style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* ══ Header ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-[#ebebeb] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[88px] w-full max-w-[1280px] items-center justify-between gap-6 px-4 md:px-6">
          <a href="#top" className="flex min-h-11 items-center text-[24px] font-extrabold tracking-[-0.03em] text-[#222]" data-testid="brand-link">
            Notes
          </a>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="flex min-h-11 items-center rounded-2xl px-5 py-3 text-[16px] font-semibold text-[#6b7280] transition-colors hover:bg-[#f2f2f2] hover:text-[#222]">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 rounded-full border border-[#ebebeb] bg-white py-1.5 pl-5 pr-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <button
              onClick={onSignIn}
              data-testid="header-signin-btn"
              className="flex min-h-10 items-center text-[15px] font-bold text-[#222] transition-opacity hover:opacity-70">
              Sign in
            </button>
            <button
              onClick={onSignUp}
              data-testid="header-signup-btn"
              className="ml-2 flex min-h-10 items-center rounded-full bg-[#222] px-5 text-[14px] font-bold text-white transition-opacity hover:opacity-85">
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main id="top">

        {/* ══ Hero — text-led editorial opening ══════════════════════════════ */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-28" aria-labelledby="hero-heading">
          <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
            <motion.div {...reveal}>
              <Eyebrow>Workforce operations</Eyebrow>
              <h1
                id="hero-heading"
                data-testid="hero-heading"
                className="mt-7 max-w-[1120px] text-[52px] font-extrabold leading-[0.9] tracking-[-0.055em] sm:text-[76px] md:text-[96px] lg:text-[112px]">
                Every shift.<br /><span className="text-[#ff385c]">On the record.</span>
              </h1>

              <div className="mt-12 grid gap-10 border-t border-[#ebebeb] pt-10 md:mt-16 md:grid-cols-[1.25fr_0.75fr] md:gap-20 md:pt-12">
                <p className="max-w-[720px] text-[20px] font-bold leading-[1.25] tracking-[-0.02em] text-[#222] sm:text-[24px] md:text-[28px]">
                  Real-time workforce operations and accountability for property management, concierge services, cleaning, security, and hospitality teams.
                </p>
                <div>
                  <p className="max-w-[420px] text-[14px] leading-[1.7] text-[#717171]">
                    Verbal handoffs disappear. Notes replaces them with verified tasks, structured incidents, and briefings your next shift actually reads.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onGetStarted(UserRole.CAREGIVER)}
                      data-testid="hero-get-started-btn"
                      className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff385c] px-6 text-[14px] font-bold text-white shadow-[0_8px_24px_rgba(255,56,92,.25)] transition-transform hover:-translate-y-px active:scale-[.97]">
                      Get started <ArrowRight size={16} />
                    </button>
                    <a
                      href="#process"
                      className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#ebebeb] bg-[#f7f7f7] px-6 text-[14px] font-bold text-[#222] transition-colors hover:border-[#222]">
                      See how it works
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ Product — numbered editorial rows ══════════════════════════════ */}
        <section id="product" className="pb-20 md:pb-28" aria-labelledby="product-heading">
          <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
            <motion.div {...reveal}>
              <div className="flex items-center justify-between gap-6 border-b border-[#ebebeb] pb-5">
                <Eyebrow>What it does</Eyebrow>
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 sm:block">Three systems, one desk</p>
              </div>
              <div className="grid gap-12 pt-10 md:grid-cols-[0.9fr_1.1fr] md:gap-20 md:pt-14">
                <SectionIntro
                  Icon={ShieldCheck}
                  id="product-heading"
                  title="Proof, not promises."
                  helper="Every action on shift is verified, timestamped, and attributed — photo evidence on tasks, structured incidents, and handoffs the next shift actually reads."
                />
                <ol className="border-t border-[#ebebeb]">
                  {FEATURES.map(({ Icon, num, title, desc }) => (
                    <li key={num} className="grid gap-4 border-b border-[#ebebeb] py-7 sm:grid-cols-[44px_0.7fr_1.3fr] sm:gap-6">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(255,56,92,0.08)] text-[#ff385c]" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      <div>
                        <span className="text-[11px] font-extrabold text-[#ff385c]">{num}</span>
                        <h3 className="mt-1 text-[18px] font-extrabold leading-tight tracking-[-0.02em]">{title}</h3>
                      </div>
                      <p className="text-[13px] leading-relaxed text-[#717171] md:text-[14px]">{desc}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ Process — warm chapter ═════════════════════════════════════════ */}
        <section id="process" className="bg-[#f2f1ee] py-20 text-[#171717] md:py-28" aria-labelledby="process-heading">
          <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
            <motion.div {...reveal}>
              <div className="flex items-center justify-between gap-6 border-b border-black/20 pb-5">
                <Eyebrow>The process</Eyebrow>
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 sm:block">Set up once, run every day</p>
              </div>
              <div className="grid gap-12 pt-10 md:grid-cols-[0.9fr_1.1fr] md:gap-20 md:pt-14">
                <div>
                  <SectionIntro
                    Icon={ListChecks}
                    id="process-heading"
                    title={<>Complex buildings.<br />A calm routine.</>}
                    helper="From first login to management review, one guided flow carries every task, incident, and handoff through the day."
                  />
                  <button
                    onClick={() => onGetStarted(UserRole.CAREGIVER)}
                    data-testid="process-cta-btn"
                    className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-black px-6 text-[13px] font-bold text-white transition-transform hover:-translate-y-px active:scale-[.97]">
                    Start your setup <ArrowRight size={16} />
                  </button>
                </div>
                <ol className="border-t border-black/20">
                  {STEPS.map(({ num, title, desc }) => (
                    <li key={num} className="grid gap-4 border-b border-black/20 py-7 sm:grid-cols-[48px_0.7fr_1.3fr] sm:gap-6">
                      <span className="text-[11px] font-extrabold text-[#ff385c]">{num}</span>
                      <h3 className="text-[18px] font-extrabold leading-tight tracking-[-0.02em]">{title}</h3>
                      <p className="text-[13px] leading-relaxed text-black/55 md:text-[14px]">{desc}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ Roles — near-black chapter ═════════════════════════════════════ */}
        <section id="roles" className="bg-[#0b0b0b] py-20 text-white md:py-28" aria-labelledby="roles-heading">
          <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
            <motion.div {...reveal}>
              <div className="flex items-center justify-between gap-6 border-b border-white/15 pb-5">
                <Eyebrow tone="dark">Built for every role</Eyebrow>
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 sm:block">One record, three views</p>
              </div>

              <div className="mt-10 md:mt-14">
                <SectionIntro
                  Icon={Users}
                  id="roles-heading"
                  tone="dark"
                  title="The same shift, seen from every side."
                  helper="One shared record with three tailored views — front desk, property management, and vendor supervision."
                />
              </div>

              <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
                {ROLES.map(({ name, tagline, desc, userRole }) => (
                  <article key={name} className="flex flex-col rounded-[20px] border border-white/12 bg-[#171717] p-6 md:p-7" data-testid={`role-card-${name.toLowerCase()}`}>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#ff385c]">{name}</p>
                    <h3 className="mt-4 text-[24px] font-extrabold leading-[1.05] tracking-[-0.03em]">{tagline}</h3>
                    <p className="mt-4 flex-1 text-[13px] leading-relaxed text-white/55">{desc}</p>
                    <button
                      onClick={() => onGetStarted(userRole)}
                      className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-white px-5 text-[13px] font-bold text-[#111] transition-transform hover:-translate-y-px active:scale-[.97]">
                      Enter as {name} <ArrowUpRight size={15} />
                    </button>
                  </article>
                ))}
              </div>

              {/* Benefits — numbered rows on dark */}
              <ol className="mt-16 border-t border-white/15 md:mt-20">
                {BENEFITS.map(({ title, desc }, index) => (
                  <li key={title} className="grid gap-3 border-b border-white/15 py-6 sm:grid-cols-[48px_0.8fr_1.2fr] sm:gap-6">
                    <span className="text-[11px] font-extrabold text-[#ff385c]">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="text-[16px] font-extrabold leading-tight tracking-[-0.02em]">{title}</h3>
                    <p className="text-[13px] leading-relaxed text-white/50">{desc}</p>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </section>

        {/* ══ Testimonials — white editorial quotes ══════════════════════════ */}
        <section className="py-20 md:py-28" aria-labelledby="testimonials-heading">
          <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
            <motion.div {...reveal}>
              <div className="border-b border-[#ebebeb] pb-5">
                <Eyebrow>From the front desk</Eyebrow>
              </div>
              <div className="pt-10 md:pt-14">
                <SectionIntro
                  Icon={Quote}
                  id="testimonials-heading"
                  title="Operators on Notes."
                  helper="Concierge leads, property managers, and vendor operators on what changed at their desks."
                />
              </div>
              <div className="grid gap-0 pt-4 md:grid-cols-3 md:gap-10 md:pt-12">
                {TESTIMONIALS.map(({ quote, name, role }) => (
                  <figure key={name} className="border-b border-[#ebebeb] py-8 md:border-b-0 md:py-0">
                    <blockquote className="text-[15px] font-semibold leading-[1.6] tracking-[-0.01em] text-[#222]">
                      “{quote}”
                    </blockquote>
                    <figcaption className="mt-6">
                      <p className="text-[13px] font-extrabold">{name}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#717171]">{role}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ Pricing — warm chapter ═════════════════════════════════════════ */}
        <section id="pricing" className="bg-[#f2f1ee] py-20 text-[#171717] md:py-28" aria-labelledby="pricing-heading">
          <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
            <motion.div {...reveal}>
              <div className="flex items-center justify-between gap-6 border-b border-black/20 pb-5">
                <Eyebrow>Pricing</Eyebrow>
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 sm:block">Simple, per-property plans</p>
              </div>
              <div className="mt-10 md:mt-14">
                <SectionIntro
                  Icon={Building2}
                  id="pricing-heading"
                  title={<>Pay for buildings,<br />not seats.</>}
                  helper="Simple per-property plans with unlimited staff logins — pricing that scales with your portfolio, not your headcount."
                />
              </div>

              <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
                {PLANS.map(({ name, price, period, desc, features, featured, cta }) => (
                  <article
                    key={name}
                    data-testid={`plan-card-${name.toLowerCase()}`}
                    className={`flex flex-col rounded-[20px] border p-6 md:p-7 ${
                      featured
                        ? 'border-[#0b0b0b] bg-[#0b0b0b] text-white'
                        : 'border-black/15 bg-white text-[#171717]'
                    }`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${featured ? 'text-[#ff385c]' : 'text-black/45'}`}>{name}</p>
                      {featured && (
                        <span className="rounded-full border border-[#ff385c]/30 bg-[#ff385c]/10 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#ff385c]">
                          Most popular
                        </span>
                      )}
                    </div>
                    <p className="mt-5 flex items-baseline gap-1">
                      <span className="text-[40px] font-extrabold leading-none tracking-[-0.04em]">{price}</span>
                      {period && <span className={`text-[13px] font-semibold ${featured ? 'text-white/50' : 'text-black/45'}`}>{period}</span>}
                    </p>
                    <p className={`mt-3 text-[13px] leading-relaxed ${featured ? 'text-white/55' : 'text-black/55'}`}>{desc}</p>
                    <ul className={`mt-6 flex-1 space-y-3 border-t pt-6 ${featured ? 'border-white/15' : 'border-black/10'}`}>
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-[13px] font-medium">
                          <Check size={15} className="mt-0.5 shrink-0 text-[#34c759]" aria-hidden="true" />
                          <span className={featured ? 'text-white/80' : 'text-black/70'}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => onGetStarted(UserRole.CAREGIVER)}
                      className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-bold transition-transform hover:-translate-y-px active:scale-[.97] ${
                        featured
                          ? 'bg-[#ff385c] text-white shadow-[0_8px_24px_rgba(255,56,92,.25)]'
                          : 'bg-[#171717] text-white'
                      }`}>
                      {cta} <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ══ Footer — conversion + compact dark footer ════════════════════════ */}
      <footer className="bg-[#0b0b0b] pb-10 pt-20 text-white md:pt-28">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
          <Eyebrow tone="dark">Get started</Eyebrow>
          <h2 className="mt-7 max-w-[980px] text-[44px] font-extrabold leading-[0.9] tracking-[-0.05em] sm:text-[64px] md:text-[84px]">
            Put your next shift on the record.
          </h2>
          <button
            onClick={() => onGetStarted(UserRole.CAREGIVER)}
            data-testid="footer-cta-btn"
            className="mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff385c] px-7 text-[14px] font-bold text-white transition-transform hover:-translate-y-px active:scale-[.97]">
            Get started free <ArrowRight size={16} />
          </button>

          <div className="mt-16 grid gap-10 border-t border-white/15 pt-10 md:mt-20 md:grid-cols-[1fr_auto_auto] md:gap-20">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.24em]">✦ Notes</p>
              <p className="mt-3 max-w-[360px] text-[13px] leading-relaxed text-white/45">
                Workforce operations and accountability for property, concierge, cleaning, security, and hospitality teams.
              </p>
            </div>
            <nav aria-label="Footer">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">Product</p>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} className="text-[13px] font-semibold text-white/60 transition-colors hover:text-white">{label}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">Account</p>
              <ul className="mt-4 space-y-2.5">
                <li><button onClick={onSignIn} className="text-[13px] font-semibold text-white/60 transition-colors hover:text-white">Sign in</button></li>
                <li><button onClick={onSignUp} className="text-[13px] font-semibold text-white/60 transition-colors hover:text-white">Create account</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">onepermit</p>
            <p className="text-[11px] text-white/35">© {new Date().getFullYear()} Notes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
