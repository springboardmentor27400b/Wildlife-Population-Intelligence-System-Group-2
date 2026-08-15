import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ServerError() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-destructive text-destructive-foreground shadow-glow">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h1 className="mt-6 font-display text-6xl font-bold">500</h1>
        <p className="mt-2 text-lg font-semibold">Something went wrong</p>
        <p className="mt-1 text-sm text-muted-foreground">Our servers hit an unexpected condition. Please try again shortly.</p>
        <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
          Return home
        </Link>
      </motion.div>
    </div>
  );
}
