import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Plus, Search, Trash2, Pencil, LayoutGrid, Table as TableIcon,
  Rabbit, ShieldAlert, Bird, Fish, Bug, Upload, ChevronLeft, ChevronRight, Loader2, ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, hasRole } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CONSERVATION_LABELS, CONSERVATION_TONE, type ConservationStatus } from "@/lib/wildlife-types";

export const Route = createFileRoute("/species")({
  head: () => ({
    meta: [
      { title: "Species Inventory — Vanguard Wilds" },
      { name: "description", content: "Species catalog with IUCN conservation status, populations, and habitats." },
    ],
  }),
  component: SpeciesPage,
});

type Category = "mammal" | "bird" | "reptile" | "amphibian" | "fish" | "insect";

const CATEGORIES: { value: Category; label: string; icon: typeof Rabbit }[] = [
  { value: "mammal", label: "Mammals", icon: Rabbit },
  { value: "bird", label: "Birds", icon: Bird },
  { value: "reptile", label: "Reptiles", icon: Bug },
  { value: "amphibian", label: "Amphibians", icon: Bug },
  { value: "fish", label: "Fish", icon: Fish },
  { value: "insect", label: "Insects", icon: Bug },
];

// User-facing statuses (subset of IUCN)
const STATUS_OPTIONS: ConservationStatus[] = ["LC", "NT", "VU", "EN", "CR"];
const FOOD_TYPES = ["Carnivore", "Herbivore", "Omnivore", "Frugivore", "Insectivore", "Piscivore", "Nectivore"];

