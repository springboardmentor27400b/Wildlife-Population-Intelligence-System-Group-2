import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, Home } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl gradient-primary text-primary-foreground shadow-glow">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h1 className="mt-6 font-display text-6xl font-bold">403</h1>
        <p className="mt-2 text-lg font-semibold">Access forbidden</p>
        <p className="mt-1 text-sm text-muted-foreground">Your role doesn't have permission to view this page. Please contact your administrator if you believe this is a mistake.</p>
        <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
          <Home className="h-4 w-4" /> Back to dashboard
        </Link>
      </motion.div>
    </div>
  );
}
