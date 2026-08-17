import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Survey from "./pages/Survey";
import Monitoring from "./pages/Monitoring";
import Observation from "./pages/Observation";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AIAnalysis from "./pages/AIAnalysis";
import BiodiversityAnalytics from "./pages/BiodiversityAnalytics";
import AudioAnalysis from "./pages/AudioAnalysis";
import PopulationDashboard from "./pages/PopulationDashboard";
import SpeciesDistributionMap from "./pages/SpeciesDistributionMap";
import BiodiversityDashboard from "./pages/BiodiversityDashboard";
import HabitatDashboard from "./pages/HabitatDashboard";
import ConservationDashboard from "./pages/ConservationDashboard";
import WildlifeHealthDashboard from "./pages/WildlifeHealthDashboard";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import ConservationOfficerDashboard from "./pages/ConservationOfficerDashboard";
import ForestDepartmentDashboard from "./pages/ForestDepartmentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotificationAlerts from "./pages/NotificationAlerts";
import Reports from "./pages/Reports";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/survey" element={<Survey />} />

        <Route path="/monitoring" element={<Monitoring />} />

        <Route path="/observation" element={<Observation />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="*" element={<NotFound />} />
      
        <Route
                path="/ai-analysis" element={<AIAnalysis />}
        />
        <Route
                path="/biodiversity-analytics" element={<BiodiversityAnalytics />}
        />
        <Route
        path="/audio-analysis"
        element={< AudioAnalysis />}
        />
        <Route
        path="/population-dashboard"
        element={<PopulationDashboard />}
        />
        <Route
        path="/biodiversity"
        element={<BiodiversityDashboard />}
        />
        <Route
          path="/species-map"
          element={<SpeciesDistributionMap />}
        />
        <Route
          path="/habitat-dashboard"
          element={<HabitatDashboard />}
        />
        <Route
          path="/conservation-dashboard"
          element={<ConservationDashboard />}
        />
        <Route
          path="/wildlife-health-dashboard"
          element={<WildlifeHealthDashboard />}
        />
        <Route
          path="/researcher-dashboard"
          element={<ResearcherDashboard />}
        />
        <Route
          path="/conservation-officer-dashboard"
          element={<ConservationOfficerDashboard />}
        />
        <Route
          path="/forest-department-dashboard"
          element={<ForestDepartmentDashboard />}
        />
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/notifications"
          element={<NotificationAlerts />}
        />
        <Route
          path="/reports"
          element={<Reports />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
