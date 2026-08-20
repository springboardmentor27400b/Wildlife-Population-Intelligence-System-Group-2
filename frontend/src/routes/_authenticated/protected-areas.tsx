import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { RoleGuard } from "@/components/role-guard";
import { PageHeader } from "@/components/page-header";
import {
  getProtectedAreas,
  type ProtectedArea,
} from "@/services/protectedAreaService";

export const Route = createFileRoute("/_authenticated/protected-areas")({
  component: ProtectedAreasPage,
});

function ProtectedAreasPage() {
  return (
    <RoleGuard
      allowedRoles={["forest", "conservation", "admin"]}
    >
      <ProtectedAreasContent />
    </RoleGuard>
  );
}

function ProtectedAreasContent() {
  const [areas, setAreas] = useState<ProtectedArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAreas() {
      try {
        const data = await getProtectedAreas();
        setAreas(data);
      } catch (error) {
        console.error(
          "Failed to load protected areas:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadAreas();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Protected Areas"
        description="List of all protected areas"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <div
            key={area.id}
            className="glass rounded-2xl p-5"
          >
            <h2 className="font-display text-lg font-semibold">
              {area.name}
            </h2>

            <p className="text-sm text-muted-foreground">
              {area.state}, {area.district}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Area Type:</strong>{" "}
                {area.area_type}
              </p>

              <p>
                <strong>Total Area:</strong>{" "}
                {area.total_area_sqkm} km²
              </p>

              <p>
                <strong>Latitude:</strong>{" "}
                {area.latitude}
              </p>

              <p>
                <strong>Longitude:</strong>{" "}
                {area.longitude}
              </p>

              <p>
                <strong>Description:</strong>
              </p>

              <p className="text-muted-foreground">
                {area.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
