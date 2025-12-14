import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DemoModeProvider } from './contexts/DemoModeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import DashboardNew from './pages/DashboardNew';
import AuditPage from './pages/AuditPage';
import Copilot from './pages/Copilot';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import LegalNotices from './pages/LegalNotices';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import OAuthCallback from './pages/OAuthCallback';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-blue-600">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/secret-login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DemoModeProvider>
          <div className="App">
            <Routes>
              {/* Public Landing Pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/mentions-legales" element={<LegalNotices />} />
              <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
              <Route path="/conditions-utilisation" element={<TermsOfService />} />

              {/* Auth Pages */}
              <Route path="/secret-login" element={<Login />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />

              {/* Protected App Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardNew />} />
                <Route path="dashboard-old" element={<Dashboard />} />
                <Route path="audit" element={<AuditPage />} />
                <Route path="copilot" element={<Copilot />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </DemoModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
