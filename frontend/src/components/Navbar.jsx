import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaLeaf,
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
} from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

function Navbar({ variant = "public", onMenuClick }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthenticated = Boolean(token && user);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const protectedLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/species", label: "Species" },
    { to: "/observation", label: "Observation" },
  ];

  return (
    <header className={`topbar topbar--${variant}`}>
      {/* =====================================================
          BRAND / LEFT SIDE
      ====================================================== */}
      <div className="topbar__brand-group">
        {variant === "dashboard" && (
          <button
            type="button"
            className="icon-button topbar__menu-button d-lg-none"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        )}

        <Link className="brand-lockup" to="/">
          <span className="brand-lockup__icon">
            <FaLeaf />
          </span>

          <span className="brand-lockup__copy">
            <strong>Wildlife AI</strong>
            <small>Population Intelligence</small>
          </span>
        </Link>

        {variant === "dashboard" && (
          <span className="topbar__tag d-none d-md-inline-flex">
            Enterprise Dashboard
          </span>
        )}
      </div>

      {/* =====================================================
          PUBLIC NAVIGATION
      ====================================================== */}
      {variant === "public" && (
        <nav className="topbar__nav">
          {publicLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "nav-pill nav-pill--active"
                  : "nav-pill"
              }
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated &&
            protectedLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "nav-pill nav-pill--active"
                    : "nav-pill"
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
      )}

      {/* =====================================================
          RIGHT SIDE ACTIONS
      ====================================================== */}
      <div className="topbar__actions">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* =================================================
            NOTIFICATION BELL
        ================================================== */}
        {isAuthenticated && (
          <button
            type="button"
            className="notification-button"
            onClick={() => navigate("/notifications")}
            title="Notifications"
            aria-label="Open notifications"
          >
            <FaBell />
          </button>
        )}

        {/* =================================================
            PROFILE / LOGIN
        ================================================== */}
        <button
          className="profile-chip"
          onClick={() => {
            if (isAuthenticated) {
              if (
                window.confirm(
                  "Are you sure you want to logout?"
                )
              ) {
                logout();
              }
            } else {
              navigate("/login");
            }
          }}
          type="button"
        >
          <FaUserCircle
            className="profile-chip__icon"
            size={22}
          />

          <span className="profile-chip__copy">
            <strong>
              {isAuthenticated
                ? user.full_name
                : "Login"}
            </strong>

            <small>
              {isAuthenticated
                ? user.role
                : "Access portal"}
            </small>
          </span>

          {isAuthenticated && (
            <FaSignOutAlt
              className="profile-chip__logout"
            />
          )}
        </button>
      </div>
    </header>
  );
}

export default Navbar;