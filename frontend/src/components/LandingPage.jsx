import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, Activity, FileCheck, Check, Quote } from 'lucide-react';
import { UserRole } from '../types';

// ── Carousel data ─────────────────────────────────────────────────────────────

const IMAGES = [
  {
    src: 'https://static.vecteezy.com/system/resources/thumbnails/055/330/473/large/a-cartoon-female-hotel-worker-stands-confidently-png.png',
    bg: '#F4845F',
    centerScale: 1.20,
  },
  {
    src: 'https://static.vecteezy.com/system/resources/thumbnails/060/767/298/large/a-man-in-a-red-uniform-likely-a-concierge-or-attendant-png.png',
    bg: '#C4822A',
    centerScale: 1.20,
  },
  {
    // ★ security guard, green bg
    src: 'https://static.vecteezy.com/system/resources/thumbnails/060/815/482/large/a-friendly-cartoon-depiction-of-a-security-guard-in-uniform-png.png',
    bg: '#6BBF7A',
    centerScale: 1.60,
  },
  {
    src: 'https://static.vecteezy.com/system/resources/thumbnails/060/762/064/large/a-female-employee-in-a-navy-blue-professional-uniform-png.png',
    bg: '#1C2B4A',
    centerScale: 1.20,
  },
];

// ── Below-fold content data ───────────────────────────────────────────────────


const FEATURES = [
  {
    Icon: FileCheck,
    title: 'Shift Verification',
    desc: 'Every task completed on shift is timestamped and photo-verified. Know exactly what happened, when, and by whom — before the next person walks in.',
    accent: '#F4845F',
  },
  {
    Icon: Activity,
    title: 'Incident Documentation',
    desc: 'Structured incident reports with photo evidence, severity levels, and automatic escalation. No more verbal reports that disappear after a shift change.',
    accent: '#6BBF7A',
  },
  {
    Icon: Calendar,
    title: 'Handoff Continuity',
    desc: 'Incoming staff read a structured briefing the moment they clock in. Open issues, unresolved incidents, and notes from the previous shift — all in one place.',
    accent: '#C4822A',
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
    name:     'Concierge',
    tagline:  'Run your shift with confidence.',
    desc:     'Shift tasks, incident reports, building status, and handoff notes — everything you need at the front desk, on a shared property tablet.',
    accent:   '#F4845F',
    userRole: UserRole.CONCIERGE,
  },
  {
    name:     'Management',
    tagline:  'Full visibility. Total control.',
    desc:     'Live building overview, shift history, incident management, and staff accountability — for property managers and head concierge.',
    accent:   '#6BBF7A',
    userRole: UserRole.MANAGER,
  },
  {
    name:     'Vendor',
    tagline:  'Your staff. Every property.',
    desc:     'Cross-property view of your team\'s shifts, task completion, and incidents. Built for concierge, cleaning, and security companies.',
    accent:   '#C4822A',
    userRole: UserRole.ENTERPRISE,
  },
];

const BENEFITS = [
  {
    title: 'Built for deskless workers',
    desc:  'Designed for the front desk tablet. Fast, photo-first, and usable on a first shift with zero training.',
  },
  {
    title: 'Eliminates verbal handoffs',
    desc:  'Incoming staff read a structured shift briefing at login. No phone calls, no WhatsApp chains, no memory lapses.',
  },
  {
    title: 'Multi-vendor accountability',
    desc:  'Third-party staff log in with individual credentials on the property device. Every action is attributed, timestamped, and auditable.',
  },
  {
    title: 'Management visibility everywhere',
    desc:  'Property managers and vendor supervisors monitor activity from any device, in real time, without being on-site.',
  },
];

