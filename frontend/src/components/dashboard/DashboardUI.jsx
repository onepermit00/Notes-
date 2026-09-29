import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { dashboardTokens } from './tokens';

export function DashboardPage({ children, style = {}, ...props }) {
  const { colors } = useTheme();
  return <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', fontFamily:dashboardTokens.fontFamily, background:colors.BG, ...style }} {...props}>{children}</div>;
}

export function DashboardCard({ children, style = {}, onClick, testId, ...props }) {
  const { colors } = useTheme();
  return (
    <div data-testid={testId} onClick={onClick} style={{ background:colors.CARD, boxShadow:colors.SHADOW, borderRadius:dashboardTokens.radius.card, overflow:'hidden', cursor:onClick?'pointer':undefined, ...style }} {...props}>
      {children}
    </div>
  );
}

export function DashboardEyebrow({ children, style = {}, ...props }) {
  const { colors } = useTheme();
  return <span style={{ fontFamily:dashboardTokens.fontFamily, fontSize:11, fontWeight:600, color:colors.MUTED, textTransform:'uppercase', letterSpacing:'0.12em', ...style }} {...props}>{children}</span>;
}

export function DashboardSectionTitle({ children, as:Component = 'span', style = {}, ...props }) {
  const { colors } = useTheme();
  return <Component style={{ fontFamily:dashboardTokens.fontFamily, fontSize:'clamp(1.1rem,3vw,1.4rem)', fontWeight:700, color:colors.TEXT, letterSpacing:'-0.01em', lineHeight:1.2, ...style }} {...props}>{children}</Component>;
}

export function DashboardStatusBadge({ children, color, dot = true, style = {}, ...props }) {
  const { colors } = useTheme();
  const badgeColor = color || colors.MUTED;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px', borderRadius:999, background:`${badgeColor}1F`, color:badgeColor, fontFamily:dashboardTokens.fontFamily, fontSize:10, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', ...style }} {...props}>
      {dot && <span aria-hidden="true" style={{ width:6, height:6, borderRadius:'50%', background:badgeColor }} />}{children}
    </span>
  );
}
