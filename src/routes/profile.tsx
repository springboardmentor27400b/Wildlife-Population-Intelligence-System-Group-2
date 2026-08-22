import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Vanguard Wilds" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, roles } = useAuth();
  const qc = useQueryClient();
  const [full, setFull] = useState(""); const [org, setOrg] = useState(""); const [bio, setBio] = useState("");

  const profile = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  useEffect(() => {
    if (profile.data) { setFull(profile.data.full_name ?? ""); setOrg(profile.data.organization ?? ""); setBio(profile.data.bio ?? ""); }
  }, [profile.data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: full, organization: org, bio } as never).eq("id", user.id);
    if (error) toast.error(error.message); else { toast.success("Profile updated."); qc.invalidateQueries({ queryKey: ["me"] }); }
  };

  return (
    <AppShell title="Field Profile" subtitle="Personal information visible to your team">
      <form onSubmit={save} className="max-w-2xl space-y-4 card-tactical p-6">
        <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
        <div><Label>Full name</Label><Input value={full} onChange={(e) => setFull(e.target.value)} maxLength={80} /></div>
        <div><Label>Organization</Label><Input value={org} onChange={(e) => setOrg(e.target.value)} maxLength={120} /></div>
        <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={4} /></div>
        <div><Label>Assigned roles</Label><p className="text-sm capitalize">{roles.join(", ") || "researcher"}</p></div>
        <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90">Save changes</Button>
      </form>
    </AppShell>
  );
}
