import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { getSpecies, type Species } from "@/services/speciesService";
export const Route = createFileRoute("/_authenticated/species")({
  head: () => ({ meta: [{ title: "Species — WPIS" }] }),
  component: SpeciesPage,
});

function SpeciesPage() {
 const [q, setQ] = useState("");
const [group, setGroup] = useState("all");
const [status, setStatus] = useState("all");
  const [species, setSpecies] = useState<Species[]>([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  async function loadSpecies() {
    try {
      const data = await getSpecies();
      setSpecies(data);
    } catch (error) {
      console.error("Failed to load species", error);
    } finally {
      setLoading(false);
    }
  }

  loadSpecies();
}, []);
const filtered = useMemo(() => {
  const t = q.toLowerCase();

  return species.filter(
    (s) =>
      (group === "all" || s.category === group) &&
      (status === "all" || s.iucn_status === status) &&
      (
        s.common_name.toLowerCase().includes(t) ||
        s.scientific_name.toLowerCase().includes(t)
      )
  );
}, [species, q, group, status]);
    useEffect(() => {
  async function loadSpecies() {
    try {
      const data = await getSpecies();
      setSpecies(data);
    } catch (error) {
      console.error("Failed to load species", error);
    } finally {
      setLoading(false);
    }
  }

  loadSpecies();
}, []);
if (loading) {
  return (
    <div className="p-6 text-center">
      Loading species...
    </div>
  );
}
  return (
    <div>
      <PageHeader
        title="Species Catalog"
        description="Browse recognized species with conservation status, habitat, and population trends."
      />
      <div className="glass mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search species" className="pl-8" />
        </div>
        <Select value={group} onValueChange={setGroup}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {["Mammal", "Bird", "Reptile", "Amphibian", "Marine", "Insect"].map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Least Concern", "Near Threatened", "Vulnerable", "Endangered", "Critically Endangered"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((s) => (
          <div key={s.id} className="glass overflow-hidden rounded-2xl">
            <div className="h-32 gradient-forest" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-lg font-semibold">{s.common_name}</div>
                  <div className="text-xs italic text-muted-foreground">{s.scientific_name}</div>
                </div>
                <StatusBadge value={s.iucn_status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Group</div>
                  <div className="font-medium">{s.category}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Description</div>
                  <div className="font-medium">{s.description}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border py-10 text-center text-sm text-muted-foreground">
            No species match your filters.
          </div>
        )}
      </div>
    </div>
  );
}