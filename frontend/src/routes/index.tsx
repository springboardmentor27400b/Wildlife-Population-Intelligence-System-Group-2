import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  AudioLines,
  Map as MapIcon,
  Sparkles,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboardService";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: Camera, title: "Camera Trap Vision", body: "YOLO-powered detection, counting, and behavior analysis." },
  { icon: AudioLines, title: "Bioacoustic Recognition", body: "Identify birds and amphibians from field recordings." },
  { icon: MapIcon, title: "GIS Intelligence", body: "Sightings, corridors, and protected areas on live maps." },
  { icon: Sparkles, title: "Conservation AI", body: "Prioritized recommendations grounded in ecosystem data." },
  { icon: ShieldCheck, title: "Role-Based Access", body: "Tailored dashboards for researchers, officers and admins." },
  { icon: Leaf, title: "Ecosystem Health", body: "A single score that summarises biodiversity resilience." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-forest">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="font-display text-lg font-semibold">WPIS</div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-forest" />
            AI-powered biodiversity monitoring
          </div>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
            Wildlife populations, <span className="text-gradient">seen clearly.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            A unified intelligence platform for researchers, conservation officers, and forest departments —
            combining computer vision, bioacoustics, and GIS to protect biodiversity at scale.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Enter platform <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">View live dashboard</Link>
            </Button>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-display text-lg font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
