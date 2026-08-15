import { PageHeader } from "@/components/PageHeader";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, Globe, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-muted"}`}>
      <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: checked ? "1.375rem" : "0.125rem" }} />
    </button>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  const Row = ({ icon, title, desc, right }: any) => (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-4 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div className="min-w-0"><div className="font-medium">{title}</div><div className="text-xs text-muted-foreground">{desc}</div></div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure appearance, notifications and security" />
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 shadow-soft">
          <h3 className="mb-2 font-display text-lg font-semibold">Appearance</h3>
          <Row
            icon={theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            title="Theme"
            desc="Choose light or dark interface"
            right={
              <div className="flex overflow-hidden rounded-lg border border-border">
                <button onClick={() => setTheme("light")} className={`px-3 py-1.5 text-xs ${theme === "light" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Light</button>
                <button onClick={() => setTheme("dark")} className={`px-3 py-1.5 text-xs ${theme === "dark" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Dark</button>
              </div>
            }
          />
          <Row icon={<Globe className="h-4 w-4" />} title="Language" desc="Interface language" right={<span className="text-sm text-muted-foreground">English (US)</span>} />
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 shadow-soft">
          <h3 className="mb-2 font-display text-lg font-semibold">Notifications</h3>
          <Row icon={<Bell className="h-4 w-4" />} title="Email alerts" desc="Receive email summaries of critical events" right={<Toggle checked={emailNotif} onChange={(v) => { setEmailNotif(v); toast.success("Preferences saved"); }} />} />
          <Row icon={<Bell className="h-4 w-4" />} title="Push notifications" desc="Realtime alerts in-app" right={<Toggle checked={pushNotif} onChange={setPushNotif} />} />
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 shadow-soft lg:col-span-2">
          <h3 className="mb-2 font-display text-lg font-semibold">Security</h3>
          <Row icon={<Shield className="h-4 w-4" />} title="Two-factor authentication" desc="Add an extra layer of protection to your account" right={<Toggle checked={twoFA} onChange={setTwoFA} />} />
        </motion.section>
      </div>
    </div>
  );
}
