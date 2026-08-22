import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const INPUT = z.object({ species_id: z.string().uuid(), protected_area_id: z.string().uuid().optional() });

export const Route = createFileRoute("/api/public/ai/population-estimation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const parsed = INPUT.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
        const observed = 50 + Math.floor(Math.random() * 400);
        return Response.json({
          species_id: parsed.data.species_id,
          protected_area_id: parsed.data.protected_area_id ?? null,
          model: "vw-population-placeholder@0.1",
          observed_count: observed,
          estimated_count: Math.round(observed * (1.3 + Math.random() * 0.6)),
          confidence_interval_pct: 88,
        });
      },
    },
  },
});
