import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { WildlifeMap } from "@/components/wildlife-map";
import { sightings } from "@/lib/mock-data";
import { KpiCard } from "@/components/kpi-card";
import { MapPin, Camera, Route as RouteIcon, Radio } from "lucide-react";

export const Route = createFileRoute("/_authenticated/maps")({
  head: () => ({ meta: [{ title: "Maps & GIS — WPIS" }] }),
  component: Maps,
});

function Maps() {
  return (
    <div>
      <PageHeader title="Interactive GIS Maps" description="Sightings, camera traps, migration corridors, and monitoring stations." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Sightings (30d)" value={sightings.length * 12} icon={MapPin} accent="forest" />
        <KpiCard label="Camera Traps" value={64} icon={Camera} accent="ocean" />
        <KpiCard label="Corridors Tracked" value={11} icon={RouteIcon} accent="earth" />
        <KpiCard label="Stations Online" value="42/48" icon={Radio} accent="forest" />
      </div>
      <div className="glass mt-4 rounded-2xl p-3">
        <WildlifeMap sightings={sightings} height={540} />
      </div>
      <div className="glass mt-4 rounded-2xl p-5">
        <div className="mb-2 font-display text-lg font-semibold">Layer legend</div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: "#38a169" }} /> Wildlife sighting</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-ocean" /> Protected area</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-earth" /> Migration corridor</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-danger" /> Threat zone</div>
        </div>
      </div>
    </div>
  );
}