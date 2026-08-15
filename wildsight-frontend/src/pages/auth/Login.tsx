import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, Feather, Leaf, Loader2, Mail, Lock } from "lucide-react";

interface FormValues { email: string; password: string; remember: boolean; }

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { email: "", password: "", remember: true },
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    try {
      await login(v.email, v.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Invalid email or password");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Left: hero illustration */}
      <div className="relative hidden overflow-hidden gradient-hero lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-white">
        <div className="absolute inset-0 -z-0 opacity-40">
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20 blur-2xl"
              style={{
                width: 40 + (i * 13) % 90, height: 40 + (i * 17) % 90,
                left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`,
              }}
              animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
              transition={{ duration: 6 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
            />
          ))}
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <Feather className="h-6 w-6" />
          </div>
          <div className="font-display text-xl font-bold">WildSight</div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 max-w-lg">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Leaf className="h-3.5 w-3.5" /> AI-Powered Biodiversity Intelligence
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
            Protect wildlife with data-driven insight.
          </h2>
          <p className="mt-4 text-white/85">
            Track species, monitor habitats and coordinate conservation across your entire field operation — from a single premium dashboard.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { k: "128+", l: "Species tracked" },
              { k: "42", l: "Active surveys" },
              { k: "98%", l: "Data accuracy" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="font-display text-2xl font-bold">{s.k}</div>
                <div className="text-xs text-white/75">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="relative z-10 text-xs text-white/70">© {new Date().getFullYear()} WildSight — Conservation, elevated.</div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 font-display text-xl font-bold">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground"><Feather className="h-5 w-5" /></div>
              WildSight
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your biodiversity mission.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })}
                  type="email" placeholder="you@wildsight.io"
                  className="h-11 w-full rounded-xl border border-border/60 bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </div>
              {errors.email && <p className="mt-1 animate-in fade-in text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } })}
                  type={showPass ? "text" : "password"} placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-border/60 bg-card pl-10 pr-10 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
                <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <label className="flex select-none items-center gap-2 text-sm">
              <input type="checkbox" {...register("remember")} className="h-4 w-4 rounded border-border accent-primary" />
              Remember me
            </label>

            <motion.button whileTap={{ scale: 0.98 }} disabled={loading}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-primary font-semibold text-primary-foreground shadow-soft transition hover:shadow-glow disabled:opacity-70">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign in"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">Create one</Link>
          </p>
          <p className="mt-10 text-center text-xs text-muted-foreground">
            Protected by JWT authentication • WildSight Enterprise
          </p>
        </motion.div>
      </div>
    </div>
  );
}
