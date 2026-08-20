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
const PopulationIntelligencePage = lazy(() => import('./pages/PopulationIntelligencePage'));
const HabitatIntelligencePage = lazy(() => import('./pages/HabitatIntelligencePage'));
const ConservationRecommendationPage = lazy(() => import('./pages/ConservationRecommendationPage'));
const EcosystemHealthPage = lazy(() => import('./pages/EcosystemHealthPage'));
const WildlifeIntelligenceDashboard = lazy(() => import('./pages/WildlifeIntelligenceDashboard'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const TestingValidationPage = lazy(() => import('./pages/TestingValidationPage'));
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
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full flex flex-col items-center">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              We encountered an unexpected error. Don't worry, you can try reloading the page.
            </p>
            {import.meta.env.MODE === 'development' && (
              <div className="w-full bg-red-50 p-4 rounded-lg text-left overflow-auto mb-6 text-xs text-red-800 font-mono max-h-32">
                {this.state.error?.toString()}
              </div>
            )}
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Retry & Reload
            </button>
          </div>
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

import { Outlet } from 'react-router-dom';

const RoleProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  
  if (!hasRouteAccess(user?.role, location.pathname)) {
    return <Navigate to="/access-denied" replace />;
  }
  
  return (
    <ErrorBoundary>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ErrorBoundary>
  );
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, y: 15 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.98, y: -15 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
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
            <Route element={<RoleProtectedRoute />}>
              <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
              <Route path="/audit-logs" element={<PageTransition><AuditLogsPage /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
              <Route path="/surveys" element={<PageTransition><SurveysPage /></PageTransition>} />
              <Route path="/sites" element={<PageTransition><SitesPage /></PageTransition>} />
              <Route path="/devices" element={<PageTransition><DevicesPage /></PageTransition>} />
              <Route path="/uploads" element={<PageTransition><UploadsPage /></PageTransition>} />
              <Route path="/observations" element={<PageTransition><ObservationsPage /></PageTransition>} />
              <Route path="/predictions" element={<PageTransition><PredictionsPage /></PageTransition>} />
              <Route path="/audio-predictions" element={<PageTransition><AudioPredictionsPage /></PageTransition>} />
              <Route path="/species-identification" element={<PageTransition><SpeciesIdentificationPage /></PageTransition>} />
              <Route path="/biodiversity-analytics" element={<PageTransition><BiodiversityAnalyticsPage /></PageTransition>} />
              <Route path="/wildlife-reports" element={<PageTransition><WildlifeReportsPage /></PageTransition>} />
              <Route path="/population-intelligence" element={<PageTransition><PopulationIntelligencePage /></PageTransition>} />
              <Route path="/habitat-intelligence" element={<PageTransition><HabitatIntelligencePage /></PageTransition>} />
              <Route path="/conservation-recommendations" element={<PageTransition><ConservationRecommendationPage /></PageTransition>} />
              <Route path="/ecosystem-health" element={<PageTransition><EcosystemHealthPage /></PageTransition>} />
              <Route path="/wildlife-dashboard" element={<PageTransition><WildlifeIntelligenceDashboard /></PageTransition>} />
              <Route path="/reports" element={<PageTransition><ReportsPage /></PageTransition>} />
              <Route path="/testing-validation" element={<PageTransition><TestingValidationPage /></PageTransition>} />
              <Route path="/map" element={<PageTransition><MapPage /></PageTransition>} />
              <Route path="/notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
              <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Router>
  );
}

export default App;
