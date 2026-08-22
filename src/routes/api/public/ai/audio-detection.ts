import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const INPUT = z.object({ audio_id: z.string().uuid() });

const VOCS = [
  "Buceros bicornis call",
  "Panthera tigris territorial roar",
  "Elephas maximus rumble",
  "Cyornis tickelliae song",
  "Ursus vocalisation",
];

export const Route = createFileRoute("/api/public/ai/audio-detection")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const parsed = INPUT.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
        const count = 1 + Math.floor(Math.random() * 2);
        const detections = Array.from({ length: count }, () => {
          const start = +(Math.random() * 15).toFixed(2);
          return {
            species_label: VOCS[Math.floor(Math.random() * VOCS.length)],
            confidence: +(0.65 + Math.random() * 0.3).toFixed(4),
            start,
            end: +(start + 1 + Math.random() * 3).toFixed(2),
          };
        });
        return Response.json({ audio_id: parsed.data.audio_id, model: "vw-acoustic-placeholder@0.1", detections });
      },
    },
  },
});
