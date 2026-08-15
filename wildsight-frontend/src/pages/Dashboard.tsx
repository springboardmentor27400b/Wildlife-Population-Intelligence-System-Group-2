import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import {
  Activity, AlertTriangle, ClipboardList, Cpu, Eye, Leaf, MapPin, TrendingUp,
  CloudSun, Sparkles, ImagePlus, Mic,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import WildlifeMap from "@/components/wildlife/WildlifeMap";
import AdminAnalytics from "@/components/dashboard/AdminAnalytics";
async function safeCount(url: string): Promise<number> {
  try {
    const { data } = await api.get(url);
    if (Array.isArray(data)) return data.length;
    if (typeof data?.totalElements === "number") return data.totalElements;
    if (Array.isArray(data?.content)) return data.content.length;
    return 0;
  } catch { return 0; }
}

const trendData = [
  { m: "Jan", tigers: 42, deer: 210, birds: 340 },
  { m: "Feb", tigers: 45, deer: 220, birds: 355 },
  { m: "Mar", tigers: 48, deer: 232, birds: 370 },
  { m: "Apr", tigers: 47, deer: 240, birds: 380 },
  { m: "May", tigers: 51, deer: 255, birds: 402 },
  { m: "Jun", tigers: 55, deer: 268, birds: 420 },
  { m: "Jul", tigers: 58, deer: 275, birds: 438 },
];

const observationsByHabitat = [
  { name: "Forest", value: 320 },
  { name: "Wetland", value: 140 },
  { name: "Grassland", value: 210 },
  { name: "Mountain", value: 90 },
  { name: "Desert", value: 40 },
];

const activityItems = [
  { icon: Eye, text: "New observation logged — Bengal Tiger, Sundarbans", when: "2m ago", tone: "primary" },
  { icon: ImagePlus, text: "Volunteer uploaded 12 images from Corbett", when: "18m ago", tone: "accent" },
  { icon: AlertTriangle, text: "Endangered species alert: Great Indian Bustard", when: "1h ago", tone: "warning" },
  { icon: Cpu, text: "Camera trap #A-42 battery low (18%)", when: "3h ago", tone: "destructive" },
  { icon: Sparkles, text: "New conservation recommendation generated", when: "5h ago", tone: "primary" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || "VOLUNTEER";
  const [counts, setCounts] = useState({ species: 0, surveys: 0, observations: 0, devices: 0, endangered: 0, locations: 0 });

  const [wildlifeLocations,setWildlifeLocations] = useState<any[]>([]);

  useEffect(() => {

(async()=>{


const [
species,
surveys,
observations,
devices,
endangered,
locations
]=await Promise.all([

safeCount("/api/species"),

safeCount("/api/surveys"),

safeCount("/api/observations"),

safeCount("/api/monitoring-devices"),

safeCount("/api/endangered-species"),

safeCount("/api/monitoring-locations")

]);



setCounts({

species,
surveys,
observations,
devices,
endangered,
locations

});



// LOAD WILDLIFE MAP DATA

try{


const response =
await api.get("/api/dashboard/map");


setWildlifeLocations(
response.data
);


}

catch(error){

console.log(
"Map loading failed",
error
);

}



})();


},[]);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const roleKpis = () => {
    switch (role) {
      case "ADMIN":
        return [
          { title: "Active Surveys", value: counts.surveys, icon: <ClipboardList className="h-5 w-5" />, trend: 8 },
          { title: "Species Count", value: counts.species, icon: <Leaf className="h-5 w-5" />, trend: 3, gradient: true },
          { title: "Threatened", value: counts.endangered, icon: <AlertTriangle className="h-5 w-5" />, trend: -2 },
          { title: "Monitoring Devices", value: counts.devices, icon: <Cpu className="h-5 w-5" />, trend: 5 },
        ];
      case "RESEARCHER":
        return [
          { title: "My Surveys", value: counts.surveys, icon: <ClipboardList className="h-5 w-5" />, trend: 6, gradient: true },
          { title: "Species", value: counts.species, icon: <Leaf className="h-5 w-5" />, trend: 4 },
          { title: "Observations Today", value: Math.floor(counts.observations * 0.1), icon: <Eye className="h-5 w-5" />, trend: 12 },
          { title: "Habitats Studied", value: 24, icon: <TrendingUp className="h-5 w-5" />, trend: 2 },
        ];
      case "FOREST_OFFICER":
        return [
          { title: "Monitoring Sites", value: counts.locations, icon: <MapPin className="h-5 w-5" />, gradient: true },
          { title: "Devices Online", value: counts.devices, icon: <Cpu className="h-5 w-5" />, trend: 3 },
          { title: "Observations", value: counts.observations, icon: <Eye className="h-5 w-5" />, trend: 7 },
          { title: "Alerts", value: 4, icon: <AlertTriangle className="h-5 w-5" />, trend: -1 },
        ];
      default:
        return [
          { title: "My Observations", value: 12, icon: <Eye className="h-5 w-5" />, gradient: true },
          { title: "Uploads", value: 34, icon: <ImagePlus className="h-5 w-5" />, trend: 22 },
          { title: "Species Seen", value: 18, icon: <Leaf className="h-5 w-5" />, trend: 4 },
          { title: "Contribution Rank", value: "#42", icon: <TrendingUp className="h-5 w-5" /> },
        ];
    }
  };

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.fullName?.split(" ")[0] || "Explorer"} 🌿`}
        subtitle={`Here's your ${role.toLowerCase().replace("_", " ")} biodiversity overview.`}
        actions={
          <>
            <Link to="/observations" className="hidden rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted sm:inline-flex">New observation</Link>
            <Link to="/upload-images" className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <ImagePlus className="h-4 w-4" /> Upload
            </Link>
          </>
        }
      />

      {
role === "ADMIN" && (
    <AdminAnalytics />
)
}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roleKpis().map((k, i) => <StatCard key={i} {...k} delay={i * 0.05} />)}
      </div>

      {/* AI intelligence strip */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Wildlife Detections" value={Math.max(counts.observations * 2, 128)} icon={<Sparkles className="h-5 w-5" />} trend={14} gradient />
        <StatCard title="Uploaded Images" value={Math.max(Math.floor(counts.observations * 1.3), 96)} icon={<ImagePlus className="h-5 w-5" />} trend={9} />
        <StatCard title="Uploaded Audio" value={Math.max(Math.floor(counts.observations * 0.4), 24)} icon={<Mic className="h-5 w-5" />} trend={5} />
        <StatCard title="Detection Accuracy" value={"92%"} icon={<Cpu className="h-5 w-5" />} trend={2} />
      </div>

      {/* Recent AI predictions */}
      <RecentAIPredictions />



      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Population trends</h3>
              <p className="text-xs text-muted-foreground">Monthly population estimates across key species</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Last 7 months</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.48 0.14 148)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.48 0.14 148)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.16 148)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.62 0.16 148)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 145)" />
                <XAxis dataKey="m" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 145)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="birds" stroke="oklch(0.62 0.16 148)" fill="url(#g2)" strokeWidth={2} />
                <Area type="monotone" dataKey="deer" stroke="oklch(0.48 0.14 148)" fill="url(#g1)" strokeWidth={2} />
                <Line type="monotone" dataKey="tigers" stroke="oklch(0.55 0.22 27)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5 shadow-soft">
          <div className="mb-4">
            <h3 className="font-display text-lg font-semibold">Recent activity</h3>
            <p className="text-xs text-muted-foreground">Latest events from the field</p>
          </div>
          <ul className="space-y-3">
            {activityItems.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-muted/60">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-${a.tone}/10 text-${a.tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.when}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5 shadow-soft lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display text-lg font-semibold">Observations by habitat</h3>
            <p className="text-xs text-muted-foreground">Distribution across ecosystem types</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={observationsByHabitat}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 145)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="oklch(0.48 0.14 148)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

       {/* REAL WILDLIFE MAP */}

