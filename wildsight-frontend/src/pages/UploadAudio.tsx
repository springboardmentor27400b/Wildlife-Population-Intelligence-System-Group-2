import { useState, useRef, type DragEvent } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/services/api";
import { analyzeAudio, type AudioAIResult } from "@/services/ai";
import { AIProcessing } from "@/components/ai/AIProcessing";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CloudUpload, Mic, RotateCcw, Sparkles, X } from "lucide-react";

type Phase = "idle" | "preview" | "uploading" | "analyzing" | "done" | "error";

function Wave({ animate }: { animate: boolean }) {
  const bars = 32;
  return (
    <div className="flex h-16 items-center justify-center gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full gradient-primary"
          initial={{ height: 6 }}
          animate={
            animate
              ? { height: [6, 12 + ((i * 7) % 44), 6] }
              : { height: 8 + ((i * 5) % 20) }
          }
          transition={
            animate
              ? { duration: 0.9 + (i % 5) * 0.1, repeat: Infinity, ease: "easeInOut", delay: (i % 10) * 0.05 }
              : { duration: 0 }
          }
        />
      ))}
    </div>
  );
}

export default function UploadAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AudioAIResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!f.type.startsWith("audio/")) {
      toast.error("Please choose an audio file");
      return;
    }
    setFile(f);
    setAudioUrl(URL.createObjectURL(f));
    setPhase("preview");
    setResult(null);
    setProgress(0);
  };

  const reset = () => {
    setFile(null);
    setAudioUrl("");
    setResult(null);
    setProgress(0);
    setPhase("idle");
  };

  const analyze = async () => {

  if (!file) return;

  setPhase("uploading");
  setProgress(0);

  try {

    // Directly call AI + upload API
    setProgress(40);

    setPhase("analyzing");


    const r = await analyzeAudio(
      file,
      audioUrl
    );


    setProgress(100);

    setResult(r);

    setPhase("done");


    toast.success(
      `Detected: ${r.species}`,
      {
        description:
          `${Math.round(r.confidence)}% confidence`
      }
    );


  } catch(error) {


    console.error(
      "Audio upload error:",
      error
    );


    setPhase("error");


    toast.error(
      "Audio analysis failed"
    );

  }

};

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <PageHeader
        title="AI Bioacoustic Analysis"
        subtitle="Upload field recordings — BirdNET recognizes species from vocalizations."
        actions={
          phase !== "idle" && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" /> New recording
            </button>
          )
        }
      />

      {phase === "idle" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`glass flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition ${
            dragging ? "border-primary bg-primary/5" : "border-border/70 hover:border-primary/40"
          }`}
        >
          <motion.div
            animate={{ y: dragging ? -6 : 0 }}
            className="grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow"
          >
            <Mic className="h-8 w-8" />
          </motion.div>
          <h3 className="mt-4 font-display text-xl font-bold">Drop an audio file to analyze</h3>
          <p className="mt-1 text-sm text-muted-foreground">WAV, MP3, M4A • BirdNET species recognition</p>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="audio/*"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-glow"
          >
            <CloudUpload className="h-4 w-4" /> Browse files
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass mt-2 rounded-3xl p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ready to analyze
                </div>
                <div className="mt-1 truncate font-display text-lg font-bold">{file?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB
                </div>
              </div>
              <button onClick={reset} className="rounded p-1 hover:bg-muted" aria-label="Remove">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-muted/50 p-4">
              <Wave animate={false} />
              <audio controls src={audioUrl} className="mt-3 w-full" />
            </div>
            <button
              onClick={analyze}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow sm:w-auto"
            >
              <Sparkles className="h-4 w-4" /> Analyze with BirdNET
            </button>
          </motion.div>
        )}

        {(phase === "uploading" || phase === "analyzing") && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 space-y-4"
          >
            <div className="glass rounded-2xl p-6 shadow-soft">
              <Wave animate />
            </div>
            <AIProcessing
              progress={phase === "uploading" ? progress * 0.4 : undefined}
              mode="audio"
            />
          </motion.div>
        )}

        {phase === "done" && result && (

<motion.div
key="done"
initial={{opacity:0,scale:0.98}}
animate={{opacity:1,scale:1}}
className="mt-2 space-y-4"
>


<div className="glass overflow-hidden rounded-3xl shadow-soft">


<div className="gradient-primary p-5 text-primary-foreground">


<div className="flex items-center gap-3">


<div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20">

<CheckCircle2 className="h-7 w-7"/>

</div>



<div>


<div className="text-xs uppercase opacity-80">
BirdNET Recognition
</div>


<div className="text-2xl font-bold">
{result.species}
</div>


{result.scientificName && (

<div className="italic text-sm">
{result.scientificName}
</div>

)}


</div>


</div>


</div>



<div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">


<Stat
label="Confidence"
value={`${Math.round(result.confidence)}%`}
/>


<Stat
label="Category"
value={result.category || "Bird"}
/>


<Stat
label="Sound Type"
value={result.soundType || "-"}
/>


<Stat
label="Model"
value={result.model}
/>


</div>




<div className="border-t border-border/60 p-5">


<h3 className="mb-3 text-lg font-bold">

🐦 Bioacoustic Classification

</h3>



<div className="grid gap-3 sm:grid-cols-2 text-sm">


<div>
<b>Species Code:</b>
{" "}
{result.speciesCode || "-"}
</div>



<div>
<b>Conservation:</b>
{" "}
{result.conservationStatus || "-"}
</div>



<div>
<b>Environment Noise:</b>
{" "}
{result.environmentNoise || "-"}
</div>



<div>
<b>Noise Filtered:</b>
{" "}
{result.noiseFiltered ? "✅ Yes":"❌ No"}
</div>



</div>
<div className="border-t border-border/60 p-5">

<h3 className="mb-3 text-lg font-bold">
🧬 Taxonomical Classification
</h3>


<div className="grid gap-3 sm:grid-cols-2 text-sm">


<div>
<b>Scientific Name:</b>
{" "}
{result.scientificName || "-"}
</div>


<div>
<b>Kingdom:</b>
{" "}
{result.kingdom || "-"}
</div>


<div>
<b>Phylum:</b>
{" "}
{result.phylum || "-"}
</div>


<div>
<b>Class:</b>
{" "}
{result.className || "-"}
</div>


<div>
<b>Order:</b>
{" "}
{result.order || "-"}
</div>


<div>
<b>Family:</b>
{" "}
{result.family || "-"}
</div>


<div>
<b>Genus:</b>
{" "}
{result.genus || "-"}
</div>


</div>

</div>

</div>




<div className="border-t border-border/60 p-5">


<audio
controls
src={result.audioUrl}
className="w-full"
/>


</div>



</div>


</motion.div>

)}

        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass mt-2 rounded-2xl p-6 text-center shadow-soft"
          >
            <p className="font-semibold text-destructive">Analysis failed.</p>
            <button
              onClick={analyze}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-bold">{value}</div>
    </div>
  );
}
