import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PublicLayout() {
  return (
    <div className="app-shell app-shell--public">
      <Navbar variant="public" />
      <main className="app-main app-main--public">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;