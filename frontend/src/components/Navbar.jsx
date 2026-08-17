import "../styles/Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <div className="logo">
        🦌 WPIS
      </div>

      <ul>
        <li><Link to="/">Home</Link></li>
       <li>
  <Link to="/dashboard">Dashboard</Link>
</li>
        <li>Species</li>
        <li>Reports</li>
      </ul>

      <Link to="/login">
  <button className="login-btn">
    Login
  </button>
</Link>
    </nav>
  );
}

export default Navbar;