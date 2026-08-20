import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  addObservation,
  type ObservationCreate,
} from "@/services/observationService";
import { uploadImage } from "@/services/uploadService";
import { getSpecies } from "@/services/speciesService";
import { getProtectedAreas } from "@/services/protectedAreaService";

export const Route = createFileRoute(
  "/_authenticated/add-observation"
)({
  component: AddObservationPage,
});

function AddObservationPage() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState<ObservationCreate>({
    species_id: 1,
    protected_area_id: 1,
    latitude: 0,
    longitude: 0,
    animal_count: 1,
    observation_type: "",
    image_path: "",
    notes: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const s = await getSpecies();
        const a = await getProtectedAreas();

        setSpecies(s);
        setAreas(a);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("wpis.token");

      if (!token) {
        toast.error("Please login first");
        return;
      }

      let imagePath = "";

if (imageFile) {
  const uploadResult = await uploadImage(imageFile, token);

  imagePath = uploadResult.image_path;
}

await addObservation(
  {
    ...form,
    image_path: imagePath,
  },
  token
);

      toast.success("Observation Added Successfully");

      navigate({
        to: "/surveys",
      });

    } catch (err) {
      console.error(err);
      toast.error("Failed to add observation");
    }
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Add Observation"
        description="Record a wildlife observation."
      />

      <form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 space-y-4"
      >

        <div>
          <Label>Species</Label>

          <select
            className="w-full border rounded p-2"
            value={form.species_id}
            onChange={(e) =>
              setForm({
                ...form,
                species_id: Number(e.target.value),
              })
            }
          >
            {species.map((s) => (
              <option key={s.id} value={s.id}>
                {s.common_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Protected Area</Label>

          <select
            className="w-full border rounded p-2"
            value={form.protected_area_id}
            onChange={(e) =>
              setForm({
                ...form,
                protected_area_id: Number(e.target.value),
              })
            }
          >
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Latitude</Label>

          <Input
            type="number"
            value={form.latitude}
            onChange={(e) =>
              setForm({
                ...form,
                latitude: Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <Label>Longitude</Label>

          <Input
            type="number"
            value={form.longitude}
            onChange={(e) =>
              setForm({
                ...form,
                longitude: Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <Label>Animal Count</Label>

          <Input
            type="number"
            value={form.animal_count}
            onChange={(e) =>
              setForm({
                ...form,
                animal_count: Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <Label>Observation Type</Label>

          <Input
            value={form.observation_type}
            onChange={(e) =>
              setForm({
                ...form,
                observation_type: e.target.value,
              })
            }
          />
        </div>

        <div>
  <Label>Upload Image</Label>

  <Input
    type="file"
    accept="image/*"
    onChange={(e) => {
      if (e.target.files?.length) {
        setImageFile(e.target.files[0]);
      }
    }}
  />
</div>

        <div>
          <Label>Notes</Label>

          <Input
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
          />
        </div>

        <Button type="submit">
          Save Observation
        </Button>

      </form>

    </div>
  );
}