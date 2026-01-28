import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DemoModeProvider } from './contexts/DemoModeContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { GoogleAdsProvider } from './contexts/GoogleAdsContext';


import { FeatureFlagsProvider, useFeatureFlags } from './contexts/FeatureFlagsContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { usePageTracking } from './hooks/usePageTracking';
import { useUserTracking } from './hooks/useUserTracking';
import HubSpotChat from './components/HubSpotChat';
import CookieConsent from './components/CookieConsent';
import InstallPWA from './components/InstallPWA';
import OnboardingModal from './components/onboarding/OnboardingModal';
import OfflineAlert from './components/common/OfflineAlert';
import SEO from './components/SEO';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import Landing from './pages/Landing';
import LandingFull from './pages/LandingFull';
import Login from './pages/Login';
import AppLayout from './layouts/AppLayout';
import PublicLayout from './layouts/PublicLayout';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import DashboardNew from './pages/DashboardNew';
import AuditPage from './pages/AuditPage';
import Copilot from './pages/Copilot';
import ReportEditor from './pages/ReportEditor';
import TiptapReportEditorPage from './pages/TiptapReportEditorPage';
import NewReport from './pages/NewReport';
import ReportsList from './pages/ReportsList';
import Templates from './pages/Templates';
import ScheduledReports from './pages/ScheduledReports';
import PublicReportView from './pages/PublicReportView';
import Settings from './pages/Settings';
import BillingPage from './pages/BillingPage';
import ThemesPage from './pages/ThemesPage';
import LegalNotices from './pages/LegalNotices';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Sitemap from './pages/Sitemap';
import NotFound from './pages/NotFound';
import ClientsPage from './pages/ClientsPage';
import ClientEditPage from './pages/ClientEditPage';
import ReportPreview from './pages/ReportPreview';
import TiptapTemplateEditorPage from './pages/TiptapTemplateEditorPage';
import GoogleAdsPlayground from './pages/GoogleAdsPlayground';
import ComparisonIndex from './pages/alternatives/ComparisonIndex';
import ComparisonPage from './pages/alternatives/ComparisonPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, userProfile, loading, profileLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    // Only trigger onboarding check if we are online
    // If we are offline, we can't be sure if the user has a profile or not
    if (!isOnline) {
      return;
    }

    if (!loading && !profileLoading && currentUser && userProfile) {
      // Show onboarding if profile exists but onboarding not completed
      if (!userProfile.hasCompletedOnboarding) {
        setShowOnboarding(true);
      } else {
        // Ensure onboarding is hidden if checks pass
        setShowOnboarding(false);
      }
    } else if (!loading && !profileLoading && currentUser && !userProfile) {
      // Show onboarding if no profile exists
      setShowOnboarding(true);
    }
  }, [currentUser, userProfile, loading, profileLoading, isOnline]);

  if (loading || profileLoading) {
    return <div className="h-screen flex items-center justify-center text-blue-600">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
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

  const renderPublicRoutes = (lang?: 'en' | 'fr') => (
    <Route element={<PublicLayout lang={lang} />}>
      {enableFullLanding && <Route path="full" element={<LandingFull />} />}
      <Route path="legal-notices" element={<LegalNotices />} />
      <Route path="privacy-policy" element={<PrivacyPolicy />} />
      <Route path="terms-of-service" element={<TermsOfService />} />
      <Route path="alternatives" element={<ComparisonIndex />} />
      <Route path="alternatives/:slug" element={<ComparisonPage />} />
      <Route path="sitemap" element={<Sitemap />} />
      <Route path="login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  );

  return (
    <Routes>
      {/* Root English Silo */}
      <Route path="/" element={<Landing />} />
      {renderPublicRoutes('en')}

      {/* French Silo */}
      <Route path="/fr">
        <Route index element={<Landing />} />
        {renderPublicRoutes('fr')}
      </Route>

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
        {enableReports && <Route path="templates" element={<Templates />} />}
        {enableReports && <Route path="schedules" element={<ScheduledReports />} />}
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<ClientEditPage />} />
        <Route path="clients/:id" element={<ClientEditPage />} />
        <Route path="themes" element={<ThemesPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="playground" element={<GoogleAdsPlayground />} />
      </Route>

      {/* Report Editor - Full Page (No AppLayout) - Tiptap is now default */}
      {enableReports && (
        <Route path="/app/reports/:id" element={
          <ProtectedRoute>
            <TiptapReportEditorPage />
          </ProtectedRoute>
        } />
      )}

      {/* Legacy Report Editor - Fallback for old slide-based reports */}
      {enableReports && (
        <Route path="/app/reports/legacy/:id" element={
          <ProtectedRoute>
            <ReportEditor />
          </ProtectedRoute>
        } />
      )}

      {/* Report Preview - Full Page (No AppLayout) */}
      {enableReports && (
        <Route path="/app/reports/:reportId/preview" element={
          <ProtectedRoute>
            <ReportPreview />
          </ProtectedRoute>
        } />
      )}

      {/* Template Editor - Full Page (No AppLayout) - Using new Tiptap Editor */}
      {enableReports && (
        <Route path="/app/templates/editor/:id" element={
          <ProtectedRoute>
            <TiptapTemplateEditorPage />
          </ProtectedRoute>
        } />
      )}

      {/* OAuth Callback - Protected */}
      <Route path="/oauth/callback" element={
        <ProtectedRoute>
          <OAuthCallback />
        </ProtectedRoute>
      } />

      {/* Public Report View - No authentication required */}
      <Route path="/:username/reports/:reportId" element={<PublicReportView />} />

      {/* Legacy French routes - redirect to new routes */}
      <Route path="/mentions-legales" element={<Navigate to="/legal-notices" replace />} />
      <Route path="/politique-confidentialite" element={<Navigate to="/privacy-policy" replace />} />
      <Route path="/conditions-utilisation" element={<Navigate to="/terms-of-service" replace />} />
    </Routes>
  );
};

const AppContent = () => {
  const isOnline = useNetworkStatus();

  return (
    <>
      <SEO />
      <OfflineAlert isOnline={isOnline} />
      <AppRoutes />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalyticsTracker />
        <SubscriptionProvider>
          <GoogleAdsProvider>
            <TutorialProvider>
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
                    <AppContent />
                  </div>
                </FeatureFlagsProvider>
              </DemoModeProvider>
            </TutorialProvider>
          </GoogleAdsProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

