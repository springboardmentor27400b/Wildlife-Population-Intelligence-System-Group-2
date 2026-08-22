import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const INPUT = z.object({ image_id: z.string().uuid() });

const SPECIES = [
  "Panthera tigris tigris (Bengal Tiger)",
  "Elephas maximus indicus (Indian Elephant)",
  "Melursus ursinus (Sloth Bear)",
  "Panthera pardus fusca (Indian Leopard)",
  "Rusa unicolor (Sambar Deer)",
  "Bos gaurus (Gaur)",
];

export const Route = createFileRoute("/api/public/ai/image-detection")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const parsed = INPUT.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

        // Placeholder: deterministic dummy output. Replace with a real vision model call.
        const count = 1 + Math.floor(Math.random() * 2);
        const detections = Array.from({ length: count }, () => {
          const x = +(Math.random() * 0.4 + 0.1).toFixed(3);
          const y = +(Math.random() * 0.4 + 0.1).toFixed(3);
          return {
            species_label: SPECIES[Math.floor(Math.random() * SPECIES.length)],
            confidence: +(0.7 + Math.random() * 0.28).toFixed(4),
            bbox: [x, y, +(Math.random() * 0.35 + 0.15).toFixed(3), +(Math.random() * 0.4 + 0.2).toFixed(3)] as [number, number, number, number],
          };
        });
        return Response.json({ image_id: parsed.data.image_id, model: "vw-vision-placeholder@0.1", detections });
      },
    },
  },
});
