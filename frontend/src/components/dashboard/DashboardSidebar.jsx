import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Menu, X } from 'lucide-react';
import {
  DASHBOARD_ACTIVE_NAV,
  DASHBOARD_FONT,
  DASHBOARD_SIDEBAR_COLLAPSED,
  DASHBOARD_SIDEBAR_EXPANDED,
} from './tokens';

const INTER = DASHBOARD_FONT;

/**
 * Shared dashboard navigation shell used by role-specific dashboards.
 * Items stay configuration-driven so destinations and workflows remain owned by
 * their dashboard while the responsive interaction model remains consistent.
 */
export function DashboardSidebar({
  ariaLabel,
  eyebrow,
  title = 'Property operations',
  groups,
  activeId,
  onSelect,
  collapsed,
  onCollapsedChange,
  drawerOpen,
  onDrawerOpenChange,
  isMobile,
  user,
  profileStatus,
  onProfile,
  colors,
  accent = '#FF385C',
  urgent = '#FF3B30',
  badges = {},
}) {
  const closeButtonRef = useRef(null);
  const { CARD, BORDER, TEXT, MUTED, NAV_SURFACE = CARD, isDarkMode = false } = colors;

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previousFocus = document.activeElement;
    const onKeyDown = event => {
      if (event.key === 'Escape') onDrawerOpenChange(false);
    };
    window.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [drawerOpen, onDrawerOpenChange]);

  const renderContent = isDrawer => {
    const isCollapsed = !isDrawer && collapsed;
    return <>
      {isDrawer && (
        <div style={{ position:'relative', padding:'24px 20px 16px', flexShrink:0, borderBottom:`1px solid ${BORDER}` }}>
          <button ref={closeButtonRef} type="button" aria-label="Close navigation menu" onClick={() => onDrawerOpenChange(false)}
            style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:8, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X size={18} color={MUTED} />
          </button>
          <div style={{ fontFamily:INTER, fontSize:18, fontWeight:700, color:TEXT, lineHeight:1.3, letterSpacing:'-0.01em', paddingRight:32 }}>
            Welcome,<br />{user?.name || 'Team member'}!
          </div>
          {user?.email && <div style={{ fontFamily:INTER, fontSize:13, color:MUTED, marginTop:6, overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>}
        </div>
      )}

      <nav aria-label={ariaLabel} style={{ padding:isCollapsed?'10px 7px 4px':'8px 10px 4px', overflowY:'auto', overflowX:'hidden', flex:1, minHeight:0 }}>
        {!isCollapsed && (
          <div style={{ position:'relative', padding:'4px 38px 13px 8px', borderBottom:`1px solid ${BORDER}`, marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
              <span aria-hidden="true" style={{ width:20, height:2, background:accent }} />
              <span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:accent, letterSpacing:'.20em', textTransform:'uppercase' }}>{eyebrow}</span>
            </div>
            <div style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color:TEXT, letterSpacing:'-.01em' }}>{title}</div>
            {!isDrawer && (
              <button type="button" aria-label="Collapse sidebar" onClick={() => onCollapsedChange(true)}
                style={{ position:'absolute', top:2, right:0, width:32, height:32, borderRadius:9, border:`1px solid ${BORDER}`, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <ChevronLeft size={15} color={MUTED} />
              </button>
            )}
          </div>
        )}

        {groups.map((group, groupIndex) => (
          <div key={group.label} style={{ paddingTop:groupIndex?8:0, marginTop:groupIndex?5:0, borderTop:isCollapsed&&groupIndex?`1px solid ${BORDER}`:'none' }}>
            {!isCollapsed && <div style={{ padding:'4px 10px 6px', fontFamily:INTER, fontSize:9, fontWeight:800, color:MUTED, letterSpacing:'.16em', textTransform:'uppercase' }}>{group.label}</div>}
            {group.items.map(item => {
              const active = !item.action && activeId === item.id;
              const isUrgent = item.urgent;
              const Icon = item.Icon;
              const badge = badges[item.id];
              return (
                <button key={item.id} type="button"
                  className={`nav-btn touch-target${active?' nav-btn--active':''}`}
                  onClick={() => {
                    if (isCollapsed) onCollapsedChange(false);
                    onSelect(item);
                    if (isDrawer) onDrawerOpenChange(false);
                  }}
                  title={isCollapsed?item.label:undefined}
                  aria-label={isCollapsed?item.label:undefined}
                  aria-current={active?'page':undefined}
                  style={{ display:'flex', alignItems:'center', justifyContent:isCollapsed?'center':'flex-start', gap:isCollapsed?0:11, width:'100%', minHeight:44, padding:isCollapsed?'4px':'4px 8px', marginBottom:2, border:isUrgent&&!active?`1px solid ${urgent}28`:'1px solid transparent', borderRadius:10, cursor:'pointer', textAlign:'left', position:'relative', background:active?(isDarkMode?'rgba(255,255,255,.12)':DASHBOARD_ACTIVE_NAV):isUrgent?`${urgent}08`:'transparent', transition:'background 120ms ease, border-color 120ms ease' }}>
                  {active && <span aria-hidden="true" style={{ position:'absolute', left:0, top:10, bottom:10, width:3, borderRadius:'0 3px 3px 0', background:'rgba(255,255,255,.88)' }} />}
                  <span aria-hidden="true" style={{ width:32, height:32, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', background:active?'rgba(255,255,255,.16)':isUrgent?`${urgent}10`:'transparent' }}>
                    <Icon size={17} color={active?'#fff':isUrgent?urgent:MUTED} strokeWidth={active?2.2:1.7} />
                    {!!badge && <span style={{ position:'absolute', top:-2, right:-3, minWidth:15, height:15, borderRadius:99, background:urgent, border:`2px solid ${active?DASHBOARD_ACTIVE_NAV:NAV_SURFACE}`, color:'#fff', fontFamily:INTER, fontSize:7, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 2px' }}>{badge}</span>}
                  </span>
                  {!isCollapsed && <span style={{ flex:1, minWidth:0, fontFamily:INTER, fontSize:13, fontWeight:active?750:600, color:active?'#fff':isUrgent?urgent:TEXT, letterSpacing:'-.005em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {!isDrawer && onProfile && (
        <div style={{ padding:'14px 12px 18px', display:'flex', alignItems:'center', gap:12, borderTop:`1px solid ${BORDER}` }}>
          <button type="button" onClick={onProfile} title={isCollapsed?(user?.name||'Profile'):undefined}
            style={{ display:'flex', alignItems:'center', justifyContent:isCollapsed?'center':'flex-start', gap:12, background:'none', border:'none', cursor:'pointer', padding:0, textAlign:'left', flex:1, minWidth:0 }}>
            <span style={{ width:44, height:44, borderRadius:'50%', background:`${accent}14`, flexShrink:0, border:`2px solid ${activeId==='profile'?accent:BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:INTER, fontSize:14, fontWeight:800, color:accent }}>
              {(user?.name||'M').split(' ').map(word=>word[0]).join('').slice(0,2).toUpperCase()}
            </span>
            {!isCollapsed && <span style={{ minWidth:0 }}>
              <span style={{ display:'block', fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name||'Team member'}</span>
              {profileStatus && <span style={{ display:'block', fontFamily:INTER, fontSize:12, color:MUTED, marginTop:2 }}>{profileStatus}</span>}
            </span>}
          </button>
        </div>
      )}

      <div style={{ flexShrink:0, padding:isCollapsed?'12px 0':'12px 20px 0', paddingBottom:'max(24px, env(safe-area-inset-bottom))', display:'flex', alignItems:'center', justifyContent:isCollapsed?'center':'flex-start' }}>
        {!isCollapsed && <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'.24em', textTransform:'uppercase' }}>Noted</span>}
      </div>
    </>;
  };

  return <>
    {!isMobile && (
      <aside aria-label={`${ariaLabel} navigation`} style={{ width:collapsed?DASHBOARD_SIDEBAR_COLLAPSED:DASHBOARD_SIDEBAR_EXPANDED, minWidth:collapsed?DASHBOARD_SIDEBAR_COLLAPSED:DASHBOARD_SIDEBAR_EXPANDED, background:'transparent', display:'flex', flexDirection:'column', overflow:'hidden', zIndex:10, flexShrink:0, height:'100%', transition:'width 220ms ease, min-width 220ms ease' }}>
        <div style={{ minHeight:0, flex:1, display:'flex', flexDirection:'column', background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,.035)', overflow:'hidden' }}>{renderContent(false)}</div>
      </aside>
    )}
    {isMobile && <>
      {!drawerOpen && <button type="button" aria-label="Open navigation menu" aria-expanded="false" onClick={() => onDrawerOpenChange(true)} style={{ position:'fixed', top:12, left:12, zIndex:48, width:40, height:40, padding:0, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Menu size={20} color={TEXT} /></button>}
      <AnimatePresence>
        {drawerOpen && <>
          <motion.div key="dashboard-sidebar-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.18}} onClick={() => onDrawerOpenChange(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:50, backdropFilter:'blur(2px)' }} />
          <motion.div key="dashboard-sidebar-panel" role="dialog" aria-modal="true" aria-label={`${ariaLabel} navigation`} initial={{x:-280}} animate={{x:0}} exit={{x:-280}} transition={{type:'spring', damping:28, stiffness:280}} style={{ position:'fixed', left:0, top:0, bottom:0, width:DASHBOARD_SIDEBAR_EXPANDED, maxWidth:'calc(100vw - 24px)', background:'transparent', zIndex:55, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ minHeight:0, flex:1, display:'flex', flexDirection:'column', background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, boxShadow:'0 8px 30px rgba(0,0,0,.12)', overflow:'hidden' }}>{renderContent(true)}</div>
          </motion.div>
        </>}
      </AnimatePresence>
    </>}
  </>;
}
