import "./Sidebar.css";
import { NavLink } from "react-router-dom";

import {
  FaTachometerAlt,
  FaPaw,
  FaDna,
  FaCamera,
  FaMapMarkedAlt,
  FaChartLine,
  FaFileAlt,
  FaCog,
  FaRobot,
  FaMicrophone,
  FaHeartbeat,
  FaLeaf,
  FaShieldAlt,
  FaGlobe,
} from "react-icons/fa";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="logo">
        <h2>Wildlife AI</h2>
      </div>

      <ul className="menu">

        <li>
          <NavLink to="/dashboard" end>
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/population">
            <FaPaw />
            <span>Population</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/species">
            <FaDna />
            <span>Species</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/camera">
            <FaCamera />
            <span>Camera</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/monitoring">
            <FaMapMarkedAlt />
            <span>Monitoring</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/analytics">
            <FaChartLine />
            <span>Analytics</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/ai">
            <FaRobot />
            <span>AI Detection</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/audio">
            <FaMicrophone />
            <span>Bioacoustic Recognition</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/disease">
            <FaHeartbeat />
            <span>Disease Detection</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/map">
            <FaMapMarkedAlt />
            <span>Location Map</span>
          </NavLink>
        </li>

        {/* ===== Milestone 3 Modules ===== */}

        <li>
          <NavLink to="/dashboard/habitat-intelligence">
            <FaLeaf />
            <span>Habitat Intelligence</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/conservation">
            <FaShieldAlt />
            <span>Conservation</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/ecosystem-health">
            <FaGlobe />
            <span>Ecosystem Health</span>
          </NavLink>
        </li>

        {/* =============================== */}

        <li>
          <NavLink to="/dashboard/reports">
            <FaFileAlt />
            <span>Reports</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/dashboard/settings">
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;