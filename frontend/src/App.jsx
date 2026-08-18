import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BiodiversityAnalytics from './pages/BiodiversityAnalytics';
import Surveys from './pages/Surveys';
import Sites from './pages/Sites';
import Devices from './pages/Devices';
import Upload from './pages/Upload';
import AudioAnalysis from './pages/AudioAnalysis';
import AudioReport from './pages/AudioReport';
import Profile from './pages/Profile';
import Report from './pages/Report';
import EcosystemHealth from './pages/EcosystemHealth';
import PopulationIntelligence from './pages/PopulationIntelligence';
import BiodiversityIntelligence from './pages/BiodiversityIntelligence';
import HabitatIntelligence from './pages/HabitatIntelligence';
import ConservationRecommendations from './pages/ConservationRecommendations';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<BiodiversityAnalytics />} />
              <Route path="/population-intelligence" element={<PopulationIntelligence />} />
              <Route path="/biodiversity-intelligence" element={<BiodiversityIntelligence />} />
              <Route path="/habitat-intelligence" element={<HabitatIntelligence />} />
              <Route path="/conservation-recommendations" element={<ConservationRecommendations />} />
              <Route path="/ecosystem-health" element={<EcosystemHealth />} />
              <Route path="/surveys" element={<Surveys />} />
              <Route path="/sites" element={<Sites />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/audio-analysis" element={<Navigate to="/audio-analysis/bird-analysis" replace />} />
              <Route path="/audio-analysis/bird-analysis" element={<AudioAnalysis mode="bird" />} />
              <Route path="/audio-analysis/other-wildlife" element={<AudioAnalysis mode="wildlife" />} />
              <Route path="/audio-report" element={<AudioReport />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/report" element={<Report />} />
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
