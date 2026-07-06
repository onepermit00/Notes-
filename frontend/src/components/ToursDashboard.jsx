import React, { useState } from 'react';
import { Plus, Phone, Mail, Building2, Users, ChevronRight, FileText, MapPin, CalendarCheck, Monitor, Home, Star, HelpCircle, Check, Maximize2, LayoutGrid } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GREEN  = '#34C759';
const BLUE   = '#FF385C';
const ORANGE = '#FF9500';

export const LEASING_AGENTS = [
  { id: 'sarah',  name: 'Sarah Mitchell', title: 'Leasing Consultant',     initials: 'SM', color: BLUE   },
  { id: 'david',  name: 'David Chen',     title: 'Leasing Consultant',     initials: 'DC', color: '#8B5CF6' },
  { id: 'priya',  name: 'Priya Sharma',   title: 'Sr. Leasing Consultant', initials: 'PS', color: ORANGE },
  { id: 'marcus', name: 'Marcus Johnson', title: 'Leasing Manager',        initials: 'MJ', color: GREEN  },
];

const UNIT_TYPE_CONFIG = [
  { id: 'Studio',         Icon: Maximize2,  desc: 'Open-concept, all-in-one layout'          },
  { id: '1 Bed / 1 Bath', Icon: Home,       desc: 'Separate bedroom with full bath'           },
  { id: '2 Bed / 1 Bath', Icon: Building2,  desc: 'Two bedrooms, one shared bath'             },
  { id: '2 Bed / 2 Bath', Icon: LayoutGrid, desc: 'Two bedrooms with private baths each'      },
  { id: 'Penthouse',      Icon: Star,       desc: 'Top floor premium suite with views'        },
];

const SOURCE_CONFIG = [
  { id: 'Walk-In',        Icon: MapPin,        desc: 'No prior appointment, visiting today'          },
  { id: 'Scheduled',      Icon: CalendarCheck, desc: 'Pre-booked appointment'                        },
  { id: 'CoStar',         Icon: Monitor,       desc: 'Found us on CoStar commercial listings'        },
  { id: 'Zillow',         Icon: Home,          desc: 'Found us on Zillow'                            },
  { id: 'Apartments.com', Icon: Building2,     desc: 'Found us on Apartments.com'                    },
  { id: 'Referral',       Icon: Users,         desc: 'Referred by a current resident or contact'     },
  { id: 'Other',          Icon: HelpCircle,    desc: 'Other source not listed'                       },
];

const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

function Label({ children }) {
  const { colors } = useTheme();
  const { MUTED, INTER } = colors;
  return (
    <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function WizardHeader({ title, step, totalSteps, onCancel }) {
  const { colors } = useTheme();
  const { CARD, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <div style={{ flexShrink: 0, background: CARD, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>{title}</div>
          <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 3 }}>Step {step} of {totalSteps}</div>
        </div>
        <button onClick={onCancel} style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 2 }}>
          Cancel
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4, padding: '0 20px 14px' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? BLUE : BORDER, transition: 'background 200ms' }} />
        ))}
      </div>
    </div>
  );
}

