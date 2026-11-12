import React from 'react';
import { AssistantFace } from '../../assistant/AssistantFace';
import { DASHBOARD_FONT } from './tokens';

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
  const avatar = isPhone ? 66 : 74;

  return <header className="dar-screen-only" data-testid="shift-view-header" style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', fontFamily:DASHBOARD_FONT, ...style }}>
    <button type="button" onClick={onAsk} data-testid="shift-view-ask" aria-label="Ask the Noted Assistant" style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', padding:0, border:0, background:'transparent', cursor:'pointer', font:'inherit' }}>
      <span style={{ display:'block', width:avatar, height:avatar, borderRadius:'50%', overflow:'hidden', border:`3px solid ${palette.card}`, boxSizing:'border-box', boxShadow:'0 5px 16px rgba(40,30,10,.16)' }}><AssistantFace /></span>
      <span style={{ marginTop:-11, minHeight:23, padding:'0 11px', borderRadius:999, background:palette.card, boxShadow:`inset 0 0 0 1px ${palette.border}, 0 2px 8px rgba(0,0,0,.08)`, display:'inline-flex', alignItems:'center', fontSize:12, fontWeight:700, color:palette.text, letterSpacing:'-.02em', whiteSpace:'nowrap' }}>{askLabel}</span>
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
