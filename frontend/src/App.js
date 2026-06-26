import React, { useState } from "react";
import "./App.css";
import { UserRole, TaskStatus } from "./types";
import { LandingPage } from "./components/LandingPage";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { ManagerDashboard }   from "./components/ManagerDashboard";
import { CaregiverDashboard } from "./components/CaregiverDashboard";
import { EnterpriseDashboard } from "./components/EnterpriseDashboard";
import { ShiftCalendarPage } from "./components/ShiftCalendarPage";
import { ThemeProvider } from "./context/ThemeContext";
import { INITIAL_TASKS, PROPOSED_TASKS, CONCIERGE_PROFILE, USER_PROPERTIES } from "./services/mockData";

const DEFAULT_PROPERTY = USER_PROPERTIES[0];

function App() {
  const [page,        setPage]        = useState('landing');
  const [currentRole, setCurrentRole] = useState(UserRole.CONCIERGE);
  const [calendarFrom, setCalendarFrom] = useState('dashboard');

  const [tasks,         setTasks]         = useState(INITIAL_TASKS);
  const [proposedTasks, setProposedTasks] = useState(PROPOSED_TASKS);
  const [incidents,     setIncidents]     = useState([]);

  const goToCalendar = (from = 'dashboard') => {
    setCalendarFrom(from);
    setPage('calendar');
  };

  const handleGetStarted = (role = UserRole.CAREGIVER) => {
    setCurrentRole(role);
    setPage('dashboard');
  };

  const handleSignIn = (role = UserRole.CAREGIVER) => {
    setCurrentRole(role);
    setPage('dashboard');
  };

  const handleSignUp = (role = UserRole.CAREGIVER) => {
    setCurrentRole(role);
    setPage('dashboard');
  };

  const handleBeginShift = () => setPage('dashboard');

  const handleRoleSwitch = (newRole) => setCurrentRole(newRole);

  const handleUpdateTask = (updatedTask) =>
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

  const handleAcceptTask = (task) => {
    setTasks(prev => [...prev, { ...task, status: TaskStatus.PENDING, acceptedAt: new Date().toISOString() }]);
    setProposedTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const handleDeclineTask = (taskId) =>
    setProposedTasks(prev => prev.filter(t => t.id !== taskId));

  const handleAddIncident = (incident) =>
    setIncidents(prev => [{
      ...incident,
      id: Date.now(),
      createdAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      createdBy: CONCIERGE_PROFILE,
      status: 'new',
    }, ...prev]);

  if (page === 'landing') {
    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onSignIn={() => setPage('signin')}
        onSignUp={() => setPage('signup')}
      />
    );
  }

  if (page === 'calendar') {
    return (
      <ShiftCalendarPage
        property={DEFAULT_PROPERTY}
        onBeginShift={handleBeginShift}
        onBack={() => setPage(calendarFrom)}
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

  switch (currentRole) {
    case UserRole.MANAGER:
      return (
        <ThemeProvider>
          <ManagerDashboard onRoleSwitch={handleRoleSwitch} />
        </ThemeProvider>
      );
    case UserRole.ENTERPRISE:
      return (
        <ThemeProvider>
          <EnterpriseDashboard onRoleSwitch={handleRoleSwitch} />
        </ThemeProvider>
      );
    default:
      return (
        <ThemeProvider>
          <CaregiverDashboard
            tasks={tasks}
            proposedTasks={proposedTasks}
            onUpdateTask={handleUpdateTask}
            onAcceptTask={handleAcceptTask}
            onDeclineTask={handleDeclineTask}
            incidents={incidents}
            onAddIncident={handleAddIncident}
            onSignOut={() => setPage('landing')}
            onViewCalendar={() => goToCalendar('dashboard')}
          />
        </ThemeProvider>
      );
  }
}

export default App;
