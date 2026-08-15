import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { motion } from "framer-motion";
import { useState } from "react";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </motion.main>
        <footer className="border-t border-border/60 bg-card/40 px-6 py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} WildSight — AI Wildlife Biodiversity Monitoring
        </footer>
      </div>
    </div>
  );
}
