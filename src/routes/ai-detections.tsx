import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Radar } from "lucide-react";

export const Route = createFileRoute("/ai-detections")({
  head: () => ({ meta: [{ title: "AI Telemetry — Vanguard Wilds" }, { name: "description", content: "AI-assisted species detections from images and audio." }] }),
  component: AIDetectionsPage,
});

function AIDetectionsPage() {
  const imgDets = useQuery({
    queryKey: ["img-dets"],
    queryFn: async () => (await supabase.from("image_detections").select("*, survey_images(storage_path, surveys(title))").order("detected_at", { ascending: false }).limit(30)).data ?? [],
  });
  const audDets = useQuery({
    queryKey: ["aud-dets"],
    queryFn: async () => (await supabase.from("audio_detections").select("*, survey_audio(caption, surveys(title))").order("detected_at", { ascending: false }).limit(30)).data ?? [],
  });

  return (
    <AppShell title="AI Telemetry" subtitle="Species classifier output from vision and acoustic models">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h3 className="font-display font-bold uppercase text-sm tracking-wide mb-3 flex items-center gap-2"><Radar className="h-4 w-4" /> Image detections</h3>
          <div className="card-tactical overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground text-left">
                <tr><th className="px-3 py-2">Species</th><th className="px-3 py-2">Conf.</th><th className="px-3 py-2">Survey</th><th className="px-3 py-2">When</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(imgDets.data ?? []).map((d) => (
                  <tr key={d.id}>
                    <td className="px-3 py-2 font-medium">{d.species_label}</td>
                    <td className="px-3 py-2 font-mono">{Math.round(Number(d.confidence) * 100)}%</td>
                    <td className="px-3 py-2 truncate max-w-40">{((d.survey_images as { surveys?: { title?: string } } | null)?.surveys?.title) ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(d.detected_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {imgDets.data?.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No image detections yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="font-display font-bold uppercase text-sm tracking-wide mb-3 flex items-center gap-2"><Radar className="h-4 w-4" /> Audio detections</h3>
          <div className="card-tactical overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground text-left">
                <tr><th className="px-3 py-2">Species</th><th className="px-3 py-2">Conf.</th><th className="px-3 py-2">Segment</th><th className="px-3 py-2">Survey</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(audDets.data ?? []).map((d) => (
                  <tr key={d.id}>
                    <td className="px-3 py-2 font-medium">{d.species_label}</td>
                    <td className="px-3 py-2 font-mono">{Math.round(Number(d.confidence) * 100)}%</td>
                    <td className="px-3 py-2 font-mono text-xs">{Number(d.start_seconds).toFixed(1)}–{Number(d.end_seconds).toFixed(1)}s</td>
                    <td className="px-3 py-2 truncate max-w-40">{((d.survey_audio as { surveys?: { title?: string } } | null)?.surveys?.title) ?? "—"}</td>
                  </tr>
                ))}
                {audDets.data?.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No audio detections yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
