import React from 'react';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return <div className="noted-app-shell"><a className="noted-skip-link" href="#app-content">Skip to application</a><main id="app-content"><Outlet /></main></div>;
}
