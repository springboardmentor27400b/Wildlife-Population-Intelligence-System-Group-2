import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, ImageIcon, AudioLines, Radar, Loader2, MapPin, Sparkles, FileText } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SURVEY_TONE, type SurveyStatus } from "@/lib/wildlife-types";

export const Route = createFileRoute("/surveys/$id")({
  head: () => ({ meta: [{ title: "Survey Detail — Vanguard Wilds" }, { name: "robots", content: "noindex" }] }),
  component: SurveyDetail,
});

function SurveyDetail() {
  const { id } = useParams({ from: "/surveys/$id" });
  const { user } = useAuth();
  const qc = useQueryClient();
  const imgInput = useRef<HTMLInputElement>(null);
  const audInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState<string | null>(null);

  const survey = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => (await supabase.from("surveys").select("*, protected_areas(name)").eq("id", id).maybeSingle()).data,
  });

  const images = useQuery({
    queryKey: ["survey-images", id],
    queryFn: async () => {
      const { data } = await supabase.from("survey_images").select("*, image_detections(*)").eq("survey_id", id).order("created_at", { ascending: false });
      const withUrls = await Promise.all((data ?? []).map(async (r) => {
        const { data: signed } = await supabase.storage.from("wildlife-images").createSignedUrl(r.storage_path, 3600);
        return { ...r, url: signed?.signedUrl };
      }));
      return withUrls;
    },
  });

  const audios = useQuery({
    queryKey: ["survey-audio", id],
    queryFn: async () => {
      const { data } = await supabase.from("survey_audio").select("*, audio_detections(*)").eq("survey_id", id).order("created_at", { ascending: false });
      const withUrls = await Promise.all((data ?? []).map(async (r) => {
        const { data: signed } = await supabase.storage.from("wildlife-audio").createSignedUrl(r.storage_path, 3600);
        return { ...r, url: signed?.signedUrl };
      }));
      return withUrls;
    },
  });

  const uploadImage = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("wildlife-images").upload(path, file, { contentType: file.type });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { error: dbErr } = await supabase.from("survey_images").insert({ survey_id: id, storage_path: path, caption: file.name } as never);
    setUploading(false);
    if (dbErr) toast.error(dbErr.message);
    else { toast.success("Image uploaded."); qc.invalidateQueries({ queryKey: ["survey-images", id] }); }
  };

  const uploadAudio = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("wildlife-audio").upload(path, file, { contentType: file.type });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { error: dbErr } = await supabase.from("survey_audio").insert({ survey_id: id, storage_path: path, caption: file.name } as never);
    setUploading(false);
    if (dbErr) toast.error(dbErr.message);
    else { toast.success("Audio uploaded."); qc.invalidateQueries({ queryKey: ["survey-audio", id] }); }
  };

  const runImageDetection = async (imageId: string) => {
    setDetecting(imageId);
    try {
      const res = await fetch("/api/public/ai/image-detection", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      const rows = (result.detections as Array<{ species_label: string; confidence: number; bbox: [number, number, number, number] }>).map((d) => ({
        image_id: imageId, species_label: d.species_label, confidence: d.confidence,
        bbox_x: d.bbox[0], bbox_y: d.bbox[1], bbox_w: d.bbox[2], bbox_h: d.bbox[3],
      }));
      await supabase.from("image_detections").insert(rows as never);
      toast.success(`Detected ${rows.length} object(s)`);
      qc.invalidateQueries({ queryKey: ["survey-images", id] });
    } catch (e) { toast.error((e as Error).message); } finally { setDetecting(null); }
  };

  const runAudioDetection = async (audioId: string) => {
    setDetecting(audioId);
    try {
      const res = await fetch("/api/public/ai/audio-detection", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio_id: audioId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      const rows = (result.detections as Array<{ species_label: string; confidence: number; start: number; end: number }>).map((d) => ({
        audio_id: audioId, species_label: d.species_label, confidence: d.confidence, start_seconds: d.start, end_seconds: d.end,
      }));
      await supabase.from("audio_detections").insert(rows as never);
      toast.success(`Detected ${rows.length} vocalization(s)`);
      qc.invalidateQueries({ queryKey: ["survey-audio", id] });
    } catch (e) { toast.error((e as Error).message); } finally { setDetecting(null); }
  };

  const s = survey.data as null | {
    id: string; title: string; survey_date: string; survey_time: string | null;
    status: SurveyStatus; team_size: number | null; weather: string | null;
    temperature: number | null; latitude: number | null; longitude: number | null;
    species_observed: string | null; animal_count: number | null; notes: string | null;
    protected_area_id: string | null; protected_areas: { name?: string } | null;
  };

  const trend = useQuery({
    queryKey: ["survey-population-trend", s?.protected_area_id, s?.species_observed],
    enabled: !!s?.protected_area_id,
    queryFn: async () => {
      let q = supabase.from("surveys").select("survey_date, animal_count").order("survey_date");
      if (s?.protected_area_id) q = q.eq("protected_area_id", s.protected_area_id);
      const { data } = await q;
      return (data ?? []).map((r) => ({ date: r.survey_date, population: r.animal_count ?? 0 }));
    },
  });

  const aiSummary = useMemo(() => {
    const imgDet = (images.data ?? []).reduce((n, i) => n + ((i.image_detections as unknown[])?.length ?? 0), 0);
    const audDet = (audios.data ?? []).reduce((n, a) => n + ((a.audio_detections as unknown[])?.length ?? 0), 0);
    return { imgDet, audDet, images: images.data?.length ?? 0, audios: audios.data?.length ?? 0 };
  }, [images.data, audios.data]);

  if (survey.isLoading) {
    return (
      <AppShell title="Survey" subtitle="Loading…">
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!s) {
    return (
      <AppShell title="Survey not found" subtitle="This survey may have been removed.">
        <div className="card-tactical p-10 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No record for this ID.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={s.title} subtitle={`${new Date(s.survey_date).toLocaleDateString()} · ${s.protected_areas?.name ?? "Unassigned"}`}>
      <div className="mb-6 flex gap-4 flex-wrap items-center">
        <span className={`tag-status ${SURVEY_TONE[s.status]}`}>{s.status.replace("_", " ")}</span>
        <span className="font-mono text-[11px] text-muted-foreground">SRV-{s.id.slice(0, 8).toUpperCase()}</span>
      </div>

      {/* Survey info */}
      <section className="card-tactical p-5 mb-6">
        <h3 className="font-display font-bold uppercase text-sm tracking-wide mb-4">Survey Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <InfoField label="Date" value={new Date(s.survey_date).toLocaleDateString()} />
          <InfoField label="Time" value={s.survey_time?.slice(0, 5) ?? "—"} />
          <InfoField label="Team Size" value={String(s.team_size ?? "—")} />
          <InfoField label="Weather" value={s.weather ?? "—"} />
          <InfoField label="Temperature" value={s.temperature != null ? `${s.temperature}°C` : "—"} />
          <InfoField label="Species Observed" value={s.species_observed ?? "—"} />
          <InfoField label="Estimated Population" value={String(s.animal_count ?? 0)} />
          <InfoField label="Coordinates" value={s.latitude != null && s.longitude != null ? `${Number(s.latitude).toFixed(4)}, ${Number(s.longitude).toFixed(4)}` : "—"} />
        </div>
        {s.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Notes</p>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{s.notes}</p>
          </div>
        )}
      </section>

      {/* Map + AI + Trend */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="card-tactical p-4 lg:col-span-1">
          <h3 className="font-display font-bold uppercase text-sm tracking-wide mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> GPS Location</h3>
          {s.latitude != null && s.longitude != null ? (
            <>
              <iframe
                title="Survey location"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(s.longitude) - 0.02},${Number(s.latitude) - 0.02},${Number(s.longitude) + 0.02},${Number(s.latitude) + 0.02}&layer=mapnik&marker=${s.latitude},${s.longitude}`}
                className="w-full h-56 rounded-md border border-border"
                loading="lazy"
              />
              <a
                href={`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=13/${s.latitude}/${s.longitude}`}
                target="_blank" rel="noreferrer"
                className="text-xs text-brand-primary hover:underline mt-2 inline-block"
              >Open in OpenStreetMap →</a>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center">No GPS coordinates recorded.</p>
          )}
        </div>

        <div className="card-tactical p-4 lg:col-span-1">
          <h3 className="font-display font-bold uppercase text-sm tracking-wide mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Results</h3>
          <div className="space-y-3 text-sm">
            <SummaryRow label="Images analyzed" value={`${aiSummary.images}`} />
            <SummaryRow label="Image detections" value={`${aiSummary.imgDet}`} />
            <SummaryRow label="Audio recordings" value={`${aiSummary.audios}`} />
            <SummaryRow label="Vocalizations detected" value={`${aiSummary.audDet}`} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 italic">
            Run AI on each media asset below to populate species detections.
          </p>
        </div>

        <div className="card-tactical p-4 lg:col-span-1">
          <h3 className="font-display font-bold uppercase text-sm tracking-wide mb-3">Population Trend</h3>
          {(trend.data?.length ?? 0) > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend.data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={9} />
                <YAxis fontSize={10} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="population" stroke="#b45309" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center">Not enough data points for this area yet.</p>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-bold uppercase text-sm tracking-wide flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Images</h3>
            <Button size="sm" variant="outline" onClick={() => imgInput.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />} Upload
            </Button>
            <input ref={imgInput} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(images.data ?? []).map((img) => (
              <div key={img.id} className="card-tactical overflow-hidden">
                {img.url ? <img src={img.url} alt={img.caption ?? ""} className="w-full aspect-video object-cover" /> : <div className="aspect-video bg-muted" />}
                <div className="p-3">
                  <p className="text-xs truncate">{img.caption}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{(img.image_detections as unknown[])?.length ?? 0} detection(s)</p>
                  <Button size="sm" variant="ghost" className="w-full mt-2 h-7 text-xs" disabled={detecting === img.id} onClick={() => runImageDetection(img.id)}>
                    {detecting === img.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Radar className="h-3 w-3 mr-1" /> Run AI</>}
                  </Button>
                </div>
              </div>
            ))}
            {images.data?.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No images yet.</p>}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-bold uppercase text-sm tracking-wide flex items-center gap-2"><AudioLines className="h-4 w-4" /> Audio</h3>
            <Button size="sm" variant="outline" onClick={() => audInput.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />} Upload
            </Button>
            <input ref={audInput} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAudio(e.target.files[0])} />
          </div>
          <div className="space-y-3">
            {(audios.data ?? []).map((a) => (
              <div key={a.id} className="card-tactical p-4">
                <p className="text-sm font-medium truncate">{a.caption}</p>
                {a.url && <audio controls src={a.url} className="w-full mt-2 h-9" />}
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[10px] text-muted-foreground">{(a.audio_detections as unknown[])?.length ?? 0} detection(s)</p>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={detecting === a.id} onClick={() => runAudioDetection(a.id)}>
                    {detecting === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Radar className="h-3 w-3 mr-1" /> Run AI</>}
                  </Button>
                </div>
              </div>
            ))}
            {audios.data?.length === 0 && <p className="text-sm text-muted-foreground">No audio recordings yet.</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-border/60 pb-1.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-display font-bold tabular-nums">{value}</span>
    </div>
  );
}
