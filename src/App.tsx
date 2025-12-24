import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DemoModeProvider } from './contexts/DemoModeContext';
import { GoogleAdsProvider } from './contexts/GoogleAdsContext';
import { FeatureFlagsProvider, useFeatureFlags } from './contexts/FeatureFlagsContext';
import { usePageTracking } from './hooks/usePageTracking';
import { useUserTracking } from './hooks/useUserTracking';
import HubSpotChat from './components/HubSpotChat';
import CookieConsent from './components/CookieConsent';
import InstallPWA from './components/InstallPWA';
import OnboardingModal from './components/onboarding/OnboardingModal';
import Landing from './pages/Landing';
import LandingFull from './pages/LandingFull';
import Login from './pages/Login';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import DashboardNew from './pages/DashboardNew';
import AuditPage from './pages/AuditPage';
import Copilot from './pages/Copilot';
import ReportEditor from './pages/ReportEditor';
import NewReport from './pages/NewReport';
import ReportsList from './pages/ReportsList';
import Settings from './pages/Settings';
import LegalNotices from './pages/LegalNotices';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import LanguageRedirect from './components/LanguageRedirect';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, userProfile, loading, profileLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && !profileLoading && currentUser && userProfile) {
      // Show onboarding if profile exists but onboarding not completed
      if (!userProfile.hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } else if (!loading && !profileLoading && currentUser && !userProfile) {
      // Show onboarding if no profile exists
      setShowOnboarding(true);
    }
  }, [currentUser, userProfile, loading, profileLoading]);

  if (loading || profileLoading) {
    return <div className="h-screen flex items-center justify-center text-blue-600">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/secret-login" replace />;
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
      {children}
    </>
  );
};

// Analytics tracking component
const AnalyticsTracker = () => {
  usePageTracking();
  useUserTracking();
  return null;
};

// App Routes Component - needs access to feature flags
const AppRoutes = () => {
  const { enableDashboard, enableAudit, enableReports, enableCopilot, enableFullLanding } = useFeatureFlags();

  // Determine the default route based on enabled features
  const getDefaultRoute = () => {
    if (enableReports) return 'reports';
    if (enableDashboard) return 'dashboard';
    if (enableAudit) return 'audit';
    if (enableCopilot) return 'copilot';
    return 'settings'; // Fallback to settings if nothing else is enabled
  };

  return (
    <Routes>
      {/* Language Redirects */}
      <Route path="/en" element={<LanguageRedirect targetLanguage="en" />} />
      <Route path="/fr" element={<LanguageRedirect targetLanguage="fr" />} />

      {/* Public Landing Pages */}
      <Route path="/" element={<Landing />} />
      {enableFullLanding && <Route path="/full" element={<LandingFull />} />}
      <Route path="/mentions-legales" element={<LegalNotices />} />
      <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
      <Route path="/conditions-utilisation" element={<TermsOfService />} />

      {/* Auth Pages */}
      <Route path="/secret-login" element={<Login />} />

      {/* Protected App Routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to={getDefaultRoute()} replace />} />
        {enableDashboard && <Route path="dashboard" element={<DashboardNew />} />}
        {enableDashboard && <Route path="dashboard-old" element={<Dashboard />} />}
        {enableAudit && <Route path="audit" element={<AuditPage />} />}
        {enableCopilot && <Route path="copilot" element={<Copilot />} />}
        {enableReports && <Route path="reports" element={<ReportsList />} />}
        {enableReports && <Route path="reports/new" element={<NewReport />} />}
        {enableReports && <Route path="reports/:id" element={<ReportEditor />} />}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalyticsTracker />
        <GoogleAdsProvider>
          <DemoModeProvider>
            <FeatureFlagsProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <HubSpotChat />
              <CookieConsent />
              <InstallPWA />
              <AnalyticsTracker />
              <div className="App">
                <AppRoutes />
              </div>
            </FeatureFlagsProvider>
          </DemoModeProvider>
        </GoogleAdsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

