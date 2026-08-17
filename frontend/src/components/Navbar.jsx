import { Bell, LogOut, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const fullName = localStorage.getItem("full_name") || "Researcher";
  const role = localStorage.getItem("role") || "User";
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <nav className="fixed top-0 left-72 right-0 h-20 bg-green-900 shadow-md z-50">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            {greeting}, {fullName} 👋
          </h2>

          <p className="text-green-100 text-sm">
            Welcome to Wildlife Population Intelligence System
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          {/* Notification */}
          <button className="relative p-2 rounded-full hover:bg-green-800 transition">
            <Bell size={24} className="text-white" />

            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
              3
            </span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3">
            <UserCircle2 size={44} className="text-white" />

            <div>
              <h3 className="font-semibold text-white">
                {fullName}
              </h3>

              <p className="text-xs text-green-200">
                {role}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;