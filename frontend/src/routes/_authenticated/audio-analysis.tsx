import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, AudioLines, Play } from "lucide-react";
import { uploadAudio } from "@/services/audioService";
import { analyzeAudio } from "@/services/audioAnalysisService";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";
export const Route = createFileRoute("/_authenticated/audio-analysis")({
  head: () => ({ meta: [{ title: "Audio Analysis — WPIS" }] }),
  component: AudioAnalysis,
});

function Waveform() {
  const bars = Array.from({ length: 80 }, (_, i) => Math.sin(i / 3) * 0.4 + 0.6 + Math.random() * 0.3);
  return (
    <div className="flex h-24 items-end gap-[3px] rounded-xl bg-muted/30 p-3">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-sm bg-forest/70" style={{ height: `${h * 100}%` }} />
      ))}
    </div>
  );
}

function Spectrogram() {
  const rows = 20;
  const cols = 60;
  return (
    <div className="grid gap-[1px] rounded-xl bg-muted/30 p-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: rows * cols }).map((_, i) => {
        const intensity = Math.abs(Math.sin(i / 7) * Math.cos(i / 13)) * 0.9 + 0.05;
        return (
          <div
            key={i}
            className="h-2"
            style={{ background: `oklch(${0.3 + intensity * 0.5} 0.12 ${155 - intensity * 60})` }}
          />
        );
      })}
    </div>
  );
}

function AudioAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[] | null>(null);
  const [uploadedPath, setUploadedPath] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setAudioUrl(URL.createObjectURL(f));
    setResults(null);
  };

const analyze = async () => {
  if (!file) {
    toast.error("Upload an audio file first");
    return;
  }

  try {
    setAnalyzing(true);
    setProgress(20);
    setResults(null);

    // Step 1: Upload audio
const uploadResult =
  await uploadAudio(file);

if (
  !uploadResult ||
  !uploadResult.path
) {
  throw new Error(
    "Audio upload failed: no file path returned"
  );
}

setUploadedPath(
  uploadResult.path
);

setProgress(60);

const aiResult =
  await analyzeAudio(
    uploadResult.path
  );

if (
  !aiResult ||
  !aiResult.prediction
) {
  throw new Error(
    "Audio analysis returned no prediction"
  );
}
    // Step 3: Display result
    const predictions =
  aiResult.prediction.top_predictions.map(
    (prediction: any) => ({
      label: prediction.label,
      confidence: prediction.confidence,
      time: new Date().toLocaleTimeString(),
    })
  );

setResults(predictions);

    setProgress(100);

    toast.success(
      "Audio analyzed successfully"
    );

  } catch (err) {

    console.error(
      "Audio analysis error:",
      err
    );

    toast.error(
      "Audio analysis failed"
    );

  } finally {

    setAnalyzing(false);

  }
};
  return (
    <div>
      <PageHeader
        title="Bioacoustic Recognition"
       description="Upload environmental audio and use AI-powered bioacoustic analysis to identify wildlife-related sounds."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-display text-lg font-semibold">Upload audio</div>
            <AudioLines className="h-4 w-4 text-muted-foreground" />
          </div>
          <div
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-6 text-center transition hover:bg-muted/50"
          >
            {file ? (
              <div className="w-full">
                <div className="text-sm font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
                {audioUrl && <audio controls src={audioUrl} className="mt-3 w-full" />}
              </div>
            ) : (
              <>
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
               <div className="text-sm font-medium">
  Click to upload audio
</div>

<div className="mt-1 text-xs text-muted-foreground">
  MP3 or WAV — automatically converted to 16 kHz for AI analysis
</div>
                <div className="mt-1 text-xs text-muted-foreground">Bird calls, mammal sounds, ambient</div>
              </>
            )}
            <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={analyze} disabled={!file || analyzing}>
              <Play className="mr-1 h-4 w-4" />
              {analyzing ? "Analyzing…" : "Analyze Audio"}
            </Button>
            {file && <Button
  variant="outline"
  onClick={() => {
    setFile(null);
    setAudioUrl(null);
    setResults(null);
    setUploadedPath("");
    setProgress(0);
  }}
>
  Clear
</Button>}
          </div>
          {analyzing && <Progress className="mt-3" value={progress} />}
          {uploadedPath && (
  <div className="mt-3 rounded-lg border p-3 text-sm">
    <strong>Uploaded File:</strong>
    <br />
    {uploadedPath}
  </div>
)}
          <div className="mt-4 grid gap-3">
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Waveform</div>
              <Waveform />
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Spectrogram</div>
              <Spectrogram />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 font-display text-lg font-semibold"> Audio Recognition Result</div>
          {!results ? (
            <div className="flex h-[320px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
              Upload audio to see AI audio predictions.
            </div>
          ) : (
            <ul className="space-y-3">
              {results.map((r) => (
  <li key={r.label} className="rounded-xl border bg-card/60 p-3">
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{r.label}</div>
        <div className="text-xs text-muted-foreground">
          Detected at {r.time}
        </div>
      </div>

      <StatusBadge
        value={
          r.confidence > 0.9
            ? "High"
            : r.confidence > 0.8
            ? "Medium"
            : "Low"
        }
      />
    </div>

    <div className="mt-2">
      <Progress value={r.confidence * 100} />

      <div className="mt-1 text-xs text-muted-foreground">
        Confidence {Math.round(r.confidence * 100)}%
      </div>
    </div>
  </li>
))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}