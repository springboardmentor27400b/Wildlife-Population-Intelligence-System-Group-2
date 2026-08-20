import { useEffect, useState } from "react";
import type { Sighting } from "@/lib/mock-data";

interface Props {
  sightings: Sighting[];
  height?: number;
  center?: [number, number];
  zoom?: number;
}

export function WildlifeMap({ sightings, height = 480, center = [21.5, 79], zoom = 4 }: Props) {
  const [mod, setMod] = useState<typeof import("react-leaflet") | null>(null);

  useEffect(() => {
    let alive = true;
    import("react-leaflet").then((rl) => {
      if (alive) setMod(rl);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!mod) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border bg-muted/40 text-sm text-muted-foreground"
        style={{ height }}
      >
        Loading interactive map…
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = mod;

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sightings.map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={Math.min(4 + s.count, 16)}
            pathOptions={{ color: "#2f855a", fillColor: "#38a169", fillOpacity: 0.7 }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{s.species}</div>
                <div>Count: {s.count}</div>
                <div>Method: {s.method}</div>
                <div className="text-xs opacity-70">{s.date}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}