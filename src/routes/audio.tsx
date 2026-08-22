import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { AudioLines } from "lucide-react";

export const Route = createFileRoute("/audio")({
  head: () => ({ meta: [{ title: "Acoustic Logs — Vanguard Wilds" }, { name: "description", content: "Audio recordings from field surveys." }] }),
  component: AudioPage,
});

function AudioPage() {
  const rows = useQuery({
    queryKey: ["all-audio"],
    queryFn: async () => {
      const { data } = await supabase.from("survey_audio")
        .select("*, surveys(title)")
        .order("created_at", { ascending: false })
        .limit(50);
      const enriched = await Promise.all((data ?? []).map(async (r) => {
        const { data: signed } = await supabase.storage.from("wildlife-audio").createSignedUrl(r.storage_path, 3600);
        return { ...r, url: signed?.signedUrl };
      }));
      return enriched;
    },
  });

  return (
    <AppShell title="Acoustic Logs" subtitle="Vocalizations, ambient recordings, and passive acoustic monitoring">
      {rows.data?.length === 0 && (
        <div className="card-tactical p-10 text-center text-muted-foreground">
          <AudioLines className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No audio recordings yet.</p>
        </div>
      )}
      <div className="space-y-3">
        {(rows.data ?? []).map((a) => (
          <div key={a.id} className="card-tactical p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{a.caption}</p>
                <p className="text-xs text-muted-foreground">{(a.surveys as { title?: string } | null)?.title} · {new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
            {a.url && <audio controls src={a.url} className="w-full h-9" />}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
