import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, Sparkles, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";

import { uploadImage } from "@/services/imageService";
import { classifySpecies } from "../../services/speciesClassificationService";
export const Route = createFileRoute("/_authenticated/species-identification")({
  head: () => ({
    meta: [{ title: "Species Identification — WPIS" }],
  }),
  component: SpeciesIdentification,
});

type Prediction = {
  species: string;
  confidence: number;
};

type ClassificationResult = {
  species: string;
  confidence: number;
  predictions: Prediction[];
};

function SpeciesIdentification() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadedPath, setUploadedPath] = useState("");
  const [classification, setClassification] =
    useState<ClassificationResult | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));

    setUploadedPath("");
    setClassification(null);
    setProgress(0);
  };

  const analyze = async () => {
    if (!selectedFile) {
      toast.error("Upload an image first");
      return;
    }

    try {
      setAnalyzing(true);
      setProgress(20);

      // Step 1: Upload image
      const uploadResult = await uploadImage(selectedFile);

      setUploadedPath(uploadResult.path);
      setProgress(50);

      // Step 2: Run TensorFlow species classifier
      const result = await classifySpecies(uploadResult.path);

      setClassification(result);
      setProgress(100);

      toast.success("Species identification completed");
    } catch (error) {
      console.error("Species identification error:", error);
      toast.error("Species identification failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const clear = () => {
    setPreview(null);
    setSelectedFile(null);
    setUploadedPath("");
    setClassification(null);
    setProgress(0);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const confidenceStatus = (confidence: number) => {
    if (confidence > 0.9) return "High";
    if (confidence > 0.75) return "Medium";
    return "Low";
  };

  return (
    <div>
      <PageHeader
        title="Species Identification"
        description="Upload a wildlife image and use the trained AI model to identify the most likely species."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* =====================================================
            UPLOAD
        ====================================================== */}
        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-display text-lg font-semibold">
              Wildlife Image
            </div>

            <PawPrint className="h-5 w-5 text-muted-foreground" />
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-6 text-center transition hover:bg-muted/50"
          >
            {preview ? (
              <div className="relative w-full">
                <img
                  src={preview}
                  alt="Selected wildlife"
                  className="mx-auto max-h-[340px] rounded-xl object-contain"
                />
              </div>
            ) : (
              <>
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" />

                <div className="text-sm font-medium">
                  Click to upload wildlife image
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  JPG, JPEG, or PNG up to 20MB
                </div>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(event) =>
                onFile(event.target.files?.[0] ?? null)
              }
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              onClick={analyze}
              disabled={!selectedFile || analyzing}
            >
              <Sparkles className="mr-1 h-4 w-4" />

              {analyzing
                ? "Identifying..."
                : "Identify Species"}
            </Button>

            {preview && (
              <Button
                variant="outline"
                onClick={clear}
                disabled={analyzing}
              >
                Clear
              </Button>
            )}
          </div>

          {analyzing && (
            <div className="mt-4">
              <Progress value={progress} />

              <div className="mt-1 text-xs text-muted-foreground">
                {progress < 50
                  ? "Uploading image..."
                  : progress < 100
                    ? "Running species classifier..."
                    : "Complete"}
              </div>
            </div>
          )}

          {uploadedPath && (
            <div className="mt-4 rounded-lg border bg-card/40 p-3 text-sm">
              <div className="font-medium">Uploaded Image</div>

              <div className="mt-1 break-all text-xs text-muted-foreground">
                {uploadedPath}
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            RESULTS
        ====================================================== */}
        <div className="glass rounded-2xl p-5">
          <div className="mb-3 font-display text-lg font-semibold">
            Identification Results
          </div>

          {!classification && (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-muted/30 text-center text-sm text-muted-foreground">
              Upload a wildlife image and run species identification
              to see the AI result.
            </div>
          )}

          {classification && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Main prediction */}
              <div className="rounded-xl border bg-card/60 p-4">
                <div className="text-sm text-muted-foreground">
                  AI Species Classification
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-2xl font-semibold capitalize">
                    {classification.species}
                  </div>

                  <StatusBadge
                    value={confidenceStatus(
                      classification.confidence,
                    )}
                  />
                </div>

                <div className="mt-4">
                  <Progress
                    value={classification.confidence * 100}
                  />

                  <div className="mt-1 text-xs text-muted-foreground">
                    Confidence{" "}
                    {Math.round(
                      classification.confidence * 100,
                    )}
                    %
                  </div>
                </div>
              </div>

              {/* Top predictions */}
              {classification.predictions?.length > 0 && (
                <div className="mt-4 rounded-xl border bg-card/60 p-4">
                  <div className="mb-3 text-sm font-medium">
                    Top Predictions
                  </div>

                  <div className="space-y-4">
                    {classification.predictions.map(
                      (prediction, index) => (
                        <div
                          key={`${prediction.species}-${index}`}
                        >
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="capitalize">
                              {index + 1}.{" "}
                              {prediction.species}
                            </span>

                            <span className="text-muted-foreground">
                              {Math.round(
                                prediction.confidence * 100,
                              )}
                              %
                            </span>
                          </div>

                          <Progress
                            value={
                              prediction.confidence * 100
                            }
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* =====================================================
          AI PIPELINE
      ====================================================== */}
      <div className="glass mt-4 rounded-2xl p-5">
        <div className="mb-2 font-display text-lg font-semibold">
          Species Identification Pipeline
        </div>

        <ol className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
          {[
            "Upload",
            "Preprocess",
            "TensorFlow Model",
            "Classify",
            "Top Predictions",
          ].map((step, index) => (
            <li
              key={step}
              className="rounded-xl border bg-card/60 p-3"
            >
              <div className="text-xs text-muted-foreground">
                Step {index + 1}
              </div>

              <div className="mt-1 font-medium">
                {step}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

