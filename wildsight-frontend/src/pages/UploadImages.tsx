import { useState, useRef, type DragEvent } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/services/api";
import { analyzeImage } from "@/services/ai";
import { AIProcessing } from "@/components/ai/AIProcessing";
import { AIResult, type ImageAIResult } from "@/components/ai/AIResult";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, ImagePlus, RotateCcw, Sparkles, X } from "lucide-react";

type Phase = "idle" | "preview" | "uploading" | "analyzing" | "done" | "error";

export default function UploadImages() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ImageAIResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPhase("preview");
    setResult(null);
    setProgress(0);
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setProgress(0);
    setPhase("idle");
  };

  const analyze = async () => {

    if(!file) return;


    setPhase("uploading");

    setProgress(0);


    try{


        setProgress(50);


        setPhase("analyzing");



        const result = await analyzeImage(

            file,

            preview

        );



        setResult(result);



        setPhase("done");



        const count =
        result.detections.length;



        if(count > 0){

            toast.success(

                `${count} animals detected`,

                {

                    description:
                    result.detections
                    .map(d=>d.species)
                    .slice(0,3)
                    .join(", ")

                }

            );

        }

        else{


            toast.message(

                "No wildlife detected"

            );

        }



    }

    catch(error){


        console.error(
            error
        );


        setPhase("error");


        toast.error(
            "Analysis failed"
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
        title="AI Wildlife Detection"
        subtitle="Upload a wildlife image — YOLO + MobileNet identify species, count animals, and draw bounding boxes."
        actions={
          phase !== "idle" && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" /> New image
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
            <CloudUpload className="h-8 w-8" />
          </motion.div>
          <h3 className="mt-4 font-display text-xl font-bold">Drop an image to analyze</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            PNG, JPG or WEBP • YOLOv8 detection + MobileNetV3 classification
          </p>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-glow"
          >
            <ImagePlus className="h-4 w-4" /> Browse files
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "preview" && preview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass mt-2 grid gap-4 rounded-3xl p-5 shadow-soft md:grid-cols-[1fr_auto]"
          >
            <div className="relative overflow-hidden rounded-2xl bg-muted">
              <img src={preview} alt="preview" className="w-full max-h-[28rem] object-contain" />
              <button
                onClick={reset}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur hover:bg-black/70"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ready to analyze
                </div>
                <div className="mt-1 font-display text-lg font-bold">{file?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {file ? (file.size / 1024).toFixed(0) : 0} KB
                </div>
                <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <li>• Bounding-box detection (YOLO)</li>
                  <li>• Species classification (MobileNet)</li>
                  <li>• Per-animal confidence & crops</li>
                </ul>
              </div>
              <button
                onClick={analyze}
                className="inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"
              >
                <Sparkles className="h-4 w-4" /> Analyze wildlife
              </button>
            </div>
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
            {preview && (
              <div className="glass overflow-hidden rounded-2xl shadow-soft">
                <img src={preview} alt="preview" className="w-full max-h-72 object-contain" />
              </div>
            )}
            <AIProcessing
              progress={phase === "uploading" ? progress * 0.4 : undefined}
              mode="image"
            />
          </motion.div>
        )}

        {phase === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2"
          >
            <AIResult result={result} />
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