function WizardFooter({ onBack, onContinue, continueLabel = 'Continue', continueDisabled = false, isFirst = false }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <div style={{ flexShrink: 0, padding: '12px 20px 24px', background: CARD, borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 10 }}>
      {!isFirst && (
        <button onClick={onBack}
          style={{ flex: 1, padding: '15px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>
          Back
        </button>
      )}
      <button onClick={onContinue} disabled={continueDisabled}
        style={{ flex: 1, padding: '15px 0', background: continueDisabled ? CARD2 : BLUE, border: continueDisabled ? `1px solid ${BORDER}` : 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: continueDisabled ? MUTED : 'white', cursor: continueDisabled ? 'not-allowed' : 'pointer', boxShadow: continueDisabled ? 'none' : `0 6px 20px ${BLUE}28` }}>
        {continueLabel}
      </button>
    </div>
  );
}

function SelectionCard({ id, Icon, desc, selected, onSelect }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <button onClick={onSelect}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: selected ? 'rgba(255,56,92,0.04)' : CARD, border: `1.5px solid ${selected ? BLUE : BORDER}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: selected ? `0 0 0 3px rgba(255,56,92,0.10)` : 'none', transition: 'all 150ms' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: selected ? 'rgba(255,56,92,0.12)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}>
        <Icon size={24} color={selected ? BLUE : MUTED} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{id}</div>
        <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
      </div>
      {selected && (
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Check size={13} color="white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

export const ToursDashboard = ({ onActivityLogged }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const gc = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' };
  const [tours, setTours] = useState([]);
  const [view,  setView]  = useState('main');
  const [tStep, setTStep] = useState(1);
  const [tForm, setTF]    = useState({ visitorName: '', phone: '', email: '', unitType: '', source: '', agentId: '', notes: '' });

  const goBack = () => { setView('main'); setTF({ visitorName: '', phone: '', email: '', unitType: '', source: '', agentId: '', notes: '' }); setTStep(1); };

  const submitTour = () => {
    if (!tForm.visitorName || !tForm.agentId) return;
    const agent = LEASING_AGENTS.find(a => a.id === tForm.agentId);
    setTours(p => [{ ...tForm, id: Date.now(), time: now(), agent }, ...p]);
    onActivityLogged?.({ title: `Tour · ${tForm.visitorName}${tForm.unitType ? ` · ${tForm.unitType}` : ''}`, category: 'Resident Assist', notes: tForm.notes });
    goBack();
  };

  // ── LOG TOUR WIZARD ───────────────────────────────────────────────────────
  if (view === 'form') {

    // Step 1: Visitor contact info
    if (tStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Tour" step={1} totalSteps={4} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Who is visiting?
          </h2>
          <div>
            <Label>Visitor Name *</Label>
            <input type="text" placeholder="Prospect's full name" value={tForm.visitorName} onChange={e => setTF(p => ({ ...p, visitorName: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Phone (optional)</Label>
            <input type="tel" placeholder="(215) 555-0100" value={tForm.phone} onChange={e => setTF(p => ({ ...p, phone: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <Label>Email (optional)</Label>
            <input type="email" placeholder="email@example.com" value={tForm.email} onChange={e => setTF(p => ({ ...p, email: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <WizardFooter isFirst onContinue={() => setTStep(2)} continueDisabled={!tForm.visitorName} />
      </div>
    );

    // Step 2: Unit type
    if (tStep === 2) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Tour" step={2} totalSteps={4} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px' }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 6px' }}>
            What are they interested in?
          </h2>
          <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 20px' }}>Optional — skip if undecided</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {UNIT_TYPE_CONFIG.map(({ id, Icon, desc }) => (
              <SelectionCard key={id} id={id} Icon={Icon} desc={desc}
                selected={tForm.unitType === id}
                onSelect={() => setTF(p => ({ ...p, unitType: p.unitType === id ? '' : id }))} />
            ))}
          </div>
        </div>
        <WizardFooter onBack={() => setTStep(1)} onContinue={() => setTStep(3)} />
      </div>
    );

    // Step 3: Tour source
    if (tStep === 3) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Tour" step={3} totalSteps={4} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px' }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: '0 0 6px' }}>
            How did they find us?
          </h2>
          <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 20px' }}>Optional — skip if unknown</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SOURCE_CONFIG.map(({ id, Icon, desc }) => (
              <SelectionCard key={id} id={id} Icon={Icon} desc={desc}
                selected={tForm.source === id}
                onSelect={() => setTF(p => ({ ...p, source: p.source === id ? '' : id }))} />
            ))}
          </div>
        </div>
        <WizardFooter onBack={() => setTStep(2)} onContinue={() => setTStep(4)} />
      </div>
    );

    // Step 4: Assign agent + notes
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader title="Log Tour" step={4} totalSteps={4} onCancel={goBack} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0 }}>
            Assign to leasing agent
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LEASING_AGENTS.map(agent => {
              const sel = tForm.agentId === agent.id;
              return (
                <button key={agent.id} onClick={() => setTF(p => ({ ...p, agentId: agent.id }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: sel ? 'rgba(255,56,92,0.04)' : CARD, border: `1.5px solid ${sel ? BLUE : BORDER}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: sel ? `0 0 0 3px rgba(255,56,92,0.10)` : 'none', transition: 'all 150ms' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${agent.color}18`, border: `2px solid ${sel ? agent.color : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}>
                    <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: 800, color: agent.color }}>{agent.initials}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{agent.name}</div>
                    <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 2 }}>{agent.title}</div>
                  </div>
                  {sel && (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={13} color="white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <textarea placeholder="First visit, moving from NYC, interested in July move-in..." value={tForm.notes} onChange={e => setTF(p => ({ ...p, notes: e.target.value }))} rows={3}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <WizardFooter onBack={() => setTStep(3)} onContinue={submitTour} continueLabel="Log Tour" continueDisabled={!tForm.agentId} />
      </div>
    );
  }

  // ── TOUR LIST VIEW ────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 24, background: BG }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero CTA */}
        <button onClick={() => setView('form')}
          style={{ width: '100%', padding: 20, background: BLUE, borderRadius: 20, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: `0 8px 28px ${BLUE}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.20)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={28} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: INTER, fontSize: 17, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>Log Tour</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: 0 }}>Record a prospect visit</p>
            </div>
          </div>
          <ChevronRight size={24} color="rgba(255,255,255,0.72)" />
        </button>

        {/* Leasing Team section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} color={BLUE} />
              <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Leasing Team</h2>
            </div>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED, fontFamily: INTER }}>{LEASING_AGENTS.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LEASING_AGENTS.map(agent => {
              const agentTours = tours.filter(t => t.agentId === agent.id);
              return (
                <div key={agent.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${agent.color}18`, border: `2px solid ${agent.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: INTER, fontSize: 17, fontWeight: 800, color: agent.color }}>{agent.initials}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 2px' }}>{agent.name}</p>
                    <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0 }}>{agent.title}</p>
                  </div>
                  {agentTours.length > 0 ? (
                    <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 800, color: BLUE, background: 'rgba(255,56,92,0.10)', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>
                      {agentTours.length} tour{agentTours.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, background: CARD2, borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>On duty</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Tours section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} color={GREEN} />
              <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Today's Tours</h2>
            </div>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED, fontFamily: INTER }}>{tours.length}</span>
          </div>

          {tours.length === 0 ? (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '36px 20px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Users size={30} color={MUTED} />
              </div>
              <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: '0 0 5px' }}>No tours logged yet</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Tap the button above to record a visit</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tours.map(t => (
                <div key={t.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: t.notes ? 12 : 0 }}>
                    <div style={{ width: 56, height: 56, background: `${t.agent?.color || BLUE}18`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={26} color={t.agent?.color || BLUE} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT }}>{t.visitorName}</span>
                        {t.source && (
                          <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: BLUE, background: 'rgba(255,56,92,0.08)', border: '1px solid rgba(255,56,92,0.18)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.source}</span>
                        )}
                      </div>
                      {t.agent && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 11, background: `${t.agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontFamily: INTER, fontSize: 8, fontWeight: 800, color: t.agent.color }}>{t.agent.initials}</span>
                          </div>
                          <span style={{ fontFamily: INTER, fontSize: 13, color: TEXT, fontWeight: 600 }}>{t.agent.name}</span>
                          <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>· {t.agent.title.replace('Leasing ', '')}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {t.unitType && <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={12} color={MUTED} /> {t.unitType}</span>}
                        {t.phone && <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} color={MUTED} /> {t.phone}</span>}
                        {t.email && <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} color={MUTED} /> {t.email}</span>}
                      </div>
                    </div>
                    <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, flexShrink: 0 }}>{t.time}</span>
                  </div>
                  {t.notes && (
                    <div style={{ paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                      <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0, fontStyle: 'italic' }}>"{t.notes}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ToursDashboard;