<motion.div

initial={{opacity:0}}

animate={{opacity:1}}

className="
rounded-2xl
overflow-hidden
border
border-border/60
shadow-soft
lg:col-span-1
"

>


<div className="h-[400px]">

<WildlifeMap

locations={
wildlifeLocations
}

/>

</div>


</motion.div>
        {/* Weather widget placeholder */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass flex items-center gap-4 rounded-2xl p-5 shadow-soft">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><CloudSun className="h-7 w-7" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">Field weather • Corbett</div>
            <div className="font-display text-2xl font-bold">27°C • Partly cloudy</div>
            <div className="text-xs text-muted-foreground">Weather widget — coming soon</div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5 shadow-soft lg:col-span-2">
          <h3 className="mb-3 font-display text-lg font-semibold">Quick actions</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { to: "/observations", icon: Eye, label: "Log observation" },
              { to: "/upload-images", icon: ImagePlus, label: "Upload images" },
              { to: "/upload-audio", icon: Mic, label: "Upload audio" },
              { to: "/reports", icon: Activity, label: "View reports" },
            ].map((q) => {
              const Icon = q.icon;
              return (
                <Link key={q.to} to={q.to} className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-background/60 p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{q.label}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* -------- Recent AI predictions (fetches when available, gracefully empty otherwise) -------- */

interface AIPrediction {
  id: string | number;
  species: string;
  confidence: number;
  date: string;
  researcher: string;
  location: string;
  thumbnail?: string;
}

function RecentAIPredictions() {
  const [items, setItems] = useState<AIPrediction[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/ai-predictions", { params: { limit: 6 } });
        const list = Array.isArray(data) ? data : data?.content || [];
        if (list.length > 0) {
          setItems(list.slice(0, 6));
          return;
        }
      } catch { /* fall through to sample */ }
      // Sample cards until backend ships /api/ai-predictions
      setItems([
        { id: 1, species: "Bengal Tiger", confidence: 0.94, date: "2m ago", researcher: "A. Rao", location: "Sundarbans" },
        { id: 2, species: "Asian Elephant", confidence: 0.88, date: "18m ago", researcher: "M. Iyer", location: "Corbett" },
        { id: 3, species: "Indian Peafowl", confidence: 0.91, date: "1h ago", researcher: "K. Singh", location: "Ranthambore" },
        { id: 4, species: "Spotted Deer", confidence: 0.82, date: "3h ago", researcher: "S. Menon", location: "Kanha" },
        { id: 5, species: "Asian Koel", confidence: 0.77, date: "5h ago", researcher: "R. Verma", location: "Nagarhole" },
        { id: 6, species: "Rhesus Macaque", confidence: 0.86, date: "yesterday", researcher: "T. Kaur", location: "Bandipur" },
      ]);
    })();
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Recent AI predictions</h3>
          <p className="text-xs text-muted-foreground">Latest wildlife detections from image & audio pipelines</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Live</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-semibold">{p.species}</div>
                <div className="text-xs text-muted-foreground">{p.location} • {p.date}</div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                p.confidence >= 0.85 ? "bg-success/15 text-success" : p.confidence >= 0.7 ? "bg-primary/10 text-primary" : "bg-warning/15 text-warning"
              }`}>
                {Math.round(p.confidence * 100)}%
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(p.confidence * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full ${
                  p.confidence >= 0.85 ? "bg-success" : p.confidence >= 0.7 ? "bg-primary" : "bg-warning"
                }`}
              />
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Researcher: {p.researcher}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

