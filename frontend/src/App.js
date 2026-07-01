import React, { useState, useEffect } from "react";
import "./App.css";
import { UserRole } from "./types";
import { LandingPage }        from "./components/LandingPage";
import { SignIn }              from "./components/SignIn";
import { SignUp }              from "./components/SignUp";
import { ManagerDashboard }   from "./components/ManagerDashboard";
import { CaregiverDashboard } from "./components/CaregiverDashboard";
import { ShiftCalendarPage }  from "./components/ShiftCalendarPage";
import { ThemeProvider }      from "./context/ThemeContext";
import { authApi }            from "./services/authApi";

function Spinner() {
  const isDark = localStorage.getItem('adltrack-theme') === 'dark';
  return (
    <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background: isDark ? '#0A0A0A' : '#fff' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{
          width:40, height:40, borderRadius:'50%',
          border:'3px solid #f0f0f0', borderTop:'3px solid #FF385C',
          animation:'spin 0.8s linear infinite',
        }} />
        <p style={{ fontFamily:"'Helvetica Neue',Arial,sans-serif", fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:'#bbb', margin:0 }}>
          onepermit
        </p>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const [page,         setPage]         = useState('loading');
  const [currentRole,  setCurrentRole]  = useState(null);
  const [authUser,     setAuthUser]     = useState(null);
  const [calendarFrom, setCalendarFrom] = useState('dashboard');

  useEffect(() => {
    authApi.getMe().then(user => {
      if (user) {
        setAuthUser(user);
        setCurrentRole(user.user_type === 'manager' ? UserRole.MANAGER : UserRole.CONCIERGE);
        setPage('dashboard');
      } else {
        setPage('landing');
      }
    });
  }, []);

  const handleSignIn = (role, user) => {
    setAuthUser(user);
    setCurrentRole(role);
    setPage('dashboard');
  };

  const handleSignUp = (user) => {
    setAuthUser(user);
    setCurrentRole(UserRole.MANAGER);
    setPage('dashboard');
  };

  const handleSignOut = async () => {
    await authApi.signOut();
    setAuthUser(null);
    setCurrentRole(null);
    setPage('landing');
  };

  const goToCalendar = (from = 'dashboard') => {
    setCalendarFrom(from);
    setPage('calendar');
  };

  if (page === 'loading') return <Spinner />;

  if (page === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setPage('signin')}
        onSignIn={() => setPage('signin')}
        onSignUp={() => setPage('signup')}
      />
    );
  }

  if (page === 'signin') {
    return (
      <SignIn
        onSignIn={handleSignIn}
        onGoToSignUp={() => setPage('signup')}
        onBack={() => setPage('landing')}
      />
    );
  }

  if (page === 'signup') {
    return (
      <SignUp
        onSignUp={handleSignUp}
        onGoToSignIn={() => setPage('signin')}
        onBack={() => setPage('landing')}
      />
    );
  }

  if (page === 'calendar') {
    return (
      <ThemeProvider>
        <ShiftCalendarPage
          onBeginShift={() => setPage('dashboard')}
          onBack={() => setPage(calendarFrom)}
        />
      </ThemeProvider>
    );
  }

  if (page === 'dashboard') {
    if (currentRole === UserRole.MANAGER) {
      return (
        <ThemeProvider>
          <ManagerDashboard
            onRoleSwitch={setCurrentRole}
            onSignOut={handleSignOut}
            authUser={authUser}
          />
        </ThemeProvider>
      );
    }
    return (
      <ThemeProvider>
        <CaregiverDashboard
          onSignOut={handleSignOut}
          onViewCalendar={() => goToCalendar('dashboard')}
          authUser={authUser}
        />
      </ThemeProvider>
    );
  }

  return null;
}
