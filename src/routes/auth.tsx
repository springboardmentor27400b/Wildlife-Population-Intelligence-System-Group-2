import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import forestHero from "@/assets/forest-hero.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Vanguard Wilds" },
      { name: "description", content: "Sign in to the Vanguard Wilds wildlife intelligence platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z.string().min(6, { message: "At least 6 characters" }).max(128),
});
const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, { message: "Enter your name" }).max(80),
  organization: z.string().trim().max(120).optional().or(z.literal("")),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back to the field.");
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName, organization: parsed.data.organization ?? "" },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. You're signed in.");
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setLoading(false);
    if (result.error) toast.error(result.error.message);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-brand-deep">
      <div className="relative hidden lg:block overflow-hidden">
        <img src={forestHero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep/95 via-brand-deep/70 to-transparent" />
        <div className="relative z-10 h-full p-12 flex flex-col justify-between text-white">
          <div>
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="size-8 rounded-md bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-brand-accent" />
              </div>
              <span className="font-display font-bold tracking-tight uppercase">Vanguard Wilds</span>
            </div>
            <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight max-w-lg">
              Real-time intelligence for the last wild places.
            </h1>
            <p className="mt-4 text-white/70 max-w-md">
              Deploy field surveys, monitor protected areas, run AI-assisted image and acoustic detection, and generate conservation-grade reports — end to end.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 max-w-lg">
            {[
              { k: "1,482", v: "Species tracked" },
              { k: "12,440 ha", v: "Under monitoring" },
              { k: "4,102", v: "Sensors online" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="text-2xl font-display font-bold text-brand-accent">{s.k}</dt>
                <dd className="text-[11px] uppercase tracking-widest text-white/50 mt-1">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden inline-flex items-center gap-2 mb-6">
            <div className="size-8 rounded-md bg-brand-primary/10 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-brand-primary" />
            </div>
            <span className="font-display font-bold uppercase tracking-tight">Vanguard Wilds</span>
          </div>
          <h2 className="font-display text-2xl font-bold">Field terminal access</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to reach your assigned reserves.</p>

          <Tabs defaultValue="signin" className="mt-8">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required autoComplete="current-password" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" name="fullName" required />
                </div>
                <div>
                  <Label htmlFor="organization">Organization <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="organization" name="organization" placeholder="Karnataka Forest Dept." />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required autoComplete="new-password" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.4-1.6 4.1-5.4 4.1-3.2 0-5.9-2.7-5.9-5.9s2.6-5.9 5.9-5.9c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.6 14.6 2.6 12 2.6 6.8 2.6 2.6 6.8 2.6 12s4.2 9.4 9.4 9.4c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12Z"/></svg>
            Continue with Google
          </Button>
          <p className="mt-6 text-xs text-muted-foreground text-center">
            New accounts default to the <span className="font-semibold text-foreground">Researcher</span> role. Administrators can promote users after sign-in.
          </p>
        </div>
      </div>
    </div>
  );
}
