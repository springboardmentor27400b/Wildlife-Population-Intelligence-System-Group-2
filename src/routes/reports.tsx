import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, FileText, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Vanguard Wilds" }, { name: "description", content: "Generated conservation reports." }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("survey");

  const reports = useQuery({
    queryKey: ["reports"],
    queryFn: async () => (await supabase.from("reports").select("*, profiles!reports_created_by_fkey(full_name)").order("created_at", { ascending: false })).data ?? [],
  });

  const generateReport = async (title: string, reportType: string, summary: string) => {
    if (!user) return;
    let payload: unknown = {};
    if (reportType === "species") {
      const { data } = await supabase.from("species").select("*");
      payload = { species: data ?? [] };
    } else if (reportType === "population") {
      const { data } = await supabase.from("population_statistics").select("*, species(common_name), protected_areas(name)");
      payload = { rows: data ?? [] };
    } else {
      const { data } = await supabase.from("surveys").select("*, protected_areas(name)");
      payload = { surveys: data ?? [] };
    }
    const { error } = await supabase.from("reports").insert({ title, report_type: reportType, summary, payload, created_by: user.id } as never);
    if (error) toast.error(error.message);
    else { toast.success("Report generated."); setOpen(false); qc.invalidateQueries({ queryKey: ["reports"] }); }
  };

  const downloadCsv = (r: { id: string; title: string; payload: unknown }) => {
    const payload = r.payload as Record<string, unknown[]>;
    const key = Object.keys(payload)[0];
    const rows = (payload[key] ?? []) as Record<string, unknown>[];
    if (!rows.length) { toast.error("Report is empty."); return; }
    const cols = Object.keys(rows[0]).filter((c) => typeof rows[0][c] !== "object");
    const csv = [cols.join(",")].concat(rows.map((row) => cols.map((c) => JSON.stringify(row[c] ?? "")).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${r.title.replace(/\s+/g, "-").toLowerCase()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete report?")) return;
    await supabase.from("reports").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["reports"] });
  };

  return (
    <AppShell
      title="Reports"
      subtitle="Field-ready summaries of surveys, species, and population statistics"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90"><Plus className="h-4 w-4 mr-2" /> Generate</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate report</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); generateReport(String(f.get("title")), type, String(f.get("summary") ?? "")); }} className="space-y-3">
              <div><Label>Title</Label><Input name="title" required placeholder="Q4 2024 Bandipur summary" /></div>
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="survey">Survey report</SelectItem>
                    <SelectItem value="species">Species report</SelectItem>
                    <SelectItem value="population">Population report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Summary</Label><Textarea name="summary" rows={3} /></div>
              <DialogFooter><Button type="submit">Generate</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-3">
        {(reports.data ?? []).map((r) => (
          <div key={r.id} className="card-tactical p-5 flex items-start gap-4">
            <div className="size-10 rounded-md bg-brand-primary/10 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-brand-primary" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase text-muted-foreground">{r.report_type}</p>
              <h3 className="font-display font-bold">{r.title}</h3>
              {r.summary && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{r.summary}</p>}
              <p className="text-[10px] text-muted-foreground mt-2">By {(r.profiles as { full_name?: string } | null)?.full_name ?? "—"} · {new Date(r.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => downloadCsv(r)}><Download className="h-4 w-4" /></Button>
              {r.created_by === user?.id && <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>
        ))}
        {reports.data?.length === 0 && <p className="text-sm text-muted-foreground">No reports yet. Generate one to get started.</p>}
      </div>
    </AppShell>
  );
}
