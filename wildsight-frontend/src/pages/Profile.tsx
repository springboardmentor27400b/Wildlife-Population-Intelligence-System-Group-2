import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { KeyRound, Save, Mail, Phone, Building2, Briefcase } from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      organization: user?.organization || "",
      designation: user?.designation || "",
    },
  });
  const pwForm = useForm({ defaultValues: { current: "", next: "", confirm: "" } });

  const initials = (user?.fullName || user?.email || "U").split(/[\s@]/).filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const input = "h-10 w-full rounded-lg border border-border/60 bg-background px-3 pl-9 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account information" />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 text-center shadow-soft">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl gradient-primary font-display text-3xl font-bold text-primary-foreground shadow-glow">
            {initials}
          </div>
          <h3 className="mt-4 font-display text-lg font-bold">{user?.fullName || "User"}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {user?.role}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{user?.organization || "Independent"}</p>
        </motion.div>

        <div className="space-y-6">
          <motion.form
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit((v) => { updateUser(v as any); toast.success("Profile updated"); })}
            className="glass rounded-2xl p-6 shadow-soft"
          >
            <h3 className="font-display text-lg font-semibold">Edit profile</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs font-medium">Full Name</label>
                <div className="relative"><Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={input} {...register("fullName")} /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium">Email</label>
                <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={input} {...register("email")} /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium">Phone</label>
                <div className="relative"><Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={input} {...register("phone")} /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium">Organization</label>
                <div className="relative"><Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={input} {...register("organization")} /></div>
              </div>
              <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium">Designation</label>
                <div className="relative"><Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={input} {...register("designation")} /></div>
              </div>
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <Save className="h-4 w-4" /> Save changes
            </button>
          </motion.form>

          <motion.form
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={pwForm.handleSubmit((v) => {
              if (v.next !== v.confirm) return toast.error("Passwords do not match");
              toast.success("Password change requested");
              pwForm.reset();
            })}
            className="glass rounded-2xl p-6 shadow-soft"
          >
            <h3 className="font-display text-lg font-semibold">Change password</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div><label className="mb-1 block text-xs font-medium">Current</label><input type="password" className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" {...pwForm.register("current")} /></div>
              <div><label className="mb-1 block text-xs font-medium">New</label><input type="password" className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" {...pwForm.register("next")} /></div>
              <div><label className="mb-1 block text-xs font-medium">Confirm</label><input type="password" className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" {...pwForm.register("confirm")} /></div>
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <KeyRound className="h-4 w-4" /> Update password
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
