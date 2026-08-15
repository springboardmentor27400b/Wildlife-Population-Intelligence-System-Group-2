import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import UploadImages from "@/pages/UploadImages";
import UploadAudio from "@/pages/UploadAudio";
import Reports from "@/pages/Reports";
import ReportExports from "@/pages/ReportExports";
import Forbidden from "@/pages/errors/Forbidden";
import NotFound from "@/pages/errors/NotFound";
import ServerError from "@/pages/errors/ServerError";
import { CrudPage } from "@/pages/CrudPage";
import { modules } from "@/config/modules";
import Analytics from "./pages/Analytics";
import BiodiversityIntelligence from "./pages/BiodiversityIntelligence";
import PopulationIntelligence
from "./pages/PopulationIntelligence";
import HabitatIntelligence from "./pages/HabitatIntelligence";
import ConservationIntelligence from "./pages/ConservationIntelligence";
import SurveyIntelligence from "./pages/SurveyIntelligence";
import WildlifeHealthScore from "./pages/WildlifeHealthScore";
  
export function ClientApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="/500" element={<ServerError />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/upload-images" element={<UploadImages />} />
                <Route path="/upload-audio" element={<UploadAudio />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/report-exports" element={<ReportExports />} />

                <Route 
   path="/analytics" 
   element={<Analytics/>}

/><Route

path="/population"

element={<PopulationIntelligence/>}

/>
<Route
 path="/biodiversity-intelligence"
 element={<BiodiversityIntelligence />}
/>
<Route
    path="/habitat-intelligence"
    element={<HabitatIntelligence/>}
/>
<Route
    path="/conservation-intelligence"
    element={<ConservationIntelligence/>}
/>
<Route
 path="/survey-intelligence"
 element={<SurveyIntelligence/>}
/>
<Route
    path="/health-score"
    element={<WildlifeHealthScore />}
/>
                {modules.map((m) => (
                  <Route
                    key={m.path}
                    path={m.path}
                    element={
                      <ProtectedRoute roles={m.roles}>
                        <CrudPage module={m} />
                      </ProtectedRoute>
                    }
                  />
                ))}
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
