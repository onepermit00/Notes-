import React, { useEffect, useState } from 'react';
import { Plus, Phone, Mail, Building2, Users, ChevronRight, FileText, MapPin, CalendarCheck, Monitor, Home, Star, HelpCircle, Check, Maximize2, LayoutGrid, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import MicButton from './MicButton';

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

const now = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function Label({ children, optional }) {
  const { colors } = useTheme();
  const { MUTED, INTER } = colors;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', gap:12, marginBottom:9 }}>
      <span style={{ fontFamily:INTER, fontSize:14, fontWeight:800, color:colors.TEXT }}>{children}</span>
      {optional && <span style={{ fontFamily:INTER, fontSize:10, fontWeight:600, color:MUTED, letterSpacing:'.12em', textTransform:'uppercase' }}>Optional</span>}
    </div>
  );
}

function WizardHeader({ propertyName, title, description, step, totalSteps, onCancel }) {
  const { colors } = useTheme();
  const { INTER, CARD, CARD2, BORDER, TEXT, MUTED } = colors;
  return (
    <div style={{ flexShrink:0, background:CARD, borderBottom:`1px solid ${BORDER}` }}>
      <div style={{ padding:'24px 28px 17px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:18 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}><span style={{ width:24, height:2, background:BLUE }} /><span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.22em', textTransform:'uppercase' }}>{propertyName}</span></div>
          <div style={{ fontFamily:INTER, fontSize:34, fontWeight:800, color:TEXT, letterSpacing:'-.045em', lineHeight:.98 }}>{title}</div>
          <div style={{ maxWidth:470, fontFamily:INTER, fontSize:12, color:MUTED, lineHeight:1.55, marginTop:9 }}>{description}</div>
          {step && <div style={{ fontFamily:INTER, fontSize:11, color:MUTED, marginTop:8 }}>Step {step} of {totalSteps} · Prospect visit</div>}
        </div>
        <button onClick={onCancel} aria-label="Close tour workflow" style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}><X size={19} color={TEXT} /></button>
      </div>
      {step && <div style={{ display:'flex', gap:5, padding:'0 28px 20px' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i < step ? BLUE : BORDER, transition:'background 200ms' }} />
        ))}
      </div>}
    </div>
  );
}

