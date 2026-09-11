import React, { useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { UserRole } from './types';
import { LandingPage } from './components/LandingPage';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { AuthSupportPage } from './components/AuthSupportPage';
import { ManagerDashboard } from './components/ManagerDashboard';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { ShiftCalendarPage } from './components/ShiftCalendarPage';
import { PublicLayout } from './components/layouts/PublicLayout';
import { AppLayout } from './components/layouts/AppLayout';
import { Metadata } from './components/pages/PublicPlaceholderPage';
import { ProductPage, HowItWorksPage, SolutionsPage } from './components/pages/PublicPages';
import { AboutPage, CareersPage, ContactPage, FaqPage } from './components/pages/PublicCompanyPages';
import { LoadingState } from './components/foundation/Foundation';
import { ThemeProvider } from './context/ThemeContext';
import { SharedDataProvider } from './context/SharedDataContext';
import { useAuthSession } from './context/AuthSessionContext';
import { brand } from './config/brand';

function HomeRoute() {
  const navigate = useNavigate();
  return <><Metadata description={brand.metadata.description} /><LandingPage onGetStarted={() => navigate('/login')} onSignIn={() => navigate('/login')} onSignUp={() => navigate('/signup')} /></>;
}

function AnonymousOnly() {
  const { status } = useAuthSession();
  if (status === 'loading') return <LoadingState label="Checking your session…" fullPage />;
  return status === 'authenticated' ? <Navigate to="/app" replace /> : <Outlet />;
}

function ProtectedRoute() {
  const { status } = useAuthSession();
  const location = useLocation();
  if (status === 'loading') return <LoadingState label="Opening your property…" fullPage />;
  return status === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeAuthentication } = useAuthSession();
  const destination = location.state?.from?.startsWith('/app') ? location.state.from : '/app';
  return <><Metadata title="Sign in" description="Sign in to your Noted property workspace." /><SignIn onSignIn={(_, user) => { completeAuthentication(user); navigate(destination, { replace: true }); }} onGoToSignUp={() => navigate('/signup', { state: location.state })} onForgotPassword={() => navigate('/forgot-password')} onBack={() => navigate('/')} /></>;
}

function SignupRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeAuthentication } = useAuthSession();
  const destination = location.state?.from?.startsWith('/app') ? location.state.from : '/app';
  return <><Metadata title="Create account" description="Create a Noted manager account and begin configuring your property operation." /><SignUp onSignUp={(user) => { completeAuthentication(user); navigate(destination, { replace: true }); }} onGoToSignIn={() => navigate('/login', { state: location.state })} onBack={() => navigate('/')} /></>;
}

function DashboardRoute() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthSession();
  const initialRole = user?.user_type === 'manager' ? UserRole.MANAGER : UserRole.CONCIERGE;
  const [currentRole, setCurrentRole] = useState(initialRole);
  const handleSignOut = async () => { await signOut(); navigate('/', { replace: true }); };
  return <><Metadata title="Property workspace" description="Your property’s tasks, procedures, activity, and operational history." /><SharedDataProvider>{currentRole === UserRole.MANAGER ? <ManagerDashboard onRoleSwitch={setCurrentRole} onSignOut={handleSignOut} authUser={user} /> : <CaregiverDashboard onSignOut={handleSignOut} onViewCalendar={() => navigate('/app/calendar')} authUser={user} />}</SharedDataProvider></>;
}

function CalendarRoute() {
  const navigate = useNavigate();
  return <ShiftCalendarPage onBeginShift={() => navigate('/app')} onBack={() => navigate('/app')} />;
}

export default function App() {
  return <Routes>
    <Route path="/" element={<HomeRoute />} />
    <Route element={<PublicLayout />}>
      <Route path="product" element={<ProductPage />} />
      <Route path="how-it-works" element={<HowItWorksPage />} />
      <Route path="solutions" element={<SolutionsPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="faq" element={<FaqPage />} />
      <Route path="careers" element={<CareersPage />} />
      <Route path="contact" element={<ContactPage />} />
    </Route>
    <Route element={<AnonymousOnly />}><Route path="/login" element={<LoginRoute />} /><Route path="/signup" element={<SignupRoute />} /></Route>
    <Route path="/forgot-password" element={<AuthSupportPage mode="forgot" />} />
    <Route path="/reset-password" element={<AuthSupportPage mode="reset" />} />
    <Route path="/invite/:token" element={<AuthSupportPage mode="invite" />} />
    <Route element={<ProtectedRoute />}><Route path="/app" element={<ThemeProvider><AppLayout /></ThemeProvider>}><Route index element={<Navigate to="today" replace />} /><Route path="calendar" element={<CalendarRoute />} /><Route path="*" element={<DashboardRoute />} /></Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