type Species = {
  id: string;
  common_name: string;
  scientific_name: string;
  family: string | null;
  category: Category | null;
  conservation_status: ConservationStatus;
  population: number | null;
  average_lifespan: number | null;
  habitat: string | null;
  food_type: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

const schema = z.object({
  common_name: z.string().trim().min(2, "Common name required").max(120),
  scientific_name: z.string().trim().min(2, "Scientific name required").max(160),
  category: z.enum(["mammal", "bird", "reptile", "amphibian", "fish", "insect"]),
  conservation_status: z.enum(["LC", "NT", "VU", "EN", "CR"]),
  population: z.coerce.number().int().min(0).max(1e9),
  average_lifespan: z.coerce.number().int().min(0).max(500),
  habitat: z.string().trim().min(2, "Habitat required").max(200),
  food_type: z.string().trim().min(2, "Food type required").max(80),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

const PAGE_SIZE = 8;

function SpeciesPage() {
  const { roles } = useAuth();
  const isAdmin = hasRole(roles, "administrator");
  const canManage = isAdmin || hasRole(roles, "researcher") || hasRole(roles, "officer");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [status, setStatus] = useState<ConservationStatus | "all">("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Species | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["species-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("species").select("*").order("common_name");
      if (error) throw error;
      return (data ?? []) as unknown as Species[];
    },
  });

  const filtered = useMemo(() => {
    const list = query.data ?? [];
    const term = q.trim().toLowerCase();
    return list.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (status !== "all" && s.conservation_status !== status) return false;
      if (!term) return true;
      return (
        s.common_name.toLowerCase().includes(term) ||
        s.scientific_name.toLowerCase().includes(term) ||
        (s.habitat ?? "").toLowerCase().includes(term)
      );
    });
  }, [query.data, q, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const list = query.data ?? [];
    return {
      total: list.length,
      endangered: list.filter((s) => s.conservation_status === "EN" || s.conservation_status === "CR").length,
      mammals: list.filter((s) => s.category === "mammal").length,
      birds: list.filter((s) => s.category === "bird").length,
    };
  }, [query.data]);

  const openCreate = () => { setEditing(null); setImageUrl(null); setFormOpen(true); };
  const openEdit = (s: Species) => { setEditing(s); setImageUrl(s.image_url); setFormOpen(true); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB."); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file."); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `species/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("wildlife-images").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("wildlife-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
    toast.success("Image uploaded.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const payload = { ...parsed.data, image_url: imageUrl, description: parsed.data.description || null };
    if (editing) {
      const { error } = await supabase.from("species").update(payload as never).eq("id", editing.id);
      setSubmitting(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Species updated.");
    } else {
      const { error } = await supabase.from("species").insert(payload as never);
      setSubmitting(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Species added.");
    }
    setFormOpen(false); setEditing(null); setImageUrl(null);
    qc.invalidateQueries({ queryKey: ["species-all"] });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this species? This cannot be undone.")) return;
    const { error } = await supabase.from("species").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Species deleted."); qc.invalidateQueries({ queryKey: ["species-all"] }); }
  };

  return (
    <AppShell
      title="Species Inventory"
      subtitle="Cataloged fauna with IUCN status, populations and habitat data"
      actions={canManage && (
        <Button size="sm" onClick={openCreate} className="bg-emerald-700 hover:bg-emerald-800 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Species
        </Button>
      )}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox label="Total Species" value={stats.total} icon={Rabbit} tint="emerald" />
        <StatBox label="Endangered" value={stats.endangered} icon={ShieldAlert} tint="red" />
        <StatBox label="Mammals" value={stats.mammals} icon={Rabbit} tint="lime" />
        <StatBox label="Birds" value={stats.birds} icon={Bird} tint="teal" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search common, scientific, habitat…" className="pl-9" />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v as Category | "all"); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v as ConservationStatus | "all"); setPage(1); }}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((k) => <SelectItem key={k} value={k}>{k} — {CONSERVATION_LABELS[k]}</SelectItem>)}
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

      {/* Loading */}
      {query.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      )}

      {/* Empty */}
      {!query.isLoading && filtered.length === 0 && (
        <div className="card-tactical p-10 text-center">
          <Rabbit className="h-10 w-10 text-emerald-700/40 mx-auto mb-3" />
          <p className="font-semibold">No species match your filters.</p>
          <p className="text-sm text-muted-foreground mt-1">Add a new species or adjust filters.</p>
        </div>
      )}

      {/* Cards */}
      {view === "cards" && paged.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {paged.map((s) => (
            <article key={s.id} className="card-tactical overflow-hidden group flex flex-col hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.common_name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-700/30"><ImageIcon className="h-10 w-10" /></div>
                )}
                <Badge variant="outline" className={`absolute top-2 right-2 text-[10px] bg-background/90 ${CONSERVATION_TONE[s.conservation_status]}`}>
                  {s.conservation_status}
                </Badge>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">{categoryLabel(s.category)}</p>
                <h3 className="font-display font-bold truncate">{s.common_name}</h3>
                <p className="text-xs italic text-muted-foreground truncate">{s.scientific_name}</p>
                <dl className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-border">
                  <div><dt className="text-muted-foreground">Population</dt><dd className="font-mono font-semibold">{s.population?.toLocaleString() ?? "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Lifespan</dt><dd className="font-mono font-semibold">{s.average_lifespan ? `${s.average_lifespan} yr` : "—"}</dd></div>
                  <div className="col-span-2"><dt className="text-muted-foreground">Food</dt><dd className="font-semibold truncate">{s.food_type ?? "—"}</dd></div>
                </dl>
                {canManage && (
                  <div className="flex gap-1 mt-3 pt-3 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)} className="flex-1 h-8 text-xs"><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
                    {isAdmin && <Button variant="ghost" size="sm" onClick={() => onDelete(s.id)} className="h-8 text-xs text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Table */}
      {view === "table" && paged.length > 0 && (
        <div className="card-tactical overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Common Name</TableHead>
                <TableHead>Scientific</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Population</TableHead>
                <TableHead>Habitat</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="size-10 rounded bg-muted overflow-hidden">
                      {s.image_url ? <img src={s.image_url} alt={s.common_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="h-4 w-4" /></div>}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{s.common_name}</TableCell>
                  <TableCell className="italic text-muted-foreground">{s.scientific_name}</TableCell>
                  <TableCell><span className="capitalize text-sm">{s.category ?? "—"}</span></TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] ${CONSERVATION_TONE[s.conservation_status]}`}>{s.conservation_status}</Badge></TableCell>
                  <TableCell className="text-right font-mono">{s.population?.toLocaleString() ?? "—"}</TableCell>
                  <TableCell className="text-sm truncate max-w-[200px]">{s.habitat ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canManage && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>}
                      {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
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
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft className="h-4 w-4" /> Prev</Button>
            <span className="text-xs font-mono">{currentPage} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) { setEditing(null); setImageUrl(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit species" : "New species"}</DialogTitle>
            <DialogDescription>All fields marked required.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Image */}
            <div>
              <Label>Image</Label>
              <div className="flex items-center gap-3 mt-1">
                <div className="size-20 rounded-md bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading…</> : <><Upload className="h-4 w-4 mr-2" />Upload image</>}
                </Button>
                {imageUrl && <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl(null)}>Remove</Button>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label>Common Name *</Label><Input name="common_name" required defaultValue={editing?.common_name} /></div>
              <div><Label>Scientific Name *</Label><Input name="scientific_name" required placeholder="Panthera tigris" defaultValue={editing?.scientific_name} /></div>
              <div>
                <Label>Category *</Label>
                <Select name="category" defaultValue={editing?.category ?? undefined}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Conservation Status *</Label>
                <Select name="conservation_status" defaultValue={editing?.conservation_status}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map((k) => <SelectItem key={k} value={k}>{k} — {CONSERVATION_LABELS[k]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Population *</Label><Input name="population" type="number" min="0" required defaultValue={editing?.population ?? 0} /></div>
              <div><Label>Average Lifespan (years) *</Label><Input name="average_lifespan" type="number" min="0" required defaultValue={editing?.average_lifespan ?? 0} /></div>
              <div className="col-span-2"><Label>Habitat *</Label><Input name="habitat" required placeholder="Tropical forests, grasslands" defaultValue={editing?.habitat ?? ""} /></div>
              <div className="col-span-2">
                <Label>Food Type *</Label>
                <Select name="food_type" defaultValue={editing?.food_type ?? undefined}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{FOOD_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea name="description" rows={3} defaultValue={editing?.description ?? ""} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || uploading} className="bg-emerald-700 hover:bg-emerald-800">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function categoryLabel(c: Category | null) {
  return CATEGORIES.find((x) => x.value === c)?.label ?? "Uncategorized";
}

function StatBox({ label, value, icon: Icon, tint }: { label: string; value: React.ReactNode; icon: typeof Rabbit; tint: "emerald" | "teal" | "lime" | "red" }) {
  const tints: Record<string, string> = {
    emerald: "bg-emerald-700/10 text-emerald-700",
    teal: "bg-teal-700/10 text-teal-700",
    lime: "bg-lime-700/10 text-lime-700",
    red: "bg-red-600/10 text-red-700",
  };
  return (
    <div className="card-tactical p-4 flex items-center gap-3">
      <div className={`size-10 rounded-md flex items-center justify-center ${tints[tint]}`}><Icon className="h-5 w-5" /></div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-display font-bold">{value}</p>
      </div>
    </div>
  );
}
