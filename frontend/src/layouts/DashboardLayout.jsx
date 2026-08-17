import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7f5",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        style={{
          marginLeft: "260px",
          width: "calc(100% - 260px)",
          minHeight: "100vh",
          overflowY: "auto",
          padding: "25px",
          boxSizing: "border-box",
          background: "#f5f7f5",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;