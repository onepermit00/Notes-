import React from 'react';

const INTER = "'Inter','Helvetica Neue',Arial,sans-serif";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ADLTrack] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isDark = localStorage.getItem('adltrack-theme') === 'dark';
      return (
        <div style={{
          display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 20, padding: 32, textAlign: 'center',
          background: isDark ? '#0A0A0A' : '#FFFFFF', fontFamily: INTER,
        }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(255,59,48,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 36, lineHeight: 1 }}>⚠️</span>
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#F5F5F5' : '#222222', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
              Something went wrong
            </p>
            <p style={{ fontSize: 14, color: '#8A8A8A', margin: '0 0 24px', maxWidth: 340, lineHeight: 1.6 }}>
              An unexpected error occurred. Your data is safe — please reload to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '13px 28px', background: '#FF385C', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,56,92,0.30)', letterSpacing: '-0.01em' }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
