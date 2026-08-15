import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl gradient-primary text-primary-foreground shadow-glow">
          <Compass className="h-12 w-12" />
        </div>
        <h1 className="mt-6 font-display text-6xl font-bold">404</h1>
        <p className="mt-2 text-lg font-semibold">This trail leads nowhere</p>
        <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist or was moved.</p>
        <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
          Return home
        </Link>
      </motion.div>
    </div>
  );
}
