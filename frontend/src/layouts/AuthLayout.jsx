import { Outlet, Link } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";
import ThemeToggle from "../components/ThemeToggle";

function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-shell__glow auth-shell__glow--one" />
      <div className="auth-shell__glow auth-shell__glow--two" />

      <div className="auth-shell__topbar">
        <Link className="auth-shell__brand" to="/">
          <span className="auth-shell__brand-mark">
            <FaLeaf />
          </span>
          <span>
            <strong>Wildlife AI</strong>
            <small>Secure access portal</small>
          </span>
        </Link>

        <ThemeToggle />
      </div>

      <div className="auth-shell__content">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;