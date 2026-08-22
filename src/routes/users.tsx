import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, hasRole } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import type { AppRole } from "@/lib/wildlife-types";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "User Directory — Vanguard Wilds" }, { name: "robots", content: "noindex" }] }),
  component: UsersPage,
});

function UsersPage() {
  const { roles: myRoles } = useAuth();
  const isAdmin = hasRole(myRoles, "administrator");
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const [profs, roles] = await Promise.all([
        supabase.from("profiles").select("*").order("full_name"),
        supabase.from("user_roles").select("*"),
      ]);
      const roleMap = new Map<string, AppRole[]>();
      (roles.data ?? []).forEach((r) => {
        const arr = roleMap.get(r.user_id) ?? [];
        arr.push(r.role as AppRole);
        roleMap.set(r.user_id, arr);
      });
      return (profs.data ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }));
    },
  });

  const assignRole = async (userId: string, role: AppRole) => {
    if (!isAdmin) return;
    // remove existing, add new (single-role UI)
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as never);
    if (error) toast.error(error.message); else { toast.success("Role updated."); qc.invalidateQueries({ queryKey: ["users-list"] }); }
  };

  return (
    <AppShell title="User Directory" subtitle="Assign administrator, researcher, or conservation-officer roles">
      {!isAdmin && <p className="text-sm text-muted-foreground mb-4">Read-only — only administrators can change roles.</p>}
      <div className="card-tactical overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground text-left">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Organization</th><th className="px-4 py-3">Role</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(list.data ?? []).map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 flex items-center gap-2 font-medium"><Users className="h-4 w-4 text-muted-foreground" />{u.full_name}</td>
                <td className="px-4 py-3">{u.organization ?? "—"}</td>
                <td className="px-4 py-3">
                  {isAdmin ? (
                    <Select value={u.roles[0] ?? "researcher"} onValueChange={(v) => assignRole(u.id, v as AppRole)}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="officer">Conservation Officer</SelectItem>
                        <SelectItem value="administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="capitalize">{u.roles[0] ?? "researcher"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
