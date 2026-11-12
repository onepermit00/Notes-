import React from 'react';
import { DASHBOARD_ACCENT, DASHBOARD_FONT } from './tokens';

/** Noted's own house mark: soft rounded outline, tinted body, accent arched door. */
function PropertyMark({ size = 72, ink = '#222' }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ display:'block' }}>
    <path d="M12 29.5 29.4 13.2a3.8 3.8 0 0 1 5.2 0L52 29.5V47a7 7 0 0 1-7 7H19a7 7 0 0 1-7-7Z" fill={DASHBOARD_ACCENT} fillOpacity=".1" stroke={ink} strokeWidth="3.2" strokeLinejoin="round" />
    <path d="M26 52.4V42.5a6 6 0 0 1 12 0v9.9Z" fill={DASHBOARD_ACCENT} />
    <path d="M44 14.5v6" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />
  </svg>;
}

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
    <PropertyMark size={isPhone ? 72 : 80} ink={palette.text} />
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