const TESTIMONIALS = [
  {
    quote:  'Before Notes, our night shift team had no idea what happened during the day. Now they read a full briefing the moment they clock in. Incidents that used to escalate quietly are caught before the next shift starts.',
    name:   'George A.',
    role:   'Head Concierge · Greystar',
    accent: '#F4845F',
  },
  {
    quote:  'As a property manager I was always the last to know. Now I get a real-time feed of every incident and every shift from my phone. I don\'t have to chase anyone for updates anymore.',
    name:   'Sarah T.',
    role:   'Property Manager · Bozzuto',
    accent: '#6BBF7A',
  },
  {
    quote:  'We manage 60 properties worth of concierge coverage. Notes gives us one view of every one of our staff members — who\'s on shift, what they did, and where issues happened. It\'s completely changed how we manage contracts.',
    name:   'Paul W.',
    role:   'Operations Manager · Maverick Concierge',
    accent: '#C4822A',
  },
];

const PLANS = [
  {
    name:     'Property',
    price:    '$99',
    period:   '/mo',
    desc:     'One property, unlimited staff logins.',
    features: ['1 property / building', 'Unlimited concierge logins', 'Shift tasks & incident reports', 'Shift handoff system', 'Management portal access'],
    accent:   '#F4845F',
    featured: false,
    cta:      'Get Started',
  },
  {
    name:     'Portfolio',
    price:    '$249',
    period:   '/mo',
    desc:     'For operators managing multiple buildings.',
    features: ['Up to 10 properties', 'All Property features', 'Cross-property dashboard', 'Vendor portal access', 'AI shift summaries', 'Priority support'],
    accent:   '#6BBF7A',
    featured: true,
    cta:      'Start Free Trial',
  },
  {
    name:     'Enterprise',
    price:    'Custom',
    period:   '',
    desc:     'For large operators and vendor companies.',
    features: ['Unlimited properties', 'Vendor company portal', 'Analytics & reporting', 'API access', 'SSO & audit exports', 'Dedicated account manager'],
    accent:   '#C4822A',
    featured: false,
    cta:      'Contact Sales',
  },
];

// ── Carousel constants ────────────────────────────────────────────────────────

const EASE       = 'cubic-bezier(0.4,0,0.2,1)';
const DUR        = '650ms';
const TRANSITION = `transform ${DUR} ${EASE}, filter ${DUR} ${EASE}, opacity ${DUR} ${EASE}, left ${DUR} ${EASE}`;

// ── Component ─────────────────────────────────────────────────────────────────

