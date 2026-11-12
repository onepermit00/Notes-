import React from 'react';
import { Home } from 'lucide-react';
import { DASHBOARD_FONT } from './tokens';

/**
 * Centered house icon and property name above a pill switch.
 * Shared by the concierge and manager "Today's shift" pages.
 *
 * views: [{ id, label, aria, current, disabled, onSelect }]
 */
export function ShiftViewHeader({
  propertyName, subtitle, views = [], navLabel = 'Shift report views',
  isPhone = false, colors = {}, style,
}) {
  const palette = { card:'#fff', card2:'#f7f7f7', text:'#222', muted:'#717171', border:'#e5e5e5', ...colors };

  return <header className="dar-screen-only" data-testid="shift-view-header" style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', fontFamily:DASHBOARD_FONT, ...style }}>
    <Home aria-hidden="true" size={isPhone ? 68 : 76} color={palette.text} strokeWidth={1.6} />
    <h1 data-testid="shift-view-property" style={{ margin:isPhone ? '12px 0 0' : '14px 0 0', maxWidth:'100%', textAlign:'center', fontSize:isPhone ? 27 : 34, fontWeight:700, color:palette.text, letterSpacing:'-.035em', lineHeight:1.1, overflowWrap:'anywhere' }}>{propertyName}</h1>
    {subtitle && <p style={{ margin:'8px 0 0', textAlign:'center', fontSize:13, color:palette.muted, lineHeight:1.5 }}>{subtitle}</p>}
    <nav aria-label={navLabel} style={{ width:'100%', marginTop:isPhone ? 22 : 26 }}>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${views.length || 1},minmax(0,1fr))`, padding:5, background:palette.card2, boxShadow:`inset 0 0 0 1px ${palette.border}, inset 0 1px 3px rgba(0,0,0,.05)`, borderRadius:999 }}>
        {views.map(view => <button
          type="button" key={view.id || view.label}
          onClick={() => { if (!view.disabled && view.onSelect) view.onSelect(); }}
          disabled={view.disabled} aria-label={view.aria} aria-current={view.current ? 'page' : undefined}
          className="touch-target"
          style={{ minWidth:0, minHeight:isPhone ? 46 : 50, padding:isPhone ? '8px 4px' : '8px 16px', borderRadius:999, border:0, background:view.current ? palette.card : 'transparent', boxShadow:view.current ? '0 1px 2px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.08)' : 'none', color:view.current ? palette.text : palette.muted, fontFamily:DASHBOARD_FONT, fontSize:isPhone ? 15 : 16, fontWeight:view.current ? 650 : 500, letterSpacing:'-.01em', textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', cursor:view.disabled ? 'not-allowed' : 'pointer', opacity:view.disabled ? .5 : 1, transition:'background 160ms, box-shadow 160ms, color 160ms' }}
        >{view.label}</button>)}
      </div>
    </nav>
  </header>;
}

export default ShiftViewHeader;
