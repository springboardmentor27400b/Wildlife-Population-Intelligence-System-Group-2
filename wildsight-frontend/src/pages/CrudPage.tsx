import { useEffect, useMemo, useState } from "react";
import type { ModuleDef, FieldDef } from "@/config/modules";
import { createCrudService } from "@/services/api";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Plus, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, Eye,
  Pencil, Trash2, X, Loader2,
} from "lucide-react";
import * as Icons from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ---------- status pill styling ---------- */

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  COMPLETED: "bg-primary/10 text-primary",
  PLANNED: "bg-accent/20 text-accent-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
  INACTIVE: "bg-muted text-muted-foreground",
  MAINTENANCE: "bg-warning/15 text-warning",
  FAULTY: "bg-destructive/10 text-destructive",
  ENDANGERED: "bg-destructive/10 text-destructive",
  CRITICALLY_ENDANGERED: "bg-destructive/15 text-destructive",
  VULNERABLE: "bg-warning/15 text-warning",
  NEAR_THREATENED: "bg-warning/10 text-warning",
  LEAST_CONCERN: "bg-success/10 text-success",
  LOW: "bg-muted text-muted-foreground",
  MODERATE: "bg-warning/10 text-warning",
  MEDIUM: "bg-warning/10 text-warning",
  HIGH: "bg-destructive/10 text-destructive",
  CRITICAL: "bg-destructive/15 text-destructive",
  INCREASING: "bg-success/10 text-success",
  STABLE: "bg-primary/10 text-primary",
  DECREASING: "bg-destructive/10 text-destructive",
  UNKNOWN: "bg-muted text-muted-foreground",
};

function StatusChip({ value }: { value: any }) {
  if (value == null || value === "") return <span className="text-muted-foreground">—</span>;
  const v = String(value);
  const cls = statusStyles[v.toUpperCase()];
  if (!cls) return <span>{v}</span>;
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", cls)}>
      {v.replace(/_/g, " ")}
    </span>
  );
}

function formatCell(key: string, value: any) {
  if (value == null || value === "") return <span className="text-muted-foreground">—</span>;
  if (/status|level|priority|trend|risk/i.test(key)) return <StatusChip value={value} />;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" && /(date|time|at$|At$)/i.test(key)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      // include time when key looks like a timestamp
      if (/time|At$|at$/i.test(key) && value.length > 10) return d.toLocaleString();
      return d.toLocaleDateString();
    }
  }
  if (typeof value === "number" && /confidence|quality/i.test(key)) {
    return (value <= 1 ? (value * 100).toFixed(1) : value.toFixed(2)) + "%";
  }
  return String(value);
}

/* ---------- helpers for form values ---------- */

function toInputValue(field: FieldDef, value: any) {
  if (value == null) return "";
  if (field.type === "datetime" && typeof value === "string") {
    // convert ISO to yyyy-MM-ddTHH:mm for <input type="datetime-local">
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
  if (field.type === "date" && typeof value === "string") {
    return value.slice(0, 10);
  }
  return value;
}

function buildInitial(fields: FieldDef[], record: any) {
  const out: Record<string, any> = {};
  fields.forEach((f) => { out[f.name] = toInputValue(f, record?.[f.name]); });
  return out;
}

/* ---------- record dialog ---------- */

interface RecordDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  fields: FieldDef[];
  initial?: any;
  onSubmit: (data: any) => Promise<void>;
  title: string;
}

function RecordDialog({ open, onOpenChange, fields, initial, onSubmit, title }: RecordDialogProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>({
    defaultValues: initial || {},
  });

  useEffect(() => {
    reset(buildInitial(fields, initial || {}));
  }, [initial, open, reset, fields]);

  const input =
    "h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fill in the fields below. Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (data) => {
            const payload: Record<string, any> = { ...data };
            fields.forEach((f) => {
              const v = payload[f.name];
              if (v === "" || v == null) { payload[f.name] = null; return; }
              if (f.type === "number") payload[f.name] = Number(v);
              else if (f.type === "boolean") payload[f.name] = Boolean(v);
              else if (f.type === "datetime") {
                // convert "yyyy-MM-ddTHH:mm" -> ISO
                const d = new Date(v);
                if (!isNaN(d.getTime())) payload[f.name] = d.toISOString();
              }
            });
            await onSubmit(payload);
          })}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {fields.map((f) => (
            <div key={f.name} className={cn(f.type === "textarea" ? "sm:col-span-2" : "")}>
              <label className="mb-1 block text-xs font-medium">
                {f.label}{f.required && <span className="ml-0.5 text-destructive">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  {...register(f.name, { required: f.required && `${f.label} is required` })}
                  rows={3} placeholder={f.placeholder}
                  className={cn(input, "h-auto py-2")}
                />
              ) : f.type === "select" ? (
                <select
                  className={input}
                  {...register(f.name, { required: f.required && `${f.label} is required` })}
                >
                  <option value="">— select —</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === "boolean" ? (
                <label className="flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-sm">
                  <input type="checkbox" {...register(f.name)} className="h-4 w-4 accent-primary" /> Enabled
                </label>
              ) : (
                <input
                  type={
                    f.type === "datetime" ? "datetime-local"
                    : f.type === "date" ? "date"
                    : f.type === "number" ? "number"
                    : f.type === "email" ? "email"
                    : "text"
                  }
                  step={f.type === "number" ? "any" : undefined}
                  placeholder={f.placeholder}
                  {...register(f.name, { required: f.required && `${f.label} is required` })}
                  className={input}
                />
              )}
              {errors[f.name] && (
                <p className="mt-1 text-xs text-destructive">
                  {String((errors as any)[f.name]?.message || "Invalid")}
                </p>
              )}
            </div>
          ))}
          <DialogFooter className="sm:col-span-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- CRUD page ---------- */

