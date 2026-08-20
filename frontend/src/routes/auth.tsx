import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { ROLE_LABEL, type Role } from "@/lib/authTypes";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — WPIS" },
      { name: "description", content: "Sign in to the Wildlife Population Intelligence System." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, login, signup, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const [role, setRole] = useState<Role>("researcher");
  const [email, setEmail] = useState("researcher@wildtrust.org");
  const [password, setPassword] = useState("demo1234");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password, role);
      toast.success(`Welcome back, ${email.split("@")[0]}`);
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const onSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  setBusy(true);

  try {

    const roleMap: Record<Role, number> = {
      admin: 1,
      researcher: 2,
      forest: 3,
      conservation: 4,
    };

    await signup({
      full_name: fullName,
      username,
      email,
      password,
      role_id: roleMap[role],
    });

    toast.success("Account Created Successfully");

    navigate({
      to: "/dashboard",
    });

  } catch (err: any) {

    toast.error(
      err?.response?.data?.detail ??
      "Registration Failed"
    );

  } finally {

    setBusy(false);

  }
};

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-forest">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="font-display text-2xl font-semibold">WPIS</div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="mb-4 text-center">
              <h1 className="font-display text-2xl font-semibold">Welcome</h1>
              <p className="text-sm text-muted-foreground">
                Sign in or create an account to access your dashboard.
              </p>
            </div>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={onLogin} className="space-y-3">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABEL).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Signing in…" : "Sign in"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                  </p>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={onSignup} className="space-y-3">
                  <div>
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input id="fullname" value={fullName}
  onChange={(e) =>
    setFullName(e.target.value)
  }
  required
/>
                  </div>
                  <div>
                    <Label htmlFor="email2">Email</Label>
                    <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="username">
  Username
</Label>

<Input
  id="username"
  value={username}
  onChange={(e) =>
    setUsername(e.target.value)
  }
  required
/>
                  </div>
                  <div>
                    <Label htmlFor="pw">Password</Label>
                    <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABEL).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Creating account…" : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
}