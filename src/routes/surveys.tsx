import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Plus, ClipboardList, Trash2, Search, LayoutGrid, Table as TableIcon,
  Download, FileText, Pencil, Eye, MapPin, ExternalLink, Printer,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SURVEY_TONE, type SurveyStatus } from "@/lib/wildlife-types";

export const Route = createFileRoute("/surveys")({
  head: () => ({
    meta: [
      { title: "Field Surveys — Vanguard Wilds" },
      { name: "description", content: "Wildlife survey records, uploads, maps, and reports." },
    ],
  }),
  component: SurveysPage,
});

const STATUS_OPTIONS: SurveyStatus[] = ["pending", "active", "completed", "cancelled"];

const schema = z.object({
  title: z.string().trim().min(3, "Name must be at least 3 characters").max(120),
  protected_area_id: z.string().uuid().optional().or(z.literal("")),
  survey_date: z.string().min(1, "Date is required"),
  survey_time: z.string().optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.nan()),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.nan()),
  weather: z.string().trim().max(120).optional().or(z.literal("")),
  temperature: z.coerce.number().min(-60).max(70).optional().or(z.nan()),
  species_observed: z.string().trim().max(500).optional().or(z.literal("")),
  animal_count: z.coerce.number().int().min(0).max(1_000_000).default(0),
  team_size: z.coerce.number().int().min(1).max(500).default(1),
  status: z.enum(["pending", "active", "completed", "cancelled", "planned", "in_progress", "archived"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type SurveyRow = {
  id: string;
  title: string;
  survey_date: string;
  survey_time: string | null;
  latitude: number | null;
  longitude: number | null;
  weather: string | null;
  temperature: number | null;
  species_observed: string | null;
  animal_count: number | null;
  team_size: number | null;
  status: SurveyStatus;
  notes: string | null;
  protected_area_id: string | null;
  researcher_id: string;
  created_at: string;
  protected_areas: { name: string } | null;
  profiles: { full_name: string | null } | null;
};

const PAGE_SIZE = 8;

/** Normalise legacy statuses to the 4-value UI vocabulary */
function normStatus(s: SurveyStatus): "pending" | "active" | "completed" | "cancelled" {
  if (s === "planned") return "pending";
  if (s === "in_progress") return "active";
  if (s === "archived") return "cancelled";
  return s;
}

function shortId(id: string) {
  return "SRV-" + id.slice(0, 8).toUpperCase();
}

function SurveysPage() {
  const { user, roles } = useAuth();
  const qc = useQueryClient();
  const canManage = roles.includes("administrator") || roles.includes("officer") || roles.includes("researcher");
  const canDelete = roles.includes("administrator");

  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SurveyRow | null>(null);
  const [viewing, setViewing] = useState<SurveyRow | null>(null);
  const [formArea, setFormArea] = useState<string>("");
  const [formStatus, setFormStatus] = useState<SurveyStatus>("pending");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const areas = useQuery({
    queryKey: ["areas-select"],
    queryFn: async () =>
      (await supabase.from("protected_areas").select("id,name").order("name")).data ?? [],
  });

  const surveysQ = useQuery({
    queryKey: ["surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*, protected_areas(name), profiles!surveys_researcher_id_fkey(full_name)")
        .order("survey_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SurveyRow[];
    },
  });

  const filtered = useMemo(() => {
    const all = surveysQ.data ?? [];
    return all.filter((s) => {
      if (search && !`${s.title} ${s.species_observed ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (areaFilter !== "all" && s.protected_area_id !== areaFilter) return false;
      if (statusFilter !== "all" && normStatus(s.status) !== statusFilter) return false;
      if (dateFilter && s.survey_date !== dateFilter) return false;
      return true;
    });
  }, [surveysQ.data, search, areaFilter, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => {
    const all = surveysQ.data ?? [];
    const by = { pending: 0, active: 0, completed: 0, cancelled: 0 };
    let totalAnimals = 0;
    let counted = 0;
    all.forEach((s) => {
      by[normStatus(s.status)]++;
      if (typeof s.animal_count === "number") { totalAnimals += s.animal_count; counted++; }
    });
    const avg = counted ? Math.round(totalAnimals / counted) : 0;
    return { total: all.length, ...by, avg };
  }, [surveysQ.data]);

  // Charts data
  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    (surveysQ.data ?? []).forEach((s) => {
      const key = s.survey_date.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));
  }, [surveysQ.data]);

  const byArea = useMemo(() => {
    const map = new Map<string, number>();
    (surveysQ.data ?? []).forEach((s) => {
      const k = s.protected_areas?.name ?? "Unassigned";
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [surveysQ.data]);

  const byStatus = useMemo(
    () => [
      { name: "Pending", value: stats.pending, color: "#94a3b8" },
      { name: "Active", value: stats.active, color: "#f59e0b" },
      { name: "Completed", value: stats.completed, color: "#10b981" },
      { name: "Cancelled", value: stats.cancelled, color: "#ef4444" },
    ],
    [stats],
  );

  const speciesCount = useMemo(() => {
    const map = new Map<string, number>();
    (surveysQ.data ?? []).forEach((s) => {
      (s.species_observed ?? "").split(/[,;]/).map((x) => x.trim()).filter(Boolean).forEach((name) => {
        map.set(name, (map.get(name) ?? 0) + (s.animal_count ?? 1));
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [surveysQ.data]);

  const populationTrend = useMemo(() => {
    const map = new Map<string, number>();
    (surveysQ.data ?? []).forEach((s) => {
      const key = s.survey_date.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + (s.animal_count ?? 0));
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, population]) => ({ month, population }));
  }, [surveysQ.data]);

  const openCreate = () => {
    setEditing(null);
    setFormArea("");
    setFormStatus("pending");
    setDialogOpen(true);
  };

  const openEdit = (s: SurveyRow) => {
    setEditing(s);
    setFormArea(s.protected_area_id ?? "");
    setFormStatus(s.status);
    setDialogOpen(true);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    const raw = { ...Object.fromEntries(form), protected_area_id: formArea, status: formStatus };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const d = parsed.data;
    const payload = {
      title: d.title,
      protected_area_id: d.protected_area_id || null,
      survey_date: d.survey_date,
      survey_time: d.survey_time || null,
      latitude: Number.isFinite(d.latitude) ? d.latitude : null,
      longitude: Number.isFinite(d.longitude) ? d.longitude : null,
      weather: d.weather || null,
      temperature: Number.isFinite(d.temperature) ? d.temperature : null,
      species_observed: d.species_observed || null,
      animal_count: d.animal_count,
      team_size: d.team_size,
      status: d.status,
      notes: d.notes || null,
    };
    if (editing) {
      const { error } = await supabase.from("surveys").update(payload as never).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Survey updated.");
    } else {
      const { error } = await supabase.from("surveys").insert({ ...payload, researcher_id: user.id } as never);
      if (error) return toast.error(error.message);
      toast.success("Survey created.");
    }
    setDialogOpen(false);
    qc.invalidateQueries({ queryKey: ["surveys"] });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("surveys").delete().eq("id", deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success("Survey deleted.");
      qc.invalidateQueries({ queryKey: ["surveys"] });
    }
    setDeleteId(null);
  };

  const printReport = () => window.print();

  const exportCSV = () => {
    const rows = filtered;
    const header = [
      "Survey ID", "Name", "Protected Area", "Researcher", "Date", "Time",
      "Latitude", "Longitude", "Weather", "Temperature (°C)", "Species Observed",
      "Animal Count", "Status", "Notes",
    ];
    const csv = [
      header.join(","),
      ...rows.map((r) => [
        shortId(r.id), r.title, r.protected_areas?.name ?? "",
        r.profiles?.full_name ?? "", r.survey_date, r.survey_time ?? "",
        r.latitude ?? "", r.longitude ?? "", r.weather ?? "", r.temperature ?? "",
        r.species_observed ?? "", r.animal_count ?? 0, normStatus(r.status),
        (r.notes ?? "").replace(/\n/g, " "),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `field-surveys-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported.");
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Vanguard Wilds — Field Survey Report", 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated ${new Date().toLocaleString()} · ${filtered.length} records`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [["ID", "Name", "Area", "Date", "Time", "Status", "Species", "Count", "Weather", "Temp"]],
      body: filtered.map((r) => [
        shortId(r.id), r.title, r.protected_areas?.name ?? "-",
        r.survey_date, r.survey_time ?? "-", normStatus(r.status),
        r.species_observed ?? "-", r.animal_count ?? 0,
        r.weather ?? "-", r.temperature != null ? `${r.temperature}°C` : "-",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 84, 45] },
    });
    doc.save(`field-surveys-${Date.now()}.pdf`);
    toast.success("PDF exported.");
  };

  return (
    <AppShell
      title="Field Surveys"
      subtitle="Transect walks, camera-trap deployments, and rapid assessments"
      actions={
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />CSV</Button>
          <Button variant="outline" size="sm" onClick={exportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="h-4 w-4 mr-2" />Print</Button>
          {canManage && (
            <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> New Survey
            </Button>
          )}
        </div>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total Surveys" value={stats.total} tone="neutral" />
        <StatCard label="Active" value={stats.active} tone="warn" />
        <StatCard label="Completed" value={stats.completed} tone="positive" />
        <StatCard label="Pending" value={stats.pending} tone="neutral" />
        <StatCard label="Avg Wildlife Count" value={stats.avg} tone="positive" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-3 mb-4">
        <div className="card-tactical p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Surveys per Month</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card-tactical p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Surveys by Protected Area</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byArea}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={9} interval={0} angle={-15} textAnchor="end" height={45} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-tactical p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">By Status</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={35} outerRadius={65}>
                {byStatus.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3 mb-6">
        <div className="card-tactical p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Top Species Count</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={speciesCount} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" fontSize={10} allowDecimals={false} />
              <YAxis type="category" dataKey="name" fontSize={10} width={110} />
              <Tooltip />
              <Bar dataKey="count" fill="#0d9488" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-tactical p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Population Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={populationTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="population" stroke="#b45309" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Filters */}
      <div className="card-tactical p-4 mb-4 grid gap-3 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name or species…" className="pl-8" />
        </div>
        <Select value={areaFilter} onValueChange={(v) => { setAreaFilter(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Protected area" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {(areas.data ?? []).map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} />
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setView("table")}
              className={`px-2 ${view === "table" ? "bg-brand-primary text-white" : "bg-card"}`}
              aria-label="Table view"
            ><TableIcon className="h-4 w-4" /></button>
            <button
              onClick={() => setView("cards")}
              className={`px-2 ${view === "cards" ? "bg-brand-primary text-white" : "bg-card"}`}
              aria-label="Card view"
            ><LayoutGrid className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {surveysQ.isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      )}

      {/* Empty */}
      {!surveysQ.isLoading && filtered.length === 0 && (
        <div className="card-tactical p-10 text-center text-muted-foreground">
          <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No surveys match your filters.</p>
        </div>
      )}

      {/* Table view */}
      {!surveysQ.isLoading && filtered.length > 0 && view === "table" && (
        <div className="card-tactical overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Area</th>
                <th className="p-3">Date / Time</th>
                <th className="p-3">Species</th>
                <th className="p-3">Count</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{shortId(s.id)}</td>
                  <td className="p-3 font-medium">{s.title}</td>
                  <td className="p-3">{s.protected_areas?.name ?? "—"}</td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(s.survey_date).toLocaleDateString()}
                    {s.survey_time && <span className="text-muted-foreground"> · {s.survey_time.slice(0, 5)}</span>}
                  </td>
                  <td className="p-3">{s.species_observed ?? "—"}</td>
                  <td className="p-3 tabular-nums">{s.animal_count ?? 0}</td>
                  <td className="p-3"><span className={`tag-status ${SURVEY_TONE[s.status]}`}>{normStatus(s.status)}</span></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" onClick={() => setViewing(s)} aria-label="View"><Eye className="h-4 w-4" /></Button>
                    <Link to="/surveys/$id" params={{ id: s.id }} className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted" aria-label="Uploads"><ExternalLink className="h-4 w-4" /></Link>
                    {canManage && (user?.id === s.researcher_id || canDelete) && (
                      <Button size="icon" variant="ghost" onClick={() => openEdit(s)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                    )}
                    {canDelete && (
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(s.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Card view */}
      {!surveysQ.isLoading && filtered.length > 0 && view === "cards" && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {pageRows.map((s) => (
            <div key={s.id} className="card-tactical p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] text-muted-foreground">{shortId(s.id)}</p>
                  <p className="font-display font-bold truncate">{s.title}</p>
                </div>
                <span className={`tag-status ${SURVEY_TONE[s.status]}`}>{normStatus(s.status)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(s.survey_date).toLocaleDateString()}
                {s.survey_time && ` · ${s.survey_time.slice(0, 5)}`} · {s.protected_areas?.name ?? "Unassigned"}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div><span className="text-muted-foreground">Species: </span>{s.species_observed ?? "—"}</div>
                <div><span className="text-muted-foreground">Count: </span>{s.animal_count ?? 0}</div>
                <div><span className="text-muted-foreground">Weather: </span>{s.weather ?? "—"}</div>
                <div><span className="text-muted-foreground">Temp: </span>{s.temperature != null ? `${s.temperature}°C` : "—"}</div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewing(s)}><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
                <Link to="/surveys/$id" params={{ id: s.id }} className="flex-1"><Button size="sm" variant="outline" className="w-full">Uploads</Button></Link>
                {canManage && (user?.id === s.researcher_id || canDelete) && (
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span className="px-3 py-1.5">Page {page} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit survey" : "New field survey"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Survey Name *</Label>
              <Input name="title" required defaultValue={editing?.title} placeholder="Transect T-92 Bandipur" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date *</Label>
                <Input name="survey_date" type="date" required defaultValue={editing?.survey_date ?? new Date().toISOString().slice(0, 10)} />
              </div>
              <div>
                <Label>Time</Label>
                <Input name="survey_time" type="time" defaultValue={editing?.survey_time ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Protected Area</Label>
                <Select value={formArea} onValueChange={setFormArea}>
                  <SelectTrigger><SelectValue placeholder="Select area…" /></SelectTrigger>
                  <SelectContent>
                    {(areas.data ?? []).map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as SurveyStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude</Label>
                <Input name="latitude" type="number" step="0.000001" defaultValue={editing?.latitude ?? ""} placeholder="12.345678" />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input name="longitude" type="number" step="0.000001" defaultValue={editing?.longitude ?? ""} placeholder="76.123456" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Weather</Label>
                <Input name="weather" defaultValue={editing?.weather ?? ""} placeholder="Overcast" />
              </div>
              <div>
                <Label>Temperature (°C)</Label>
                <Input name="temperature" type="number" step="0.1" defaultValue={editing?.temperature ?? ""} />
              </div>
              <div>
                <Label>Team size</Label>
                <Input name="team_size" type="number" min={1} defaultValue={editing?.team_size ?? 2} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Species Observed</Label>
                <Input name="species_observed" defaultValue={editing?.species_observed ?? ""} placeholder="Bengal Tiger, Sambar Deer" />
              </div>
              <div>
                <Label>Animal Count</Label>
                <Input name="animal_count" type="number" min={0} defaultValue={editing?.animal_count ?? 0} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" rows={3} defaultValue={editing?.notes ?? ""} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save changes" : "Create survey"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {viewing.title}
                  <Badge variant="outline" className={SURVEY_TONE[viewing.status]}>{normStatus(viewing.status)}</Badge>
                </DialogTitle>
                <p className="font-mono text-xs text-muted-foreground">{shortId(viewing.id)}</p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Protected Area" value={viewing.protected_areas?.name ?? "—"} />
                <Field label="Researcher" value={viewing.profiles?.full_name ?? "—"} />
                <Field label="Date" value={new Date(viewing.survey_date).toLocaleDateString()} />
                <Field label="Time" value={viewing.survey_time?.slice(0, 5) ?? "—"} />
                <Field label="Weather" value={viewing.weather ?? "—"} />
                <Field label="Temperature" value={viewing.temperature != null ? `${viewing.temperature}°C` : "—"} />
                <Field label="Species Observed" value={viewing.species_observed ?? "—"} />
                <Field label="Animal Count" value={String(viewing.animal_count ?? 0)} />
                <Field label="Latitude" value={viewing.latitude?.toString() ?? "—"} />
                <Field label="Longitude" value={viewing.longitude?.toString() ?? "—"} />
              </div>
              {viewing.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{viewing.notes}</p>
                </div>
              )}
              {viewing.latitude != null && viewing.longitude != null && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Location
                  </p>
                  <MiniMap lat={Number(viewing.latitude)} lng={Number(viewing.longitude)} />
                </div>
              )}
              <DialogFooter>
                <Link to="/surveys/$id" params={{ id: viewing.id }}>
                  <Button variant="outline"><ExternalLink className="h-4 w-4 mr-2" />Open uploads & AI</Button>
                </Link>
                <Button onClick={() => setViewing(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this survey?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the survey record. Uploaded images and audio linked to it will remain but become orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  const d = 0.02;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className="rounded-md overflow-hidden border border-border">
      <iframe
        title="Survey location"
        src={src}
        className="w-full h-64"
        loading="lazy"
      />
      <div className="p-2 bg-muted/40 text-xs flex justify-between">
        <span className="font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
        <a
          className="text-brand-primary hover:underline"
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`}
          target="_blank" rel="noreferrer"
        >Open in OSM →</a>
      </div>
    </div>
  );
}
