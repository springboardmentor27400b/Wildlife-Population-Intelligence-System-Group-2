import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ImageIcon } from "lucide-react";

export const Route = createFileRoute("/images")({
  head: () => ({ meta: [{ title: "Image Library — Vanguard Wilds" }, { name: "description", content: "Trap camera and field images across all surveys." }] }),
  component: ImagesPage,
});

function ImagesPage() {
  const rows = useQuery({
    queryKey: ["all-images"],
    queryFn: async () => {
      const { data } = await supabase.from("survey_images")
        .select("*, surveys(title, protected_areas(name))")
        .order("created_at", { ascending: false })
        .limit(60);
      const enriched = await Promise.all((data ?? []).map(async (r) => {
        const { data: signed } = await supabase.storage.from("wildlife-images").createSignedUrl(r.storage_path, 3600);
        return { ...r, url: signed?.signedUrl };
      }));
      return enriched;
    },
  });

  return (
    <AppShell title="Image Library" subtitle="All trap-camera and field imagery from your surveys">
      {rows.data?.length === 0 && (
        <div className="card-tactical p-10 text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images yet. Upload from a survey to populate the library.</p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {(rows.data ?? []).map((img) => (
          <div key={img.id} className="card-tactical overflow-hidden">
            {img.url ? <img src={img.url} alt={img.caption ?? ""} loading="lazy" className="w-full aspect-square object-cover" /> : <div className="aspect-square bg-muted" />}
            <div className="p-3">
              <p className="text-xs font-medium truncate">{(img.surveys as { title?: string } | null)?.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{new Date(img.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
