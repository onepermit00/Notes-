import React from 'react';
import { DASHBOARD_FONT } from './tokens';

/** The assistant's face: a round character in a green knit hat with a little heart. */
function AssistantFace() {
  return <svg viewBox="0 0 100 100" aria-hidden="true" style={{ display:'block', width:'100%', height:'100%' }}>
    <defs>
      <radialGradient id="shift-assistant-face" cx="45%" cy="40%"><stop offset="0" stopColor="#ffe3cf" /><stop offset="1" stopColor="#f4c4a4" /></radialGradient>
    </defs>
    <rect width="100" height="100" fill="#f3ead9" />
    <ellipse cx="50" cy="106" rx="40" ry="26" fill="#8fb486" />
    <circle cx="50" cy="60" r="30" fill="url(#shift-assistant-face)" />
    <path d="M18 52c0-20 14-32 32-32s32 12 32 32c-10-6-20-8-32-8s-22 2-32 8z" fill="#8fb486" />
    <path d="M19 52c10-6 20-8 31-8s21 2 31 8" stroke="#6d9366" strokeWidth="5" fill="none" strokeLinecap="round" />
    <g stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.4" fill="none"><path d="M30 28v14M40 23v19M50 21v21M60 23v19M70 28v14" /></g>
    <circle cx="50" cy="18" r="7" fill="#f8f4ec" />
    <path d="M50 36.5c-2.4-3-6.5-1-5 2 1 2 5 4.5 5 4.5s4-2.5 5-4.5c1.5-3-2.6-5-5-2z" fill="#e9866f" />
    <ellipse cx="40" cy="62" rx="3" ry="3.6" fill="#2a2420" /><ellipse cx="60" cy="62" rx="3" ry="3.6" fill="#2a2420" />
    <circle cx="41" cy="60.8" r="1" fill="#fff" /><circle cx="61" cy="60.8" r="1" fill="#fff" />
    <ellipse cx="33" cy="70" rx="5" ry="3" fill="#f29c8c" opacity=".5" /><ellipse cx="67" cy="70" rx="5" ry="3" fill="#f29c8c" opacity=".5" />
    <path d="M45 71q5 5 10 0" stroke="#2a2420" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>;
}

/**
 * Centered assistant avatar ("Ask me") above underline tabs.
 * Shared by the concierge and manager "Today's shift" pages.
 *
 * views: [{ id, label, aria, current, disabled, onSelect }]
 */
export function ShiftViewHeader({
  subtitle, views = [], navLabel = 'Shift report views', onAsk, askLabel = 'Ask me',
  isPhone = false, colors = {}, style,
}) {
  const palette = { card:'#fff', card2:'#f7f7f7', text:'#222', muted:'#717171', border:'#e5e5e5', ...colors };
  const avatar = isPhone ? 96 : 108;

  return <header className="dar-screen-only" data-testid="shift-view-header" style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', fontFamily:DASHBOARD_FONT, ...style }}>
    <button type="button" onClick={onAsk} data-testid="shift-view-ask" aria-label="Ask the Noted Assistant" style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', padding:0, border:0, background:'transparent', cursor:'pointer', font:'inherit' }}>
      <span style={{ display:'block', width:avatar, height:avatar, borderRadius:'50%', overflow:'hidden', border:`4px solid ${palette.card}`, boxSizing:'border-box', boxShadow:'0 8px 24px rgba(40,30,10,.16)' }}><AssistantFace /></span>
      <span style={{ marginTop:-18, minHeight:38, padding:'0 20px', borderRadius:999, background:palette.card, boxShadow:`inset 0 0 0 1px ${palette.border}, 0 4px 14px rgba(0,0,0,.08)`, display:'inline-flex', alignItems:'center', fontSize:isPhone ? 17 : 18, fontWeight:750, color:palette.text, letterSpacing:'-.02em', whiteSpace:'nowrap' }}>{askLabel}</span>
    </button>
    {subtitle && <p style={{ margin:'12px 0 0', textAlign:'center', fontSize:13, color:palette.muted, lineHeight:1.5 }}>{subtitle}</p>}
    <nav aria-label={navLabel} style={{ width:'100%', marginTop:isPhone ? 20 : 26 }}>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${views.length || 1},minmax(0,1fr))`, gap:isPhone ? 6 : 8 }}>
        {views.map(view => <button
          type="button" key={view.id || view.label}
          onClick={() => { if (!view.disabled && view.onSelect) view.onSelect(); }}
          disabled={view.disabled} aria-label={view.aria} aria-current={view.current ? 'page' : undefined}
          className="touch-target"
          style={{ minWidth:0, minHeight:isPhone ? 50 : 54, padding:isPhone ? '6px 2px 12px' : '6px 12px 14px', border:0, borderRadius:0, borderBottom:`3px solid ${view.current ? palette.text : palette.border}`, background:'transparent', color:view.current ? palette.text : palette.muted, fontFamily:DASHBOARD_FONT, fontSize:isPhone ? 16 : 17, fontWeight:view.current ? 700 : 500, letterSpacing:'-.01em', textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', cursor:view.disabled ? 'not-allowed' : 'pointer', opacity:view.disabled ? .55 : 1, transition:'border-color 160ms, color 160ms' }}
        >{view.label}</button>)}
      </div>
    </nav>
  </header>;
}

export default ShiftViewHeader;
