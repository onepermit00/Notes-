import React from 'react';
import { Building2 } from 'lucide-react';
import { DASHBOARD_ACCENT, DASHBOARD_FONT } from './tokens';

/**
 * Centered property identity (building avatar + name) above a pill switch.
 * Shared by the concierge and manager "Today's shift" pages.
 *
 * views: [{ id, label, aria, current, disabled, onSelect }]
 */
export function ShiftViewHeader({
  propertyName, subtitle, views = [], navLabel = 'Shift report views',
  action, isPhone = false, colors = {}, style,
}) {
  const palette = { card:'#fff', card2:'#f7f7f7', text:'#222', muted:'#717171', border:'#e5e5e5', ...colors };
  const avatar = isPhone ? 76 : 92;

  return <header className="dar-screen-only" data-testid="shift-view-header" style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', fontFamily:DASHBOARD_FONT, ...style }}>
    {action && <div style={{ position:'absolute', top:0, right:0 }}>{action}</div>}
    <div aria-hidden="true" style={{ width:avatar, height:avatar, borderRadius:'50%', background:palette.card, border:`4px solid ${palette.card}`, boxShadow:`0 0 0 1px ${palette.border}, 0 8px 24px rgba(0,0,0,.08)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:`color-mix(in srgb, ${DASHBOARD_ACCENT} 9%, ${palette.card})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Building2 size={isPhone ? 32 : 38} color={DASHBOARD_ACCENT} strokeWidth={1.8} />
      </div>
    </div>
    <h1 data-testid="shift-view-property" style={{ margin:'14px 0 0', maxWidth:'100%', padding:isPhone ? '0 48px' : '0 60px', boxSizing:'border-box', textAlign:'center', fontSize:isPhone ? 24 : 30, fontWeight:800, color:palette.text, letterSpacing:'-.04em', lineHeight:1.08, overflowWrap:'anywhere' }}>{propertyName}</h1>
    {subtitle && <p style={{ margin:'7px 0 0', textAlign:'center', fontSize:12, color:palette.muted, lineHeight:1.5 }}>{subtitle}</p>}
    <nav aria-label={navLabel} style={{ width:'100%', marginTop:isPhone ? 18 : 22 }}>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${views.length || 1},minmax(0,1fr))`, gap:4, padding:4, background:palette.card2, border:`1px solid ${palette.border}`, borderRadius:999 }}>
        {views.map(view => <button
          type="button" key={view.id || view.label}
          onClick={() => { if (!view.disabled && view.onSelect) view.onSelect(); }}
          disabled={view.disabled} aria-label={view.aria} aria-current={view.current ? 'page' : undefined}
          className="touch-target"
          style={{ minWidth:0, minHeight:isPhone ? 42 : 44, padding:isPhone ? '8px 6px' : '8px 14px', borderRadius:999, border:0, background:view.current ? palette.card : 'transparent', boxShadow:view.current ? '0 1px 2px rgba(0,0,0,.08), 0 3px 10px rgba(0,0,0,.07)' : 'none', color:view.current ? palette.text : palette.muted, fontFamily:DASHBOARD_FONT, fontSize:isPhone ? 12 : 13, fontWeight:view.current ? 750 : 600, textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', cursor:view.disabled ? 'not-allowed' : 'pointer', opacity:view.disabled ? .46 : 1, transition:'background 160ms, box-shadow 160ms, color 160ms' }}
        >{view.label}</button>)}
      </div>
    </nav>
  </header>;
}

export default ShiftViewHeader;
