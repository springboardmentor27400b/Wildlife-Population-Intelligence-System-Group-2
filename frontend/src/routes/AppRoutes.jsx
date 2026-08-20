import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import Species from "../pages/Species";
import Observation from "../pages/Observation";
import Survey from "../pages/Survey";
import ImageAnalysis from "../pages/ImageAnalysis";
import AudioAnalysis from "../pages/AudioAnalysis";
import SpeciesClassification from "../pages/SpeciesClassification";
import BiodiversityAnalytics from "../pages/BiodiversityAnalytics";
import PopulationEstimation from "../pages/PopulationEstimation";
import BiodiversityIntelligence from "../pages/BiodiversityIntelligence";
import HabitatIntelligence from "../pages/HabitatIntelligence";
import ConservationRecommendation from "../pages/ConservationRecommendation";
import WildlifeHealth from "../pages/WildlifeHealth";
import Reports from "../pages/Reports";

import PopulationAnalytics from "../pages/PopulationAnalytics";
import Notifications from "../pages/Notifications";

import ThreatMonitoring from "../pages/ThreatMonitoring";
import ConservationPriorities from "../pages/ConservationPriorities";
import SpeciesTrends from "../pages/SpeciesTrends";
import RestorationRecommendations from "../pages/RestorationRecommendations";

import ProtectedAreaMonitoring from "../pages/ProtectedAreaMonitoring";
import WildlifeMovement from "../pages/WildlifeMovement";
import PatrolPlanning from "../pages/PatrolPlanning";
import IncidentReports from "../pages/IncidentReports";

import AdminUsers from "../pages/AdminUsers";
import PlatformAnalytics from "../pages/PlatformAnalytics";
import MonitoringManagement from "../pages/MonitoringManagement";
import ReportGeneration from "../pages/ReportGeneration";

function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Login/Register */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/species" element={<Species />} />
        <Route path="/observation" element={<Observation />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/image-analysis" element={<ImageAnalysis />} />
        <Route path="/audio-analysis" element={<AudioAnalysis />} />
        <Route
            path="/species-classification"
            element={<SpeciesClassification />}
        />
        <Route
            path="/biodiversity"
            element={<BiodiversityAnalytics />}
        />
        <Route
            path="/population"
            element={<PopulationEstimation />}
        />
        <Route
            path="/biodiversity-intelligence"
            element={<BiodiversityIntelligence />}
        />
        <Route
            path="/habitat"
            element={<HabitatIntelligence />}
        />
        <Route
            path="/conservation"
            element={<ConservationRecommendation/>}
        />
        <Route
            path="/health"
            element={<WildlifeHealth/>}
        />


        <Route
          path="/population-analytics"
          element={<PopulationAnalytics />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/threat-monitoring"
          element={<ThreatMonitoring />}
        />

        <Route
          path="/conservation-priorities"
          element={<ConservationPriorities />}
        />

        <Route
          path="/species-trends"
          element={<SpeciesTrends />}
        />

        <Route
          path="/restoration-recommendations"
          element={<RestorationRecommendations />}
        />

        <Route
          path="/protected-area-monitoring"
          element={<ProtectedAreaMonitoring />}
        />

        <Route
          path="/wildlife-movement"
          element={<WildlifeMovement />}
        />

        <Route
          path="/patrol-planning"
          element={<PatrolPlanning />}
        />

        <Route
          path="/incident-reports"
          element={<IncidentReports />}
        />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/analytics" element={<PlatformAnalytics />} />
        <Route path="/admin/monitoring" element={<MonitoringManagement />} />
        <Route
          path="/reports"
          element={<ReportGeneration />}
        />
      </Route>

    </Routes>
  );
}

export default AppRoutes;