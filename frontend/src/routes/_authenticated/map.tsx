import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

import { PageHeader } from "@/components/page-header";

import {
  getObservations,
  type Observation,
} from "@/services/observationService";

import {
  getSpecies,
  type Species,
} from "@/services/speciesService";

import {
  getProtectedAreas,
  type ProtectedArea,
} from "@/services/protectedAreaService";

export const Route = createFileRoute("/_authenticated/map")({
  component: WildlifeMap,
});

// Fix default Leaflet marker

function WildlifeMap() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [areas, setAreas] = useState<ProtectedArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaflet, setLeaflet] = useState<any>(null);

useEffect(() => {
  async function loadLeaflet() {
    const rl = await import("react-leaflet");
    const L = await import("leaflet");

    delete (L.default.Icon.Default.prototype as any)._getIconUrl;

    L.default.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    setLeaflet(rl);
  }

  loadLeaflet();
}, []);
  useEffect(() => {
    async function load() {
      try {
        const [obs, sp, pa] = await Promise.all([
          getObservations(),
          getSpecies(),
          getProtectedAreas(),
        ]);

        setObservations(obs);
        setSpecies(sp);
        setAreas(pa);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading || !leaflet) {
  return <div className="p-6">Loading map...</div>;
}
const {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} = leaflet;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Wildlife Map"
        description="Live wildlife observations"
      />

      <div className="rounded-2xl overflow-hidden border">
        <MapContainer
          center={[12.97, 77.59]}
          zoom={6}
          style={{ height: "650px", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {observations.map((o) => {
            const sp = species.find(
              (s) => s.id === o.species_id
            );

            const area = areas.find(
              (a) => a.id === o.protected_area_id
            );

            return (
              <Marker
                key={o.id}
                position={[o.latitude, o.longitude]}
              >
                <Popup>
                  <div className="space-y-1">
                    <h3 className="font-bold">
                      {sp?.common_name}
                    </h3>

                    <p>
                      <strong>Protected Area:</strong>{" "}
                      {area?.name}
                    </p>

                    <p>
                      <strong>Animals:</strong>{" "}
                      {o.animal_count}
                    </p>

                    <p>
                      <strong>Type:</strong>{" "}
                      {o.observation_type}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        o.observation_date
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Notes:</strong>{" "}
                      {o.notes}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}