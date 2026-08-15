import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scan, Cpu, Sparkles } from "lucide-react";

const MESSAGES = [
  "Scanning image…",
  "Detecting animals…",
  "Identifying species…",
  "Generating bounding boxes…",
  "Finalizing prediction…",
];

interface Props {
  progress?: number; // 0-100 optional external control
  mode?: "image" | "audio";
}

export function AIProcessing({ progress, mode = "image" }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [pct, setPct] = useState(progress ?? 8);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 1400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (progress !== undefined) {
      setPct(progress);
      return;
    }
    const t = setInterval(() => setPct((p) => (p < 92 ? p + Math.random() * 6 : p)), 500);
    return () => clearInterval(t);
  }, [progress]);

  const audioMessages = [
    "Loading audio…",
    "Extracting spectrogram…",
    "Running BirdNET…",
    "Matching species…",
    "Finalizing detection…",
  ];
  const list = mode === "audio" ? audioMessages : MESSAGES;

  return (
    <div className="glass rounded-3xl p-6 shadow-soft">
      <div className="flex items-center gap-4">
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow overflow-hidden">
          <motion.div
            className="absolute inset-x-0 h-0.5 bg-white/80"
            initial={{ y: 0 }}
            animate={{ y: [0, 64, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          {mode === "image" ? <Scan className="h-8 w-8 relative" /> : <Sparkles className="h-8 w-8 relative" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold">Analyzing wildlife…</h3>
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-muted-foreground"
          >
            {list[msgIdx % list.length]}
          </motion.p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Cpu className="h-3.5 w-3.5" /> {mode === "image" ? "YOLO + MobileNet" : "BirdNET"}
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full gradient-primary"
          animate={{ width: `${Math.min(100, Math.round(pct))}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="mt-2 text-right text-xs text-muted-foreground">{Math.round(pct)}%</div>
    </div>
  );
}
