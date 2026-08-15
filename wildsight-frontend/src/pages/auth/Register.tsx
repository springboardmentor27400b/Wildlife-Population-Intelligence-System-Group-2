import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Feather, Loader2 } from "lucide-react";

interface FormValues {
  fullName: string; email: string; password: string; phone: string;
  organization: string; designation: string; role: string;
}

export default function Register() {
  const { register: reg, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { role: "VOLUNTEER" },
  });
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    try {
      await register(v);
      toast.success("Account created. Signing you in...");
      try { await login(v.email, v.password); navigate("/dashboard"); }
      catch { navigate("/login"); }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const field = "h-11 w-full rounded-xl border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="grid w-full overflow-hidden rounded-3xl border border-border/60 bg-card shadow-elegant md:grid-cols-[1.1fr_1fr]">
          <div className="relative hidden gradient-hero p-10 text-white md:flex md:flex-col md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20"><Feather className="h-6 w-6" /></div>
              <div className="font-display text-xl font-bold">WildSight</div>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold leading-tight">Join a global network of conservationists.</h2>
              <p className="mt-3 text-sm text-white/85">Whether you're a forest officer, researcher or volunteer — your observations power ecosystems worldwide.</p>
            </div>
            <ul className="space-y-2 text-sm text-white/85">
              <li>✓ Role-based access</li>
              <li>✓ Real-time biodiversity dashboards</li>
              <li>✓ AI-assisted species identification (coming soon)</li>
            </ul>
          </div>

          <div className="p-8 sm:p-10">
            <h1 className="font-display text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Get started with WildSight in under a minute.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium">Full Name</label>
                <input className={field} placeholder="Jane Doe" {...reg("fullName", { required: "Required" })} />
                {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium">Email</label>
                <input type="email" className={field} placeholder="you@wildsight.io" {...reg("email", { required: "Required" })} />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Password</label>
                <input type="password" className={field} placeholder="••••••••" {...reg("password", { required: "Required", minLength: 6 })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Phone</label>
                <input className={field} placeholder="+91 98765 43210" {...reg("phone")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Organization</label>
                <input className={field} placeholder="Forest Dept." {...reg("organization")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Designation</label>
                <input className={field} placeholder="Officer / PhD Student" {...reg("designation")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium">Role</label>
                <select className={field} {...reg("role", { required: true })}>
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="RESEARCHER">Researcher</option>
                  <option value="FOREST_OFFICER">Forest Officer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <motion.button whileTap={{ scale: 0.98 }} disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-primary font-semibold text-primary-foreground shadow-soft hover:shadow-glow disabled:opacity-70 sm:col-span-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : "Create account"}
              </motion.button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