export const LandingPage = ({ onGetStarted, onSignIn, onSignUp }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 640);

  /* Preload carousel images */
  useEffect(() => {
    IMAGES.forEach(({ src }) => { const img = new Image(); img.src = src; });
  }, []);

  /* Responsive */
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  /* Navigate */
  const navigate = useCallback((dir) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(prev => dir === 'next' ? (prev + 1) % 4 : (prev + 3) % 4);
    setTimeout(() => setIsAnimating(false), 650);
  }, [isAnimating]);

  /* Keyboard nav */
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowLeft')  navigate('prev');
      if (e.key === 'ArrowRight') navigate('next');
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [navigate]);

  const center = activeIndex;
  const left   = (activeIndex + 3) % 4;
  const right  = (activeIndex + 1) % 4;

  const getRoleStyle = (index) => {
    const H = isMobile ? '58%' : '46%';
    if (index === center) {
      const sc = IMAGES[index].centerScale ?? 1;
      return {
        left: '50%', height: H, bottom: 0,
        transform: `translateX(-50%) scale(${sc})`,
        transformOrigin: 'bottom center',
        filter: 'none', opacity: 1, zIndex: 20,
      };
    }
    if (index === left) return {
      left: isMobile ? '18%' : '28%', height: H, bottom: 0,
      transform: 'translateX(-50%) scale(1)',
      transformOrigin: 'bottom center',
      filter: 'none', opacity: 1, zIndex: 10,
    };
    if (index === right) return {
      left: isMobile ? '82%' : '72%', height: H, bottom: 0,
      transform: 'translateX(-50%) scale(1)',
      transformOrigin: 'bottom center',
      filter: 'none', opacity: 1, zIndex: 10,
    };
    return {
      left: '50%', height: isMobile ? '18%' : '14%', bottom: 0,
      transform: 'translateX(-50%) scale(1)',
      transformOrigin: 'bottom center',
      filter: 'none', opacity: 0.4, zIndex: 5,
    };
  };

  // ── Shared style helpers ──────────────────────────────────────────────────
  const sectionPad = isMobile ? '80px 24px 96px' : '120px 80px 140px';
  const overline   = (color = '#F4845F') => ({
    fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.18em',
    color, margin: '0 0 20px',
  });
  const bigHead = (color = '#0F0F0F') => ({
    fontFamily: 'Anton, sans-serif',
    fontSize: 'clamp(40px, 6vw, 88px)',
    lineHeight: 0.95, textTransform: 'uppercase',
    letterSpacing: '-0.02em', color, margin: 0,
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Global keyframes + utility classes ────────────────────────────── */}
      <style>{`
        .feat-card  { transition: transform 300ms ease, box-shadow 300ms ease; }
        .feat-card:hover { transform: translateY(-8px); box-shadow: 0 28px 56px rgba(0,0,0,0.09); }
        .role-card  { transition: transform 260ms ease, border-color 260ms ease; cursor: pointer; }
        .role-card:hover { transform: translateY(-6px); }
        .nav-btn    { transition: transform 150ms ease, background-color 150ms ease; }
        .nav-btn:hover { transform: scale(1.08); background-color: rgba(255,255,255,0.12) !important; }
      `}</style>

      {/* ════════════════════════════ HERO ════════════════════════════════ */}
      <div
        style={{
          backgroundColor: '#ffffff',
          position:        'relative',
          height:          '100vh',
          overflow:        'hidden',
          width:           '100%',
        }}>

        {/* Coloured background — only the top portion, bottom stays white */}
        <div style={{
          position:        'absolute',
          top:             0, left: 0, right: 0,
          height:          '92%',
          backgroundColor: IMAGES[activeIndex].bg,
          transition:      `background-color ${DUR} ${EASE}`,
          zIndex:          0,
        }} />

        {/* Giant ghost text */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 2, top: '18%' }}>
          <span style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(90px, 28vw, 380px)',
            fontWeight: 900, color: 'white', opacity: 1,
            lineHeight: 1, textTransform: 'uppercase',
            letterSpacing: '-0.02em', whiteSpace: 'nowrap',
          }}>
            CLOCKIT
          </span>
        </div>

        {/* Top-left brand */}
        <div className="absolute top-6 left-4 sm:left-8" style={{ zIndex: 60 }}>
          <span style={{
            fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
            color: 'white', opacity: 0.9, letterSpacing: '0.18em',
          }}>
            ✦ Notes
          </span>
        </div>

        {/* ── Top-right auth buttons ──────────────────────────────── */}
        <div className="absolute top-5 right-4 sm:right-8" style={{ zIndex: 60, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={onSignIn}
            style={{
              background: 'transparent', border: '1.5px solid rgba(255,255,255,0.6)',
              color: 'white', borderRadius: '100px',
              padding: isMobile ? '7px 16px' : '9px 22px',
              fontFamily: 'Inter, sans-serif', fontSize: isMobile ? '12px' : '13px',
              fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer',
              transition: 'background-color 150ms, border-color 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}>
            Sign In
          </button>
          <button
            onClick={onSignUp}
            style={{
              background: 'white', border: '1.5px solid white',
              color: '#0F0F0F', borderRadius: '100px',
              padding: isMobile ? '7px 16px' : '9px 22px',
              fontFamily: 'Inter, sans-serif', fontSize: isMobile ? '12px' : '13px',
              fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer',
              transition: 'opacity 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
            Sign Up
          </button>
        </div>

        {/* Dot indicators */}
        <div className="absolute top-6 left-1/2"
          style={{ zIndex: 60, transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {IMAGES.map((_, i) => (
            <div key={i} style={{
              width: i === activeIndex ? 20 : 6, height: 6, borderRadius: 3,
              backgroundColor: 'white',
              opacity: i === activeIndex ? 0.95 : 0.35,
              transition: `width ${DUR} ${EASE}, opacity ${DUR} ${EASE}`,
            }} />
          ))}
        </div>

        {/* Carousel */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {IMAGES.map(({ src }, index) => (
            <div key={index} style={{
              position: 'absolute', aspectRatio: '0.6 / 1',
              transition: TRANSITION, willChange: 'transform, opacity',
              background: 'transparent', ...getRoleStyle(index),
            }}>
              <img src={src} alt="" draggable={false} style={{
                width: '100%', height: '100%',
                objectFit: 'contain', objectPosition: 'bottom center',
                userSelect: 'none', background: 'transparent', display: 'block',
              }} />
            </div>
          ))}
        </div>

        {/* Bottom-left copy + nav */}
        <div className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: 320 }}>
          <p style={{
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em',
            marginBottom: isMobile ? 8 : 12,
            fontSize: isMobile ? '16px' : '22px', color: 'white', opacity: 0.95,
          }}>
            Notes
          </p>
          {!isMobile && (
            <p style={{
              fontSize: '14px', color: 'white', opacity: 0.85,
              lineHeight: 1.6, marginBottom: 20,
            }}>
              Real-time workforce operations and accountability for property management, concierge services, cleaning, security, and hospitality teams.
            </p>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ dir: 'prev', Icon: ArrowLeft }, { dir: 'next', Icon: ArrowRight }].map(({ dir, Icon }) => (
              <button key={dir} className="nav-btn" onClick={() => navigate(dir)}
                style={{
                  width: isMobile ? 48 : 64, height: isMobile ? 48 : 64,
                  borderRadius: '50%', background: 'transparent',
                  border: '2px solid white', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                <Icon size={26} strokeWidth={2.25} />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom-right EXPLORE NOW */}
        <div className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10" style={{ zIndex: 60 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(UserRole.CAREGIVER); }}
            style={{
              display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10,
              fontFamily: 'Anton, sans-serif', fontSize: 'clamp(20px, 4vw, 56px)',
              fontWeight: 400, color: 'white', opacity: 0.95,
              letterSpacing: '-0.02em', lineHeight: 1,
              textTransform: 'uppercase', textDecoration: 'none',
              transition: 'opacity 200ms', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.95'; }}>
            EXPLORE NOW
            <ArrowRight style={{ width: isMobile ? 20 : 32, height: isMobile ? 20 : 32 }} strokeWidth={2.25} />
          </a>
        </div>
      </div>

      {/* ════════════════════════ FEATURES ════════════════════════════════ */}
      <section style={{ backgroundColor: '#ffffff', padding: sectionPad }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={overline('#F4845F')}>✦ Platform Features</p>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-end', marginBottom: '64px',
            flexWrap: 'wrap', gap: 24,
          }}>
            <h2 style={{ ...bigHead('#0F0F0F'), maxWidth: 600 }}>
              Everything your<br />team needs.
            </h2>
            {!isMobile && (
              <p style={{
                fontSize: '15px', color: '#666', lineHeight: 1.75,
                maxWidth: 340, margin: 0,
              }}>
                One platform connecting caregivers, families, and administrators
                with exactly the tools each role needs to do their best work.
              </p>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '20px',
          }}>
            {FEATURES.map(({ Icon, title, desc, accent }) => (
              <div key={title} className="feat-card" style={{
                backgroundColor: '#F8F7F4', borderRadius: '20px',
                padding: isMobile ? '32px 28px' : '44px 40px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  backgroundColor: accent, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '28px',
                }}>
                  <Icon size={24} color="white" strokeWidth={2} />
                </div>
                <h3 style={{
                  fontFamily: 'Anton, sans-serif', fontSize: '26px',
                  textTransform: 'uppercase', letterSpacing: '-0.01em',
                  color: '#0F0F0F', margin: '0 0 14px',
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#666', margin: 0 }}>
                  {desc}
                </p>
                {/* decorative blob */}
                <div style={{
                  position: 'absolute', bottom: '-36px', right: '-36px',
                  width: '130px', height: '130px', borderRadius: '50%',
                  backgroundColor: accent, opacity: 0.07,
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ WHY CLOCKIT ══════════════════════════════ */}
      <section style={{ backgroundColor: '#1C2B4A', padding: sectionPad }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={overline('rgba(255,255,255,0.45)')}>✦ Why Notes</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '48px' : '80px',
            alignItems: 'center',
          }}>
            {/* Left — headline */}
            <div>
              <h2 style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 'clamp(40px, 5.5vw, 80px)',
                lineHeight: 0.95, textTransform: 'uppercase',
                letterSpacing: '-0.02em', color: 'white', margin: '0 0 24px',
              }}>
                Frontline operations,<br />reimagined.
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: 0, maxWidth: 380 }}>
                Notes replaces paper logs, group texts, and verbal handoffs with one intelligent platform — built for the front desk, accessible from everywhere.
              </p>
            </div>
            {/* Right — benefit list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {BENEFITS.map(({ title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: '#F4845F', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px',
                  }}>
                    <Check size={14} color="white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Anton, sans-serif', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'white', margin: '0 0 6px' }}>
                      {title}
                    </p>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS ═════════════════════════════ */}
      <section style={{ backgroundColor: '#F8F7F4', padding: sectionPad }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={overline('#6BBF7A')}>✦ How It Works</p>
          <h2 style={{ ...bigHead(), marginBottom: '72px' }}>
            Simple to start.<br />Built to scale.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '52px' : 0,
          }}>
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} style={{
                paddingRight: i < 2 && !isMobile ? '60px' : 0,
                paddingLeft:  i > 0 && !isMobile ? '60px' : 0,
                borderRight:  i < 2 && !isMobile ? '1px solid #E2E0D8' : 'none',
              }}>
                <p style={{
                  fontFamily: 'Anton, sans-serif', fontSize: '80px',
                  color: '#E4E1D8', lineHeight: 1, margin: '0 0 20px',
                }}>
                  {num}
                </p>
                <h3 style={{
                  fontFamily: 'Anton, sans-serif', fontSize: '26px',
                  textTransform: 'uppercase', letterSpacing: '-0.01em',
                  color: '#0F0F0F', margin: '0 0 14px',
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#666', margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ TESTIMONIALS ═════════════════════════════ */}
      <section style={{ backgroundColor: '#6BBF7A', padding: sectionPad }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={overline('rgba(255,255,255,0.75)')}>✦ What Teams Say</p>
          <h2 style={{ ...bigHead('white'), marginBottom: '60px' }}>
            Trusted by teams<br />who run the building.
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '20px',
          }}>
            {TESTIMONIALS.map(({ quote, name, role }) => (
              <div key={name} style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderRadius: '20px',
                padding: isMobile ? '32px 28px' : '40px 36px',
                border: '1px solid rgba(255,255,255,0.25)',
                borderTop: `3px solid white`,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div>
                  <Quote size={28} color="white" strokeWidth={1.5} style={{ marginBottom: '20px', opacity: 0.7 }} />
                  <p style={{
                    fontSize: '15px', lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.92)', margin: '0 0 32px',
                    fontStyle: 'italic',
                  }}>
                    "{quote}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '16px', color: 'white' }}>
                      {name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Anton, sans-serif', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'white', margin: '0 0 2px' }}>
                      {name}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ ROLES ════════════════════════════════════ */}
      <section style={{ backgroundColor: '#6BBF7A', padding: sectionPad }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={overline('rgba(255,255,255,0.75)')}>✦ Built For Everyone</p>
          <h2 style={{ ...bigHead('white'), marginBottom: '60px' }}>
              One platform.<br />Every role.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '20px',
          }}>
            {ROLES.map(({ name, tagline, desc, accent, userRole }) => (
              <div key={name} className="role-card"
                onClick={() => onGetStarted(userRole)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: '20px',
                  overflow: 'hidden', border: '1px solid rgba(255,255,255,0.25)',
                }}>
                <div style={{ height: '5px', backgroundColor: accent }} />
                <div style={{ padding: isMobile ? '32px 28px' : '40px 36px' }}>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '11px',
                    fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.18em', color: accent, margin: '0 0 16px',
                  }}>
                    {name}
                  </p>
                  <h3 style={{
                    fontFamily: 'Anton, sans-serif', fontSize: '28px',
                    textTransform: 'uppercase', letterSpacing: '-0.01em',
                    color: 'white', lineHeight: 1.1, margin: '0 0 16px',
                  }}>
                    {tagline}
                  </h3>
                  <p style={{
                    fontSize: '14px', lineHeight: 1.75,
                    color: 'rgba(255,255,255,0.78)', margin: '0 0 28px',
                  }}>
                    {desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'white' }}>
                    <span style={{
                      fontFamily: 'Inter', fontSize: '12px', fontWeight: 600,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      Enter Dashboard
                    </span>
                    <ArrowUpRight size={13} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ PRICING ══════════════════════════════════ */}
      <section style={{ backgroundColor: '#ffffff', padding: sectionPad }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={overline('#6BBF7A')}>✦ Simple Pricing</p>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-end', marginBottom: '60px', flexWrap: 'wrap', gap: 24,
          }}>
            <h2 style={{ ...bigHead(), margin: 0 }}>
              One plan for<br />every role.
            </h2>
            {!isMobile && (
              <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.75, maxWidth: 320, margin: 0 }}>
                Transparent pricing that scales with your team. No hidden fees, no long-term contracts.
              </p>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '20px', alignItems: 'stretch',
          }}>
            {PLANS.map(({ name, price, period, desc, features, accent, featured, cta }) => (
              <div key={name} style={{
                backgroundColor: featured ? '#0F0F0F' : '#F8F7F4',
                borderRadius: '20px',
                padding: isMobile ? '36px 28px' : '44px 40px',
                border: featured ? `2px solid ${accent}` : '2px solid transparent',
                position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}>
                {featured && (
                  <div style={{
                    position: 'absolute', top: '20px', right: '20px',
                    backgroundColor: accent, borderRadius: '100px',
                    padding: '4px 12px',
                    fontFamily: 'Inter', fontSize: '10px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white',
                  }}>
                    Most Popular
                  </div>
                )}
                <p style={{
                  fontFamily: 'Inter', fontSize: '11px', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.18em',
                  color: accent, margin: '0 0 20px',
                }}>
                  {name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
                  <span style={{
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 'clamp(40px, 5vw, 60px)',
                    color: featured ? 'white' : '#0F0F0F',
                    lineHeight: 1,
                  }}>
                    {price}
                  </span>
                  {period && (
                    <span style={{ fontSize: '14px', color: featured ? 'rgba(255,255,255,0.5)' : '#999' }}>
                      {period}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: featured ? 'rgba(255,255,255,0.55)' : '#777', lineHeight: 1.6, margin: '0 0 28px' }}>
                  {desc}
                </p>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
                  {features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={14} color={accent} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', color: featured ? 'rgba(255,255,255,0.75)' : '#555' }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onGetStarted(UserRole.CAREGIVER)}
                  style={{
                    width: '100%', padding: '16px',
                    backgroundColor: featured ? accent : 'transparent',
                    color: featured ? 'white' : accent,
                    border: `2px solid ${accent}`,
                    borderRadius: '100px',
                    fontFamily: 'Anton, sans-serif', fontSize: '16px',
                    textTransform: 'uppercase', letterSpacing: '-0.01em',
                    cursor: 'pointer', transition: 'transform 150ms, opacity 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                  {cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ CTA ══════════════════════════════════════ */}
      <section style={{
        backgroundColor: '#F4845F', padding: isMobile ? '100px 24px' : '140px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ghost text behind CTA */}
        <div className="absolute inset-x-0 pointer-events-none select-none"
          style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 0, textAlign: 'center' }}>
          <span style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(80px, 18vw, 260px)',
            color: 'white', opacity: 0.07, lineHeight: 1,
            textTransform: 'uppercase', letterSpacing: '-0.02em', whiteSpace: 'nowrap',
          }}>
            START NOW
          </span>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={overline('rgba(255,255,255,0.7)')}>✦ Get Started Today</p>
          <h2 style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(44px, 7vw, 104px)',
            lineHeight: 0.95, textTransform: 'uppercase',
            letterSpacing: '-0.02em', color: 'white',
            margin: '0 0 32px',
          }}>
            Ready to transform<br />care delivery?
          </h2>
          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.75, margin: '0 0 52px', maxWidth: 480,
          }}>
            Join hundreds of care teams already using Notes to deliver
            better outcomes, faster — for caregivers, families, and enterprise alike.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => onGetStarted(UserRole.CAREGIVER)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                backgroundColor: 'white', color: '#F4845F',
                border: 'none', borderRadius: '100px',
                padding: isMobile ? '16px 28px' : '18px 36px',
                fontFamily: 'Anton, sans-serif',
                fontSize: isMobile ? '16px' : '19px',
                textTransform: 'uppercase', letterSpacing: '-0.01em',
                cursor: 'pointer', transition: 'transform 150ms, box-shadow 150ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              EXPLORE NOW <ArrowRight size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => onGetStarted(UserRole.ENTERPRISE)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                backgroundColor: 'transparent', color: 'white',
                border: '2px solid rgba(255,255,255,0.55)', borderRadius: '100px',
                padding: isMobile ? '16px 28px' : '18px 36px',
                fontFamily: 'Anton, sans-serif',
                fontSize: isMobile ? '16px' : '19px',
                textTransform: 'uppercase', letterSpacing: '-0.01em',
                cursor: 'pointer', transition: 'border-color 150ms, background-color 150ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor     = 'white';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor     = 'rgba(255,255,255,0.55)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}>
              FOR ENTERPRISE <ArrowUpRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOOTER ═══════════════════════════════════ */}
      <footer style={{
        backgroundColor: '#0F0F0F',
        padding: isMobile ? '48px 24px' : '56px 80px',
        borderTop: '1px solid #1c1c1c',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: 28,
          }}>
            {/* Brand */}
            <div>
              <p style={{
                fontFamily: 'Anton, sans-serif', fontSize: '18px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'white', margin: '0 0 4px',
              }}>
                ✦ Notes
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                Notes — Intelligent care management
              </p>
            </div>

            {/* Nav links */}
            {!isMobile && (
              <div style={{ display: 'flex', gap: 36 }}>
                {[
                  { label: 'Caregiver',  role: UserRole.CAREGIVER },
                  { label: 'Family',     role: UserRole.FAMILY },
                  { label: 'Enterprise', role: UserRole.ENTERPRISE },
                ].map(({ label, role }) => (
                  <a key={label} href="#"
                    onClick={e => { e.preventDefault(); onGetStarted(role); }}
                    style={{
                      fontSize: '12px', fontWeight: 500,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      color: 'rgba(255,255,255,0.38)', textDecoration: 'none',
                      transition: 'color 150ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}>
                    {label}
                  </a>
                ))}
              </div>
            )}

            {/* Copyright */}
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.22)', margin: 0 }}>
              © 2025 Notes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
