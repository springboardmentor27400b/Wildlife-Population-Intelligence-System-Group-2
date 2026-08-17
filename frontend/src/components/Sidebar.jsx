import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  PawPrint,
  Brain,
  User,
  LogOut,
  Trees,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { AudioLines } from "lucide-react";
import { Map } from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const fullName = localStorage.getItem("full_name");
  const role = localStorage.getItem("role");
  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      name: "Survey",
      icon: <ClipboardList size={20} />,
      path: "/survey",
    },
    {
      name: "Monitoring",
      icon: <MapPinned size={20} />,
      path: "/monitoring",
    },
    {
      name: "Observations",
      icon: <PawPrint size={20} />,
      path: "/observation",
    },
    {
      name: "AI Analysis",
      icon: <Brain size={20} />,
      path: "/ai-analysis",
    },
    {
      name: "Audio Analysis",
      icon: <AudioLines size={20} />,
      path: "/audio-analysis",
    },
    {
      name: "Biodiversity Analytics",
      icon: <BarChart3 size={20} />,
      path: "/biodiversity-analytics",
    },
    {
      name: "Population Dashboard",
      icon: <BarChart3 size={20} />,
      path: "/population-dashboard",
    },
    {
    name: "Biodiversity Intelligence",
    icon: <BarChart3 size={20} />,
    path: "/biodiversity"
    },
    {
      name: "Habitat Dashboard",
      icon: <BarChart3 size={20} />,
      path: "/habitat-dashboard",
    },
    {
      name: "Conservation Dashboard",
      icon: <Trees size={20} />,
      path: "/conservation-dashboard",
    },
    {
      name: "Wildlife Health Dashboard",
      icon: <BarChart3 size={20} />,
      path: "/wildlife-health-dashboard",
    },
    {
      name: "Researcher Dashboard",
      icon: <User size={20} />,
      path: "/researcher-dashboard",
    },
    {
      name: "Conservation Officer Dashboard",
      icon: <Trees size={20} />,
      path: "/conservation-officer-dashboard"
    },
    {
      name: "Forest Department Dashboard",
      icon: <Trees size={20} />,
      path: "/forest-department-dashboard"
    },
    {
      name: "Admin Dashboard",
      icon: <User size={20} />,
      path: "/admin-dashboard"
    },
    {
      name: "Notifications&Alerts",
      icon:  "🔔",
      path: "/notifications"
    },
    {
      name: "Reports",
      icon: <ClipboardList size={20} />,  
      path: "/reports"
    },
    {
    name: "Species Map",
    icon: <Map size={20} />,
    path: "/species-map",
    },
    {
      name: "Profile",
      icon: <User size={20} />,
      path: "/profile",
    },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-green-900 text-white flex flex-col shadow-xl">

      {/* Logo */}
      <div className="border-b border-green-800">
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="bg-green-500 p-3 rounded-xl">
            <Trees size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Wildlife AI
            </h1>

            <p className="text-sm text-green-300">
              Intelligence System
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6">

        <nav>

          {menuItems.map((item) => (

            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl mb-3 transition-all duration-300 font-medium

              ${
                location.pathname === item.path
                  ? "bg-green-500 shadow-lg"
                  : "hover:bg-green-800"
              }`}
            >
              {item.icon}

              <span>{item.name}</span>

            </Link>

          ))}

        </nav>

      </div>

      {/* Bottom User */}
      <div className="border-t border-green-800 p-5">

        <div className="bg-green-800 rounded-xl p-4">

          <h2 className="text-lg font-semibold">
            {fullName || "Researcher"}
          </h2>

          <p className="text-sm text-green-300">
            {role}
          </p>

        </div>

        <button
          onClick={logout}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition-all rounded-xl py-3 font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;