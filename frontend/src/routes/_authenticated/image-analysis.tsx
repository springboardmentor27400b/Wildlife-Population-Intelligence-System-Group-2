import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, Sparkles, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { analyzeImage } from "@/services/imageAnalysisService";
import { uploadImage } from "@/services/imageService";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/image-analysis")({
  head: () => ({
    meta: [{ title: "Image Analysis — WPIS" }],
  }),
  component: ImageAnalysis,
});

type Detection = {
  species: string;
  confidence: number;
  bbox?: [number, number, number, number];
};

type Prediction = {
  species: string;
  confidence: number;
};

type Classification = {
  species: string;
  confidence: number;
  predictions?: Prediction[];
};

type ImageSize = {
  width: number;
  height: number;
};

function getConfidenceStatus(confidence: number) {
  if (confidence > 0.9) {
    return "High";
  }

  if (confidence > 0.75) {
    return "Medium";
  }

  return "Low";
}

function ImageAnalysis() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadedPath, setUploadedPath] = useState("");
  const [results, setResults] = useState<Detection[]>([]);
  const [classification, setClassification] =
    useState<Classification | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Original image dimensions.
  // YOLO bbox coordinates are based on these dimensions.
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | null) => {
    if (!file) {
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));

    setUploadedPath("");
    setResults([]);
    setClassification(null);
    setProgress(0);
    setImageSize(null);
  };

  const analyze = async () => {
    if (!selectedFile) {
      toast.error("Upload an image first");
      return;
    }

    try {
      setAnalyzing(true);
      setProgress(10);

      // =====================================================
      // STEP 1: Upload image
      // =====================================================

      const uploadResult = await uploadImage(selectedFile);

      setUploadedPath(uploadResult.path);
      setProgress(50);

      // =====================================================
      // STEP 2: Run AI analysis
      // =====================================================

      const aiResult = await analyzeImage(uploadResult.path);

      console.log("AI RESULT:", aiResult);

      setResults(aiResult?.detections ?? []);

      setClassification(
        aiResult?.species_classification ?? null
      );

      setProgress(100);

      toast.success("AI analysis completed successfully");
    } catch (error) {
      console.error("Image analysis error:", error);

      toast.error(
        "Detection failed. Check the backend server."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const clearImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setSelectedFile(null);
    setUploadedPath("");
    setResults([]);
    setClassification(null);
    setProgress(0);
    setImageSize(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div>
      <PageHeader
        title="Wildlife Image Analysis"
        description="Upload camera trap or drone images. AI runs species classification, counting, and behavior detection."
      />

      <div className="grid gap-4 lg:grid-cols-2">

        {/* =====================================================
            UPLOAD PANEL
        ===================================================== */}

        <div className="glass rounded-2xl p-5">

          <div className="mb-3 flex items-center justify-between">
            <div className="font-display text-lg font-semibold">
              Upload
            </div>

            <Camera className="h-4 w-4 text-muted-foreground" />
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-6 text-center transition hover:bg-muted/50"
          >

            {preview ? (

              <div className="flex w-full items-center justify-center">

                {/* =================================================
                    IMAGE + BOUNDING BOX OVERLAY
                ================================================= */}

                <div className="relative inline-block max-w-full">

                  <img
                    src={preview}
                    alt="Wildlife image preview"
                    className="block max-h-[420px] max-w-full rounded-xl object-contain"
                    onLoad={(event) => {
                      const image = event.currentTarget;

                      setImageSize({
                        width: image.naturalWidth,
                        height: image.naturalHeight,
                      });
                    }}
                  />

                  {/* =================================================
                      YOLO BOUNDING BOXES
                  ================================================= */}

                  {imageSize &&
                    results.map((result, index) => {

                      if (!result.bbox) {
                        return null;
                      }

                      const [
                        x1,
                        y1,
                        x2,
                        y2,
                      ] = result.bbox;

                      const left =
                        (x1 / imageSize.width) * 100;

                      const top =
                        (y1 / imageSize.height) * 100;

                      const width =
                        ((x2 - x1) / imageSize.width) * 100;

                      const height =
                        ((y2 - y1) / imageSize.height) * 100;

                      return (
                        <div
                          key={`${result.species}-${index}`}
                          className="pointer-events-none absolute border-2 border-red-500"
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                          }}
                        >

                          {/* Detection label */}

                          <div className="absolute -top-7 left-0 whitespace-nowrap rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-md">
                            {result.species}{" "}
                            {Math.round(
                              result.confidence * 100
                            )}
                            %
                          </div>

                        </div>
                      );
                    })}

                </div>

              </div>

            ) : (

              <>
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />

                <div className="text-sm font-medium">
                  Click to upload camera trap image
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG up to 20MB
                </div>
              </>

            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                onFile(
                  event.target.files?.[0] ?? null
                )
              }
            />

          </div>

          {/* =====================================================
              BUTTONS
          ===================================================== */}

          <div className="mt-4 flex items-center gap-2">

            <Button
              onClick={analyze}
              disabled={!selectedFile || analyzing}
            >
              <Sparkles className="mr-1 h-4 w-4" />

              {analyzing
                ? "Analyzing..."
                : "Run AI detection"}
            </Button>

            {preview && (
              <Button
                variant="outline"
                onClick={clearImage}
                disabled={analyzing}
              >
                Clear
              </Button>
            )}

          </div>

          {/* =====================================================
              PROGRESS
          ===================================================== */}

          {analyzing && (
            <div className="mt-3">

              <Progress value={progress} />

              <div className="mt-1 text-xs text-muted-foreground">
                AI analysis in progress... {progress}%
              </div>

            </div>
          )}

          {/* =====================================================
              UPLOADED PATH
          ===================================================== */}

          {uploadedPath && (
            <div className="mt-3 rounded-lg border p-3 text-sm">

              <strong>Uploaded Image:</strong>

              <br />

              <span className="break-all text-muted-foreground">
                {uploadedPath}
              </span>

            </div>
          )}

        </div>

        {/* =====================================================
            RESULTS PANEL
        ===================================================== */}

        <div className="glass rounded-2xl p-5">

          <div className="mb-3 font-display text-lg font-semibold">
            Detection Results
          </div>

          {/* =================================================
              SPECIES CLASSIFICATION
          ================================================= */}

          {classification && (
            <div className="mb-4 rounded-xl border bg-card/60 p-4">

              <div className="text-sm text-muted-foreground">
                AI Species Classification
              </div>

              <div className="mt-1 flex items-center justify-between">

                <div className="text-xl font-semibold capitalize">
                  {classification.species}
                </div>

                <StatusBadge
                  value={getConfidenceStatus(
                    classification.confidence
                  )}
                />

              </div>

              <div className="mt-3">

                <Progress
                  value={
                    classification.confidence * 100
                  }
                />

                <div className="mt-1 text-xs text-muted-foreground">
                  Confidence{" "}
                  {Math.round(
                    classification.confidence * 100
                  )}
                  %
                </div>

              </div>

              {/* =================================================
                  TOP PREDICTIONS
              ================================================= */}

              {classification.predictions &&
                classification.predictions.length > 0 && (
                  <div className="mt-4">

                    <div className="mb-2 text-sm font-medium">
                      Top Predictions
                    </div>

                    <div className="space-y-2">

                      {classification.predictions.map(
                        (prediction, index) => (
                          <div
                            key={`${prediction.species}-${index}`}
                            className="rounded-lg border p-2"
                          >

                            <div className="flex items-center justify-between text-sm">

                              <span className="capitalize">
                                {prediction.species}
                              </span>

                              <span className="text-muted-foreground">
                                {Math.round(
                                  prediction.confidence *
                                    100
                                )}
                                %
                              </span>

                            </div>

                            <Progress
                              className="mt-1"
                              value={
                                prediction.confidence *
                                100
                              }
                            />

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

            </div>
          )}

          {/* =================================================
              DETECTION COUNT
          ================================================= */}

          {results.length > 0 && (
            <div className="mb-4 rounded-xl border bg-card/60 p-4">

              <div className="text-sm text-muted-foreground">
                Animals Detected
              </div>

              <div className="mt-1 text-2xl font-semibold">
                {results.length}
              </div>

            </div>
          )}

          {/* =================================================
              NO RESULTS
          ================================================= */}

          {results.length === 0 && !classification && (
            <div className="flex h-[280px] items-center justify-center rounded-xl bg-muted/30 text-center text-sm text-muted-foreground">
              Upload an image and run detection to see AI
              results.
            </div>
          )}

          {/* =================================================
              YOLO DETECTIONS
          ================================================= */}

          {results.length > 0 && (
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="space-y-3"
            >

              {results.map((result, index) => (
                <motion.li
                  key={`${result.species}-${index}`}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 8,
                    },
                    show: {
                      opacity: 1,
                      y: 0,
                    },
                  }}
                  className="rounded-xl border bg-card/60 p-3"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="font-medium capitalize">
                        {result.species}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Detection #{index + 1}
                      </div>

                    </div>

                    <StatusBadge
                      value={getConfidenceStatus(
                        result.confidence
                      )}
                    />

                  </div>

                  <div className="mt-2">

                    <Progress
                      value={
                        result.confidence * 100
                      }
                    />

                    <div className="mt-1 text-xs text-muted-foreground">
                      Confidence{" "}
                      {Math.round(
                        result.confidence * 100
                      )}
                      %
                    </div>

                  </div>

                  {result.bbox && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Bounding box:{" "}
                      {result.bbox
                        .map((value) =>
                          Math.round(value)
                        )
                        .join(", ")}
                    </div>
                  )}

                </motion.li>
              ))}

            </motion.ul>
          )}

        </div>
      </div>

      {/* =====================================================
          AI PIPELINE
      ===================================================== */}

      <div className="glass mt-4 rounded-2xl p-5">

        <div className="mb-2 font-display text-lg font-semibold">
          AI Pipeline
        </div>

        <ol className="grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">

          {[
            "Upload",
            "Preprocess",
            "Detect",
            "Classify",
            "Count",
            "Behavior",
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

