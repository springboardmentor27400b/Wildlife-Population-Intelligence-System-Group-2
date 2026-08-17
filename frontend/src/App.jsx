import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Audio from "./pages/Audio";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Population from "./pages/Population";
import Species from "./pages/Species";
import Camera from "./pages/Camera";
import Monitoring from "./pages/Monitoring";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AI from "./pages/AI";
import Map from "./pages/Map";
import DiseaseDetection from "./pages/DiseaseDetection";

import HabitatIntelligence from "./pages/HabitatIntelligence";
import Conservation from "./pages/Conservation";
import EcosystemHealth from "./pages/EcosystemHealth";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Public Routes */}

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Dashboard */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="population" element={<Population />} />

        <Route path="species" element={<Species />} />

        <Route path="camera" element={<Camera />} />

        <Route path="monitoring" element={<Monitoring />} />

        <Route path="analytics" element={<Analytics />} />

        <Route path="ai" element={<AI />} />

        <Route path="audio" element={<Audio />} />

        <Route path="disease" element={<DiseaseDetection />} />

        <Route path="map" element={<Map />} />

        {/* ===== Milestone 3 ===== */}

        <Route
          path="habitat-intelligence"
          element={<HabitatIntelligence />}
        />

        <Route
          path="conservation"
          element={<Conservation />}
        />

        <Route
          path="ecosystem-health"
          element={<EcosystemHealth />}
        />

        {/* ===================== */}

        <Route path="reports" element={<Reports />} />

        <Route path="settings" element={<Settings />} />

      </Route>

    </Routes>
  );
}

export default App;