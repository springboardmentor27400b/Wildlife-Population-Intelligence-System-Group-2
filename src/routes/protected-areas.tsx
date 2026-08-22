import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Plus, Search, Trees, Trash2, Pencil, Eye, LayoutGrid, Table as TableIcon,
  MapPin, Shield, Users as UsersIcon, ChevronLeft, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, hasRole } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/protected-areas")({
  head: () => ({
    meta: [
      { title: "Protected Areas — Vanguard Wilds" },
      { name: "description", content: "Manage protected areas: reserves, national parks, sanctuaries." },
    ],
  }),
  component: ProtectedAreasPage,
});

type PA = {
  id: string;
  name: string;
  code: string | null;
  forest_type: string | null;
  state: string | null;
  district: string | null;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  total_area_sqkm: number | null;
  area_hectares: number;
  conservation_status: string | null;
  designation: string | null;
  number_of_rangers: number | null;
  established_year: number | null;
  description: string | null;
  created_at: string;
};

const FOREST_TYPES = [
  "Tropical Evergreen", "Tropical Deciduous", "Mangrove", "Montane", "Alpine",
  "Thorn/Scrub", "Wetland", "Grassland", "Mixed",
];
const STATUS_OPTIONS = ["Critical", "Endangered", "Vulnerable", "Stable", "Protected", "Recovering"];

const STATUS_TONE: Record<string, string> = {
  Critical: "bg-red-100 text-red-800 border-red-200",
  Endangered: "bg-orange-100 text-orange-800 border-orange-200",
  Vulnerable: "bg-amber-100 text-amber-800 border-amber-200",
  Stable: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Protected: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Recovering: "bg-teal-100 text-teal-800 border-teal-200",
};

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  forest_type: z.string().trim().min(1, "Forest type is required").max(80),
  state: z.string().trim().min(2, "State is required").max(80),
  district: z.string().trim().min(2, "District is required").max(80),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  total_area_sqkm: z.coerce.number().positive("Area must be greater than 0").max(1e7),
  conservation_status: z.string().trim().min(1, "Status is required"),
  number_of_rangers: z.coerce.number().int().min(0).max(100000),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

const PAGE_SIZE = 9;

