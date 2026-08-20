import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Navbar variant="dashboard" onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <button
          type="button"
          className="dashboard-shell__backdrop d-lg-none"
          aria-label="Close sidebar overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="dashboard-shell__main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;