function WizardFooter({ onBack, onContinue, continueLabel = 'Continue', continueDisabled = false, isFirst = false }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <div style={{ flexShrink: 0, padding: '14px 28px 20px', background: CARD, borderTop: `1px solid ${BORDER}`, boxShadow:'0 -8px 24px rgba(0,0,0,.04)', display: 'flex', gap: 10 }}>
      {!isFirst && (
        <button onClick={onBack}
          style={{ flex:1, minHeight:48, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, cursor:'pointer' }}>
          Back
        </button>
      )}
      <button onClick={onContinue} disabled={continueDisabled}
        style={{ flex:1, minHeight:48, padding:'0 20px', background:continueDisabled?CARD2:BLUE, border:continueDisabled?`1px solid ${BORDER}`:'none', borderRadius:999, fontFamily:INTER, fontSize:14, fontWeight:750, color:continueDisabled?MUTED:'white', cursor:continueDisabled?'not-allowed':'pointer', boxShadow:continueDisabled?'none':`0 7px 22px ${BLUE}28`, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        {continueLabel}{!continueDisabled && <ChevronRight size={16}/>} 
      </button>
    </div>
  );
}

function SelectionCard({ id, Icon, desc, selected, onSelect, index }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER } = colors;
  return (
    <button onClick={onSelect}
      style={{ minHeight:92, display:'grid', gridTemplateColumns:'36px 1fr 22px', alignItems:'center', gap:11, padding:13, background:selected?'rgba(255,56,92,.045)':CARD, border:`1.5px solid ${selected?BLUE:BORDER}`, borderRadius:14, cursor:'pointer', textAlign:'left', width:'100%', boxShadow:selected?'0 5px 18px rgba(255,56,92,.10)':colors.SHADOW, transition:'all 150ms' }}>
      <div style={{ width:36, height:36, borderRadius:10, background:selected?'rgba(255,56,92,.12)':CARD2, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        <Icon size={18} color={selected ? BLUE : MUTED} />
        {index !== undefined && <span style={{ position:'absolute', top:-6, left:-6, fontFamily:INTER, fontSize:7, fontWeight:800, color:selected?BLUE:MUTED }}>{String(index+1).padStart(2,'0')}</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily:INTER, fontSize:13, fontWeight:750, color:TEXT }}>{id}</div>
        <div style={{ fontFamily:INTER, fontSize:11, color:MUTED, marginTop:4, lineHeight:1.4 }}>{desc}</div>
      </div>
      {selected && (
        <div style={{ width:22, height:22, borderRadius:'50%', background:BLUE, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Check size={13} color="white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

export const ToursDashboard = ({ onActivityLogged, onWorkflowChange, propertyName='The Alexen', onClose, isPhone=false }) => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const gc = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' };
  const [tours, setTours] = useState([]);
  const [view,  setView]  = useState('main');
  const [tourTab, setTourTab] = useState('team');
  const [tStep, setTStep] = useState(1);
  const [tForm, setTF]    = useState({ visitorName: '', phone: '', email: '', unitType: '', source: '', agentId: '', notes: '' });

  const changeView = nextView => { onWorkflowChange?.(nextView !== 'main'); setView(nextView); };
  useEffect(() => { onWorkflowChange?.(view !== 'main'); return () => onWorkflowChange?.(false); }, [view, onWorkflowChange]);
  const goBack = () => { changeView('main'); setTF({ visitorName: '', phone: '', email: '', unitType: '', source: '', agentId: '', notes: '' }); setTStep(1); };

  const submitTour = () => {
    if (!tForm.visitorName || !tForm.agentId) return;
    const agent = LEASING_AGENTS.find(a => a.id === tForm.agentId);
    setTours(p => [{ ...tForm, id: Date.now(), time: now(), agent }, ...p]);
    const tourNotes = [agent?.name ? `${agent.name} conducted the tour` : '', tForm.source ? `The prospect source was ${tForm.source.toLowerCase()}` : '', tForm.notes.trim()].filter(Boolean).join('. ');
    onActivityLogged?.({ title: `Tour · ${tForm.visitorName}${tForm.unitType ? ` · ${tForm.unitType}` : ''}`, category: 'Resident Assist', notes: tourNotes });
    goBack();
  };

  // ── LOG TOUR WIZARD ───────────────────────────────────────────────────────
  if (view === 'form') {

    // Step 1: Visitor contact info
    if (tStep === 1) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader propertyName={propertyName} title="Identify the prospect" description="Start the visit record with the prospect’s contact information." step={1} totalSteps={4} onCancel={goBack} />
        <div style={{ flex:1, minHeight:0, overflowY:'auto', padding:isPhone?18:'24px 28px', display:'flex', flexDirection:'column', gap:18 }}>
          <div><div style={{ fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.16em',textTransform:'uppercase',marginBottom:6 }}>01 · Contact</div><h2 style={{ fontFamily:INTER,fontSize:20,fontWeight:800,color:TEXT,letterSpacing:'-.03em',margin:'0 0 5px' }}>Who is visiting?</h2><p style={{fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.5,margin:0}}>Add the name required for the tour record and any available contact details.</p></div>
          <section style={{ background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:isPhone?16:20,boxShadow:SHADOW,display:'grid',gap:18 }}>
          <div>
            <Label>Visitor name *</Label>
            <input type="text" placeholder="Prospect's full name" value={tForm.visitorName} onChange={e => setTF(p => ({ ...p, visitorName: e.target.value }))}
              style={{ width:'100%',minHeight:48,padding:'12px 14px',borderRadius:12,border:`1.5px solid ${tForm.visitorName?BLUE:BORDER}`,fontFamily:INTER,fontSize:16,color:TEXT,background:tForm.visitorName?'rgba(255,56,92,.025)':CARD2,outline:'none',boxSizing:'border-box' }} />
          </div>
          <div>
            <Label optional>Phone</Label>
            <input type="tel" placeholder="(215) 555-0100" value={tForm.phone} onChange={e => setTF(p => ({ ...p, phone: e.target.value }))}
              style={{ width:'100%',minHeight:48,padding:'12px 14px',borderRadius:12,border:`1.5px solid ${tForm.phone?BLUE:BORDER}`,fontFamily:INTER,fontSize:16,color:TEXT,background:CARD2,outline:'none',boxSizing:'border-box' }} />
          </div>
          <div>
            <Label optional>Email</Label>
            <input type="email" placeholder="email@example.com" value={tForm.email} onChange={e => setTF(p => ({ ...p, email: e.target.value }))}
              style={{ width:'100%',minHeight:48,padding:'12px 14px',borderRadius:12,border:`1.5px solid ${tForm.email?BLUE:BORDER}`,fontFamily:INTER,fontSize:16,color:TEXT,background:CARD2,outline:'none',boxSizing:'border-box' }} />
          </div>
          </section>
        </div>
        <WizardFooter isFirst onContinue={() => setTStep(2)} continueDisabled={!tForm.visitorName} />
      </div>
    );

    // Step 2: Unit type
    if (tStep === 2) return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <WizardHeader propertyName={propertyName} title="Choose their interest" description="Capture the home type the prospect wants to explore." step={2} totalSteps={4} onCancel={goBack} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:isPhone?18:'24px 28px' }}>
          <div style={{marginBottom:18}}><div style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.16em',textTransform:'uppercase',marginBottom:6}}>02 · Interest</div><h2 style={{fontFamily:INTER,fontSize:20,fontWeight:800,color:TEXT,letterSpacing:'-.03em',margin:'0 0 5px'}}>What are they looking for?</h2><p style={{fontFamily:INTER,fontSize:12,color:MUTED,margin:0}}>Optional — continue if the prospect is still undecided.</p></div>
          <div style={{ display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9 }}>
            {UNIT_TYPE_CONFIG.map(({ id, Icon, desc }, index) => (
              <SelectionCard key={id} id={id} Icon={Icon} desc={desc}
                index={index}
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
        <WizardHeader propertyName={propertyName} title="Record the source" description="Attribute the visit to the channel that brought the prospect in." step={3} totalSteps={4} onCancel={goBack} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:isPhone?18:'24px 28px' }}>
          <div style={{marginBottom:18}}><div style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.16em',textTransform:'uppercase',marginBottom:6}}>03 · Attribution</div><h2 style={{fontFamily:INTER,fontSize:20,fontWeight:800,color:TEXT,letterSpacing:'-.03em',margin:'0 0 5px'}}>How did they find us?</h2><p style={{fontFamily:INTER,fontSize:12,color:MUTED,margin:0}}>Optional — continue if the source is unknown.</p></div>
          <div style={{ display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9 }}>
            {SOURCE_CONFIG.map(({ id, Icon, desc }, index) => (
              <SelectionCard key={id} id={id} Icon={Icon} desc={desc}
                index={index}
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
        <WizardHeader propertyName={propertyName} title="Assign the tour" description="Choose the leasing partner responsible for this visit and add handoff context." step={4} totalSteps={4} onCancel={goBack} />
        <div style={{ flex:1,minHeight:0,overflowY:'auto',padding:isPhone?18:'24px 28px',display:'flex',flexDirection:'column',gap:18 }}>
          <div><div style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.16em',textTransform:'uppercase',marginBottom:6}}>04 · Ownership</div><h2 style={{fontFamily:INTER,fontSize:20,fontWeight:800,color:TEXT,letterSpacing:'-.03em',margin:'0 0 5px'}}>Who handled the visit?</h2><p style={{fontFamily:INTER,fontSize:12,color:MUTED,margin:0}}>Select the leasing agent required for the completed record.</p></div>

          <div style={{ display:'grid',gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))',gap:9 }}>
            {LEASING_AGENTS.map(agent => {
              const sel = tForm.agentId === agent.id;
              return (
                <button key={agent.id} onClick={() => setTF(p => ({ ...p, agentId: agent.id }))}
                  style={{ minHeight:84,display:'grid',gridTemplateColumns:'40px 1fr 22px',alignItems:'center',gap:11,padding:13,background:sel?'rgba(255,56,92,.045)':CARD,border:`1.5px solid ${sel?BLUE:BORDER}`,borderRadius:14,cursor:'pointer',textAlign:'left',width:'100%',boxShadow:sel?'0 5px 18px rgba(255,56,92,.10)':SHADOW,transition:'all 150ms' }}>
                  <div style={{ width:40,height:40,borderRadius:'50%',background:`${agent.color}18`,border:`2px solid ${sel?agent.color:`${agent.color}35`}`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <span style={{ fontFamily:INTER,fontSize:13,fontWeight:800,color:agent.color }}>{agent.initials}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily:INTER,fontSize:13,fontWeight:750,color:TEXT }}>{agent.name}</div>
                    <div style={{ fontFamily:INTER,fontSize:10,color:MUTED,marginTop:3 }}>{agent.title}</div>
                  </div>
                  {sel && (
                    <div style={{ width:22,height:22,borderRadius:'50%',background:BLUE,display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <Check size={13} color="white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:isPhone?16:20,boxShadow:SHADOW }}>
            <Label optional>Tour notes</Label>
            <div style={{ position: 'relative' }}>
              <textarea placeholder="First visit, moving from NYC, interested in July move-in..." value={tForm.notes} onChange={e => setTF(p => ({ ...p, notes: e.target.value }))} rows={3}
                style={{ width:'100%',minHeight:100,padding:'14px 44px 14px 14px',borderRadius:12,border:`1.5px solid ${tForm.notes?BLUE:BORDER}`,fontFamily:INTER,fontSize:16,color:TEXT,background:CARD2,outline:'none',resize:'none',boxSizing:'border-box',lineHeight:1.5 }} />
              <MicButton onTranscript={t => setTF(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} />
            </div>
          </div>
        </div>
        <WizardFooter onBack={() => setTStep(3)} onContinue={submitTour} continueLabel="Log Tour" continueDisabled={!tForm.agentId} />
      </div>
    );
  }

  // ── TOUR LIST VIEW ────────────────────────────────────────────────────────
  return (
    <div style={{ flex:1,minHeight:0,display:'flex',flexDirection:'column',background:BG }}>
      <WizardHeader propertyName={propertyName} title="Tours" description="Record prospect visits and coordinate the leasing handoff from the desk." onCancel={onClose}/>
      <nav aria-label="Tour views" style={{ flexShrink:0,padding:isPhone?'14px 18px 0':'16px 28px 0' }}><div style={{display:'flex',padding:4,background:CARD2,border:`1px solid ${BORDER}`,borderRadius:14}}>{[{id:'team',label:'Leasing team',count:LEASING_AGENTS.length},{id:'tours',label:"Today's tours",count:tours.length}].map(tab=>{const active=tourTab===tab.id;return <button key={tab.id} onClick={()=>setTourTab(tab.id)} aria-current={active?'page':undefined} style={{flex:1,minHeight:42,borderRadius:11,border:active?`1px solid ${BORDER}`:'1px solid transparent',background:active?CARD:'transparent',boxShadow:active?'0 2px 8px rgba(0,0,0,.07)':'none',color:active?TEXT:MUTED,fontFamily:INTER,fontSize:12,fontWeight:750,cursor:'pointer',transition:'all 160ms'}}>{tab.label}<span style={{color:active?BLUE:MUTED,fontSize:9,marginLeft:6}}>{tab.count}</span></button>})}</div></nav>
      <main style={{ flex:1,minHeight:0,overflowY:'auto',padding:isPhone?18:'20px 28px 30px',display:'grid',alignContent:'start',gap:20 }}>
        <button onClick={()=>changeView('form')} style={{width:'100%',minHeight:64,padding:'12px 16px',background:BLUE,borderRadius:16,border:'none',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',boxShadow:`0 7px 22px ${BLUE}28`}}><span style={{display:'flex',alignItems:'center',gap:12}}><span style={{width:38,height:38,background:'rgba(255,255,255,.17)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center'}}><Plus size={20} color="white"/></span><span style={{textAlign:'left'}}><strong style={{display:'block',fontFamily:INTER,fontSize:14,color:'white'}}>Log a tour</strong><span style={{display:'block',fontFamily:INTER,fontSize:11,color:'rgba(255,255,255,.72)',marginTop:3}}>Create a prospect visit record</span></span></span><ChevronRight size={18} color="rgba(255,255,255,.75)"/></button>
        {tourTab==='team' ? <section><SectionTitle Icon={Users} title="Leasing team" count={LEASING_AGENTS.length} colors={{CARD2,TEXT,MUTED,INTER}}/><div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,boxShadow:SHADOW,overflow:'hidden'}}>{LEASING_AGENTS.map((agent,index)=>{const count=tours.filter(t=>t.agentId===agent.id).length;return <div key={agent.id} style={{minHeight:66,padding:'10px 14px',display:'grid',gridTemplateColumns:'42px 1fr auto',alignItems:'center',gap:12,borderBottom:index<LEASING_AGENTS.length-1?`1px solid ${BORDER}`:'none'}}><span style={{width:42,height:42,borderRadius:'50%',background:`${agent.color}16`,border:`2px solid ${agent.color}38`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:INTER,fontSize:13,fontWeight:800,color:agent.color}}>{agent.initials}</span><span><strong style={{display:'block',fontFamily:INTER,fontSize:13,fontWeight:750,color:TEXT}}>{agent.name}</strong><span style={{display:'block',fontFamily:INTER,fontSize:10,color:MUTED,marginTop:3}}>{agent.title}</span></span><span style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:count?BLUE:MUTED,background:count?'rgba(255,56,92,.1)':CARD2,borderRadius:999,padding:'5px 8px',textTransform:'uppercase',letterSpacing:'.06em'}}>{count?`${count} tour${count>1?'s':''}`:'On duty'}</span></div>})}</div></section> : <section><SectionTitle Icon={FileText} title="Today's tours" count={tours.length} colors={{CARD2,TEXT,MUTED,INTER}}/>{tours.length===0?<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:'36px 20px',textAlign:'center',boxShadow:SHADOW}}><div style={{width:50,height:50,borderRadius:14,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}><Users size={22} color={MUTED}/></div><p style={{fontFamily:INTER,fontSize:15,fontWeight:800,color:TEXT,margin:'0 0 4px'}}>No tours logged yet</p><p style={{fontFamily:INTER,fontSize:12,color:MUTED,margin:0}}>New visit records will appear here.</p></div>:<div style={{display:'grid',gap:9}}>{tours.map(t=><article key={t.id} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:16,boxShadow:SHADOW}}><div style={{display:'grid',gridTemplateColumns:'42px 1fr auto',gap:12,alignItems:'start'}}><span style={{width:42,height:42,borderRadius:12,background:`${t.agent?.color||BLUE}14`,display:'flex',alignItems:'center',justifyContent:'center'}}><Users size={18} color={t.agent?.color||BLUE}/></span><div><p style={{fontFamily:INTER,fontSize:14,fontWeight:800,color:TEXT,margin:'0 0 4px'}}>{t.visitorName}</p><p style={{fontFamily:INTER,fontSize:11,color:MUTED,margin:0}}>{t.agent?.name}{t.unitType?` · ${t.unitType}`:''}{t.source?` · ${t.source}`:''}</p></div><span style={{fontFamily:INTER,fontSize:10,color:MUTED}}>{t.time}</span></div>{(t.phone||t.email||t.notes)&&<div style={{marginTop:12,paddingTop:11,borderTop:`1px solid ${BORDER}`,display:'flex',gap:12,flexWrap:'wrap'}}>{t.phone&&<span style={{fontFamily:INTER,fontSize:10,color:MUTED}}><Phone size={10}/> {t.phone}</span>}{t.email&&<span style={{fontFamily:INTER,fontSize:10,color:MUTED}}><Mail size={10}/> {t.email}</span>}{t.notes&&<span style={{width:'100%',fontFamily:INTER,fontSize:11,color:MUTED,lineHeight:1.45}}>{t.notes}</span>}</div>}</article>)}</div>}</section>}
      </main>
    </div>
  );
};

function SectionTitle({ Icon, title, count, colors:{ CARD2,TEXT,MUTED,INTER } }) {
  return <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11}}><div style={{display:'flex',alignItems:'center',gap:9}}><div style={{width:32,height:32,borderRadius:10,background:`${BLUE}12`,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={16} color={BLUE}/></div><h3 style={{fontFamily:INTER,fontSize:16,fontWeight:800,color:TEXT,margin:0}}>{title}</h3></div><span style={{minWidth:28,height:28,borderRadius:999,background:CARD2,display:'inline-flex',alignItems:'center',justifyContent:'center',fontFamily:INTER,fontSize:11,fontWeight:750,color:MUTED}}>{count}</span></div>;
}

export default ToursDashboard;