interface Props { module: ModuleDef; }

export function CrudPage({ module: mod }: Props) {
  const svc = useMemo(() => createCrudService(mod.resource), [mod.resource]);
  const pk = mod.primaryKey;

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);

  const Icon = (Icons as any)[mod.icon] || Icons.Layers;

  const load = async () => {
    setLoading(true);
    try {
      setRows(await svc.list());
    } catch (e: any) {
      toast.error(e?.response?.data?.message || `Failed to load ${mod.title}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [mod.resource]);

  const filtered = useMemo(() => {
    let r = rows;
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(s)),
      );
    }
    if (sort) {
      r = [...r].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (sort.dir === "asc" ? 1 : -1);
      });
    }
    return r;
  }, [rows, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [q, sort]);

  const onSort = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const rowId = (row: any) => row?.[pk] ?? row?.id;

  const handleSave = async (data: any) => {
    try {
      const id = editing ? rowId(editing) : undefined;
      if (id != null) {
        await svc.update(id, data);
        toast.success(`${mod.title} updated`);
      } else {
        await svc.create(data);
        toast.success(`${mod.title} created`);
      }
      setOpenForm(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await svc.remove(rowId(toDelete));
      toast.success(`${mod.title} deleted`);
      setToDelete(null);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const singular = mod.title.replace(/s$/, "");

  return (
    <div>
      <PageHeader
        title={mod.title}
        subtitle={mod.subtitle}
        actions={
          <button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"
          >
            <Plus className="h-4 w-4" /> New {singular}
          </button>
        }
      />

      <div className="glass mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-3 shadow-soft">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${mod.title.toLowerCase()}...`}
            className="h-10 w-full rounded-xl border border-border/60 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
          <Filter className="h-4 w-4" /> Filter
        </button>
        <span className="text-xs text-muted-foreground">{filtered.length} records</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {mod.columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-left">
                    <button
                      onClick={() => onSort(c.key)}
                      className="inline-flex items-center gap-1 font-semibold hover:text-foreground"
                    >
                      {c.label} <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={mod.columns.length + 1} className="p-4">
                    <TableSkeleton rows={6} cols={mod.columns.length + 1} />
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={mod.columns.length + 1} className="p-8">
                    <EmptyState
                      title={`No ${mod.title.toLowerCase()} yet`}
                      description="Create your first record to get started."
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {pageRows.map((row) => {
                    const id = rowId(row);
                    return (
                      <motion.tr
                        key={id ?? JSON.stringify(row)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-border/60 transition hover:bg-muted/40"
                      >
                        {mod.columns.map((c) => (
                          <td key={c.key} className="px-4 py-3">{formatCell(c.key, row[c.key])}</td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => setViewing(row)} className="rounded-lg p-2 hover:bg-muted" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { setEditing(row); setOpenForm(true); }}
                              className="rounded-lg p-2 hover:bg-muted"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setToDelete(row)}
                              className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="inline-flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <RecordDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        fields={mod.fields}
        initial={editing || {}}
        onSubmit={handleSave}
        title={editing ? `Edit ${singular}` : `New ${singular}`}
      />

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{singular} details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
              <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
                {Object.entries(viewing).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="col-span-1 truncate text-muted-foreground">{k}</dt>
                    <dd className="col-span-2 break-words font-medium">{formatCell(k, v as any)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setViewing(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              <X className="mr-1 inline h-4 w-4" /> Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete this ${singular.toLowerCase()}?`}
        description="This action cannot be undone."
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