function ProtectedAreasPage() {
  const { roles } = useAuth();
  const isAdmin = hasRole(roles, "administrator");
  const canManage = isAdmin || hasRole(roles, "officer");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [forestFilter, setForestFilter] = useState<string>("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PA | null>(null);
  const [viewing, setViewing] = useState<PA | null>(null);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["protected-areas-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("protected_areas").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PA[];
    },
  });

  const filtered = useMemo(() => {
    const list = query.data ?? [];
    const term = q.trim().toLowerCase();
    return list.filter((pa) => {
      if (statusFilter !== "all" && (pa.conservation_status ?? "") !== statusFilter) return false;
      if (forestFilter !== "all" && (pa.forest_type ?? "") !== forestFilter) return false;
      if (!term) return true;
      return (
        pa.name.toLowerCase().includes(term) ||
        (pa.state ?? "").toLowerCase().includes(term) ||
        (pa.district ?? "").toLowerCase().includes(term) ||
        (pa.code ?? "").toLowerCase().includes(term)
      );
    });
  }, [query.data, q, statusFilter, forestFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const list = query.data ?? [];
    const totalArea = list.reduce((s, p) => s + Number(p.total_area_sqkm ?? 0), 0);
    const rangers = list.reduce((s, p) => s + Number(p.number_of_rangers ?? 0), 0);
    const critical = list.filter((p) => p.conservation_status === "Critical" || p.conservation_status === "Endangered").length;
    return { count: list.length, totalArea, rangers, critical };
  }, [query.data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const d = parsed.data;
    const payload = {
      name: d.name,
      forest_type: d.forest_type,
      state: d.state,
      district: d.district,
      region: d.state, // legacy column mirror
      country: "India",
      latitude: d.latitude,
      longitude: d.longitude,
      total_area_sqkm: d.total_area_sqkm,
      area_hectares: Math.round(d.total_area_sqkm * 100), // legacy column mirror
      conservation_status: d.conservation_status,
      number_of_rangers: d.number_of_rangers,
      description: d.description || null,
    };
    if (editing) {
      const { error } = await supabase.from("protected_areas").update(payload as never).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Protected area updated.");
    } else {
      const { error } = await supabase.from("protected_areas").insert(payload as never);
      if (error) { toast.error(error.message); return; }
      toast.success("Protected area created.");
    }
    setFormOpen(false);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["protected-areas-all"] });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this protected area? This action cannot be undone.")) return;
    const { error } = await supabase.from("protected_areas").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["protected-areas-all"] }); }
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (pa: PA) => { setEditing(pa); setFormOpen(true); };

  return (
    <AppShell
      title="Protected Areas"
      subtitle="Reserves, national parks, and sanctuaries under active monitoring"
      actions={
        canManage && (
          <Button size="sm" onClick={openCreate} className="bg-emerald-700 hover:bg-emerald-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Protected Area
          </Button>
        )
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox label="Total Areas" value={stats.count} icon={Trees} tint="emerald" />
        <StatBox label="Total Area (km²)" value={stats.totalArea.toLocaleString(undefined, { maximumFractionDigits: 0 })} icon={MapPin} tint="teal" />
        <StatBox label="Rangers Deployed" value={stats.rangers.toLocaleString()} icon={UsersIcon} tint="lime" />
        <StatBox label="At-Risk Areas" value={stats.critical} icon={Shield} tint="amber" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name, state, district, code…" className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={forestFilter} onValueChange={(v) => { setForestFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Forest type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All forest types</SelectItem>
            {FOREST_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center rounded-md border border-border bg-card p-0.5">
          <button onClick={() => setView("cards")} className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${view === "cards" ? "bg-emerald-700 text-white" : "text-muted-foreground"}`}>
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </button>
          <button onClick={() => setView("table")} className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${view === "table" ? "bg-emerald-700 text-white" : "text-muted-foreground"}`}>
            <TableIcon className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {/* Loading / empty */}
      {query.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!query.isLoading && filtered.length === 0 && (
        <div className="card-tactical p-10 text-center">
          <Trees className="h-10 w-10 text-emerald-700/40 mx-auto mb-3" />
          <p className="font-semibold">No protected areas match your filters.</p>
          <p className="text-sm text-muted-foreground mt-1">Adjust filters or add a new area.</p>
        </div>
      )}

      {/* Cards view */}
      {view === "cards" && paged.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paged.map((pa) => (
            <div key={pa.id} className="card-tactical p-5 group relative border-l-4 border-l-emerald-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="size-11 rounded-md bg-emerald-700/10 flex items-center justify-center shrink-0">
                  <Trees className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{pa.code ?? pa.id.slice(0, 8)}</p>
                  <h3 className="font-display font-bold truncate">{pa.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{pa.district ?? "—"}, {pa.state ?? pa.region}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {pa.conservation_status && (
                  <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[pa.conservation_status] ?? ""}`}>{pa.conservation_status}</Badge>
                )}
                {pa.forest_type && <Badge variant="outline" className="text-[10px]">{pa.forest_type}</Badge>}
              </div>

              <dl className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-border">
                <div><dt className="text-muted-foreground">Area</dt><dd className="font-semibold font-mono">{Number(pa.total_area_sqkm ?? 0).toLocaleString()} km²</dd></div>
                <div><dt className="text-muted-foreground">Rangers</dt><dd className="font-semibold font-mono">{pa.number_of_rangers ?? 0}</dd></div>
                <div><dt className="text-muted-foreground">Coords</dt><dd className="font-semibold font-mono text-[10px]">{pa.latitude?.toFixed(2) ?? "—"}, {pa.longitude?.toFixed(2) ?? "—"}</dd></div>
              </dl>

              <div className="flex gap-1 mt-4 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setViewing(pa)} className="flex-1 h-8 text-xs"><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
                {canManage && <Button variant="ghost" size="sm" onClick={() => openEdit(pa)} className="flex-1 h-8 text-xs"><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>}
                {isAdmin && <Button variant="ghost" size="sm" onClick={() => onDelete(pa.id)} className="h-8 text-xs text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      {view === "table" && paged.length > 0 && (
        <div className="card-tactical overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Forest Type</TableHead>
                <TableHead>State / District</TableHead>
                <TableHead className="text-right">Area (km²)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Rangers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((pa) => (
                <TableRow key={pa.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{pa.code ?? pa.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-semibold">{pa.name}</TableCell>
                  <TableCell className="text-sm">{pa.forest_type ?? "—"}</TableCell>
                  <TableCell className="text-sm">{pa.state ?? pa.region}<span className="text-muted-foreground"> · {pa.district ?? "—"}</span></TableCell>
                  <TableCell className="text-right font-mono">{Number(pa.total_area_sqkm ?? 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {pa.conservation_status && (
                      <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[pa.conservation_status] ?? ""}`}>{pa.conservation_status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">{pa.number_of_rangers ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewing(pa)}><Eye className="h-3.5 w-3.5" /></Button>
                      {canManage && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(pa)}><Pencil className="h-3.5 w-3.5" /></Button>}
                      {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(pa.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-xs font-mono">{currentPage} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit protected area" : "New protected area"}</DialogTitle>
            <DialogDescription>All fields marked required.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Area Name *</Label><Input name="name" required defaultValue={editing?.name} /></div>
              <div>
                <Label>Forest Type *</Label>
                <Select name="forest_type" defaultValue={editing?.forest_type ?? undefined}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{FOREST_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Conservation Status *</Label>
                <Select name="conservation_status" defaultValue={editing?.conservation_status ?? undefined}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>State *</Label><Input name="state" required defaultValue={editing?.state ?? editing?.region} /></div>
              <div><Label>District *</Label><Input name="district" required defaultValue={editing?.district ?? ""} /></div>
              <div><Label>Latitude *</Label><Input name="latitude" type="number" step="any" required defaultValue={editing?.latitude ?? ""} /></div>
              <div><Label>Longitude *</Label><Input name="longitude" type="number" step="any" required defaultValue={editing?.longitude ?? ""} /></div>
              <div><Label>Total Area (sq km) *</Label><Input name="total_area_sqkm" type="number" step="0.01" required defaultValue={editing?.total_area_sqkm ?? ""} /></div>
              <div><Label>Number of Rangers *</Label><Input name="number_of_rangers" type="number" min="0" required defaultValue={editing?.number_of_rangers ?? 0} /></div>
            </div>
            <div><Label>Description</Label><Textarea name="description" rows={3} defaultValue={editing?.description ?? ""} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800">{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View details dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Trees className="h-5 w-5 text-emerald-700" />{viewing.name}</DialogTitle>
                <DialogDescription className="font-mono text-xs">{viewing.code ?? viewing.id}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {viewing.conservation_status && <Badge variant="outline" className={STATUS_TONE[viewing.conservation_status] ?? ""}>{viewing.conservation_status}</Badge>}
                  {viewing.forest_type && <Badge variant="outline">{viewing.forest_type}</Badge>}
                </div>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <Detail label="State" value={viewing.state ?? viewing.region} />
                  <Detail label="District" value={viewing.district ?? "—"} />
                  <Detail label="Latitude" value={viewing.latitude?.toString() ?? "—"} />
                  <Detail label="Longitude" value={viewing.longitude?.toString() ?? "—"} />
                  <Detail label="Total Area" value={`${Number(viewing.total_area_sqkm ?? 0).toLocaleString()} km²`} />
                  <Detail label="Rangers" value={String(viewing.number_of_rangers ?? 0)} />
                  <Detail label="Created" value={new Date(viewing.created_at).toLocaleDateString()} />
                  <Detail label="Country" value={viewing.country} />
                </dl>
                {viewing.description && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Description</p>
                    <p className="text-sm">{viewing.description}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                {canManage && <Button variant="outline" onClick={() => { const p = viewing; setViewing(null); openEdit(p); }}><Pencil className="h-4 w-4 mr-2" />Edit</Button>}
                <Button onClick={() => setViewing(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function StatBox({ label, value, icon: Icon, tint }: { label: string; value: React.ReactNode; icon: typeof Trees; tint: "emerald" | "teal" | "lime" | "amber" }) {
  const tints: Record<string, string> = {
    emerald: "bg-emerald-700/10 text-emerald-700",
    teal: "bg-teal-700/10 text-teal-700",
    lime: "bg-lime-700/10 text-lime-700",
    amber: "bg-amber-600/10 text-amber-700",
  };
  return (
    <div className="card-tactical p-4 flex items-center gap-3">
      <div className={`size-10 rounded-md flex items-center justify-center ${tints[tint]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-display font-bold">{value}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</dt>
      <dd className="font-mono text-sm mt-0.5">{value}</dd>
    </div>
  );
}
