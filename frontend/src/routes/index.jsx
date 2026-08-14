import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../layouts/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

// Import Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

import SurveyList from '../pages/SurveyList';
import SurveyDetail from '../pages/SurveyDetail';
import SurveyForm from '../pages/SurveyForm';

import MonitoringSiteList from '../pages/MonitoringSiteList';
import MonitoringSiteDetail from '../pages/MonitoringSiteDetail';
import MonitoringSiteForm from '../pages/MonitoringSiteForm';

import CameraTrapList from '../pages/CameraTrapList';
import CameraTrapDetail from '../pages/CameraTrapDetail';
import CameraTrapForm from '../pages/CameraTrapForm';

import AudioSensorList from '../pages/AudioSensorList';
import AudioSensorDetail from '../pages/AudioSensorDetail';
import AudioSensorForm from '../pages/AudioSensorForm';

import ObservationList from '../pages/ObservationList';
import ObservationDetail from '../pages/ObservationDetail';
import ObservationForm from '../pages/ObservationForm';

import Reports from '../pages/Reports';
import EcologicalAnalysis from '../pages/EcologicalAnalysis';
import ResearchDashboard from '../pages/ResearchDashboard';
import MapVisualization from '../pages/MapVisualization';
import SpeciesRecognition from '../pages/SpeciesRecognition';
import AudioAnalysis from '../pages/AudioAnalysis';
import HabitatIntelligence from '../pages/HabitatIntelligence';
import ConservationRecommendation from '../pages/ConservationRecommendation';
import EcosystemHealth from '../pages/EcosystemHealth';
import Notifications from '../pages/Notifications';

export const AppRoutes = () => {
  const allRoles = ['Administrator', 'Wildlife Researcher', 'Conservation Officer', 'Forest Department Officer'];
  const editRoles = ['Administrator', 'Wildlife Researcher']; // Surveys, Sites, Equipment
  const observationCreateRoles = ['Administrator', 'Wildlife Researcher', 'Forest Department Officer'];
  const observationEditRoles = ['Administrator', 'Wildlife Researcher', 'Conservation Officer'];

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/not-found" element={<NotFound />} />

      {/* Protected Routes inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Surveys */}
        <Route path="surveys" element={<SurveyList />} />
        <Route path="surveys/:id" element={<SurveyDetail />} />
        <Route
          path="surveys/new"
          element={
            <ProtectedRoute allowedRoles={editRoles}>
              <SurveyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="surveys/edit/:id"
          element={
            <ProtectedRoute allowedRoles={editRoles}>
              <SurveyForm />
            </ProtectedRoute>
          }
        />

        {/* Monitoring Sites */}
        <Route path="monitoring-sites" element={<MonitoringSiteList />} />
        <Route path="monitoring-sites/:id" element={<MonitoringSiteDetail />} />
        <Route
          path="monitoring-sites/new"
          element={
            <ProtectedRoute allowedRoles={editRoles}>
              <MonitoringSiteForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="monitoring-sites/edit/:id"
          element={
            <ProtectedRoute allowedRoles={editRoles}>
              <MonitoringSiteForm />
            </ProtectedRoute>
          }
        />

        {/* Camera Traps */}
        <Route path="camera-traps" element={<CameraTrapList />} />
        <Route path="camera-traps/:id" element={<CameraTrapDetail />} />
        <Route
          path="camera-traps/new"
          element={
            <ProtectedRoute allowedRoles={editRoles}>
              <CameraTrapForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="camera-traps/edit/:id"
          element={
            <ProtectedRoute allowedRoles={editRoles}>
              <CameraTrapForm />
            </ProtectedRoute>
          }
        />

        {/* Audio Sensors */}
        <Route path="audio-sensors" element={<AudioSensorList />} />
        <Route path="audio-sensors/:id" element={<AudioSensorDetail />} />
        <Route
          path="audio-sensors/new"
          element={
            <ProtectedRoute allowedRoles={editRoles}>
              <AudioSensorForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="audio-sensors/edit/:id"
          element={
            <ProtectedRoute allowedRoles={editRoles}>
              <AudioSensorForm />
            </ProtectedRoute>
          }
        />

        {/* Observations */}
        <Route path="observations" element={<ObservationList />} />
        <Route path="observations/:id" element={<ObservationDetail />} />
        <Route
          path="observations/new"
          element={
            <ProtectedRoute allowedRoles={observationCreateRoles}>
              <ObservationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="observations/edit/:id"
          element={
            <ProtectedRoute allowedRoles={observationEditRoles}>
              <ObservationForm />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route path="reports" element={<Reports />} />

        {/* Notifications */}
        <Route path="notifications" element={<Notifications />} />

        {/* Ecological Analysis */}
        <Route path="ecological" element={<EcologicalAnalysis />} />

        {/* Research Trends Dashboard */}
        <Route path="research-trends" element={<ResearchDashboard />} />

        {/* Spatial Maps */}
        <Route path="map" element={<MapVisualization />} />

        {/* Profile */}
        <Route path="profile" element={<Profile />} />

        {/* AI Species Intelligence Workspaces */}
        <Route path="species-recognition" element={<SpeciesRecognition />} />
        <Route path="audio-analysis" element={<AudioAnalysis />} />

        {/* Wildlife Intelligence Dashboards */}
        <Route path="habitat" element={<HabitatIntelligence />} />
        <Route path="conservation" element={<ConservationRecommendation />} />
        <Route path="ecosystem-health" element={<EcosystemHealth />} />
      </Route>

      {/* Fallback to not-found */}
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
};
export default AppRoutes;
