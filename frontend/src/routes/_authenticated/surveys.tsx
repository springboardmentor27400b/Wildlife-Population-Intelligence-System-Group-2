import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  getObservations,
  type Observation,
} from "@/services/observationService";

export const Route = createFileRoute("/_authenticated/surveys")({
  head: () => ({
    meta: [{ title: "Wildlife Observations" }],
  }),
  component: SurveysPage,
});

function SurveysPage() {
  const [items, setItems] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getObservations();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    const text = q.toLowerCase();

    return items.filter(
      (o) =>
        o.observation_type.toLowerCase().includes(text) ||
        o.notes.toLowerCase().includes(text)
    );
  }, [items, q]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading observations...
      </div>
    );
  }

  return (
 <div className="space-y-6">
  <PageHeader
    title="Wildlife Observations"
    description="View wildlife observations recorded from field surveys and monitoring activities."
  />

  <div className="glass rounded-2xl p-4">
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by observation type or notes"
        className="pl-9"
      />
    </div>
  </div>

  <div className="glass overflow-hidden rounded-2xl">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Species</TableHead>
          <TableHead>Protected Area</TableHead>
          <TableHead>Count</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {filtered.map((obs) => (
          <TableRow key={obs.id}>
            <TableCell className="font-medium">{obs.id}</TableCell>

            <TableCell>{obs.species_id}</TableCell>

            <TableCell>{obs.protected_area_id}</TableCell>

            <TableCell>{obs.animal_count}</TableCell>

            <TableCell>{obs.observation_type}</TableCell>

            <TableCell>
              {new Date(obs.observation_date).toLocaleDateString()}
            </TableCell>

            <TableCell>
              {obs.latitude.toFixed(4)}, {obs.longitude.toFixed(4)}
            </TableCell>

            <TableCell className="max-w-[220px] truncate" title={obs.notes}>
              {obs.notes}
            </TableCell>
          </TableRow>
        ))}

        {filtered.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              No observations found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
</div>
  );
}