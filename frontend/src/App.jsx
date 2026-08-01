import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Map, MapPin, Camera, UploadCloud, ClipboardList, Settings } from 'lucide-react';
import { hasRouteAccess } from './config/rolePermissions';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
const SurveysPage = lazy(() => import('./pages/SurveysPage'));
const SitesPage = lazy(() => import('./pages/SitesPage'));
const DevicesPage = lazy(() => import('./pages/DevicesPage'));
const UploadsPage = lazy(() => import('./pages/UploadsPage'));
const ObservationsPage = lazy(() => import('./pages/ObservationsPage'));
const PredictionsPage = lazy(() => import('./pages/PredictionsPage'));
const AudioPredictionsPage = lazy(() => import('./pages/AudioPredictionsPage'));
const SpeciesIdentificationPage = lazy(() => import('./pages/SpeciesIdentificationPage'));
const BiodiversityAnalyticsPage = lazy(() => import('./pages/BiodiversityAnalyticsPage'));
const WildlifeReportsPage = lazy(() => import('./pages/WildlifeReportsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
          <button onClick={() => window.location.href = '/dashboard'} className="px-4 py-2 bg-primary text-white rounded-lg">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-10 w-10 text-primary animate-spin" />
  </div>
);

const RoleProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  
  if (!hasRouteAccess(user?.role, location.pathname)) {
    return <Navigate to="/access-denied" replace />;
  }
  
  return <ErrorBoundary><MainLayout>{children}</MainLayout></ErrorBoundary>;
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
            
            {/* Protected Routes */}
            <Route path="/access-denied" element={<PageTransition><AccessDeniedPage /></PageTransition>} />
            <Route path="/dashboard" element={
              <RoleProtectedRoute>
                <PageTransition><DashboardPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/audit-logs" element={
              <RoleProtectedRoute>
                <PageTransition><AuditLogsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/profile" element={
              <RoleProtectedRoute>
                <PageTransition><ProfilePage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/surveys" element={
              <RoleProtectedRoute>
                <PageTransition><SurveysPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/sites" element={
              <RoleProtectedRoute>
                <PageTransition><SitesPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/devices" element={
              <RoleProtectedRoute>
                <PageTransition><DevicesPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/uploads" element={
              <RoleProtectedRoute>
                <PageTransition><UploadsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/observations" element={
              <RoleProtectedRoute>
                <PageTransition><ObservationsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/predictions" element={
              <RoleProtectedRoute>
                <PageTransition><PredictionsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/audio-predictions" element={
              <RoleProtectedRoute>
                <PageTransition><AudioPredictionsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/species-identification" element={
              <RoleProtectedRoute>
                <PageTransition><SpeciesIdentificationPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/biodiversity-analytics" element={
              <RoleProtectedRoute>
                <PageTransition><BiodiversityAnalyticsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/wildlife-reports" element={
              <RoleProtectedRoute>
                <PageTransition><WildlifeReportsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/reports" element={
              <RoleProtectedRoute>
                <PageTransition><ReportsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/map" element={
              <RoleProtectedRoute>
                <PageTransition><MapPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/notifications" element={
              <RoleProtectedRoute>
                <PageTransition><NotificationsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
            <Route path="/settings" element={
              <RoleProtectedRoute>
                <PageTransition><SettingsPage /></PageTransition>
              </RoleProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Router>
  );
}

export default App;
