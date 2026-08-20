import { NavLink } from "react-router-dom";
import {
  FaChevronLeft,
  FaLeaf,
  FaPaw,
  FaBinoculars,
  FaHome,
  FaClipboardList,
  FaCamera,
  FaMicrophone,
  FaFingerprint,
  FaChartBar,
  FaUsers,
  FaTree,
  FaHeartbeat,
  FaFileAlt,
  FaRoute,
  FaExclamationTriangle,
} from "react-icons/fa";

const sidebarItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: FaHome,
    end: true,
  },

  {
    to: "/species",
    label: "Species",
    icon: FaPaw,
  },

  {
    to: "/observation",
    label: "Observations",
    icon: FaBinoculars,
  },

  {
    to: "/survey",
    label: "Survey Management",
    icon: FaClipboardList,
  },

  {
    to: "/image-analysis",
    label: "Image Analysis",
    icon: FaCamera,
  },

  {
    to: "/species-classification",
    label: "Species Classification",
    icon: FaFingerprint,
  },

  {
    to: "/audio-analysis",
    label: "Bioacoustic Recognition",
    icon: FaMicrophone,
  },

  {
    to: "/biodiversity",
    label: "Biodiversity Analytics",
    icon: FaChartBar,
  },

  {
    to: "/population",
    label: "Population Estimation",
    icon: FaUsers,
  },

  {
    to: "/biodiversity-intelligence",
    label: "Biodiversity Intelligence",
    icon: FaLeaf,
  },

  {
    to: "/habitat",
    label: "Habitat Intelligence",
    icon: FaTree,
  },

  {
    to: "/conservation",
    label: "Conservation Recommendation",
    icon: FaLeaf,
  },

  {
    to: "/health",
    label: "Wildlife Health",
    icon: FaHeartbeat,
  },

  {
    to: "/protected-area-monitoring",
    label: "Protected Area Monitoring",
    icon: FaTree,
  },

  {
    to: "/wildlife-movement",
    label: "Wildlife Movement Analysis",
    icon: FaRoute,
  },

  // Available for ALL logged-in users
  {
    to: "/patrol-planning",
    label: "Patrol Planning",
    icon: FaRoute,
  },

  // Available for ALL logged-in users
  {
    to: "/incident-reports",
    label: "Incident Reports",
    icon: FaExclamationTriangle,
  },

  {
    to: "/reports",
    label: "Reports & Export",
    icon: FaFileAlt,
  },
];

function Sidebar({ open = true, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <aside className={`app-sidebar ${open ? "is-open" : ""}`}>

      <div className="app-sidebar__header">

        <div className="brand-lockup brand-lockup--sidebar">

          <span className="brand-lockup__icon">
            <FaLeaf />
          </span>

          <span className="brand-lockup__copy">
            <strong>Wildlife AI</strong>
            <small>Conservation Console</small>
          </span>

        </div>

        <button
          type="button"
          className="icon-button d-lg-none"
          onClick={onClose}
        >
          <FaChevronLeft />
        </button>

      </div>

      <div className="app-sidebar__panel">

        <div className="app-sidebar__user">

          <div className="app-sidebar__avatar">
            {user?.full_name?.charAt(0)?.toUpperCase() || "W"}
          </div>

          <div>
            <strong>
              {user?.full_name || "Wildlife Operator"}
            </strong>

            <small>
              {user?.role || "Secure access"}
            </small>
          </div>

        </div>

        <div className="sidebar-group">

          <div className="sidebar-group__label">
            Navigation
          </div>

          <div className="sidebar-links">

            {sidebarItems.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive
                      ? "sidebar-link sidebar-link--active"
                      : "sidebar-link"
                  }
                >

                  <Icon className="sidebar-link__icon" />

                  <span>{item.label}</span>

                </NavLink>
              );

            })}

          </div>

        </div>

        <div className="sidebar-group sidebar-group--meta">

          <div className="sidebar-group__label">
            Operations
          </div>

          <div className="sidebar-note">
            Dashboard analytics, species tracking, protected
            area monitoring, wildlife movement, patrol planning,
            incident reporting, image analysis, species
            classification, bioacoustic recognition, and
            conservation monitoring are organized here for
            fast access.
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;