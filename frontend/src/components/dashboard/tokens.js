/** Shared, theme-independent dashboard design tokens. */
export const dashboardTokens = Object.freeze({
  fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  sidebar: Object.freeze({ expanded: 272, collapsed: 80 }),
  spacing: Object.freeze({ mobile: 16, desktop: 28 }),
  radius: Object.freeze({ row: 20, card: 24 }),
  color: Object.freeze({
    accent: '#FF385C',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    activeNavigation: '#222222',
  }),
});

export const DASHBOARD_FONT = dashboardTokens.fontFamily;
export const DASHBOARD_SIDEBAR_EXPANDED = dashboardTokens.sidebar.expanded;
export const DASHBOARD_SIDEBAR_COLLAPSED = dashboardTokens.sidebar.collapsed;
export const DASHBOARD_ACCENT = dashboardTokens.color.accent;
export const DASHBOARD_SUCCESS = dashboardTokens.color.success;
export const DASHBOARD_DANGER = dashboardTokens.color.danger;
export const DASHBOARD_WARNING = dashboardTokens.color.warning;
export const DASHBOARD_ACTIVE_NAV = dashboardTokens.color.activeNavigation;
