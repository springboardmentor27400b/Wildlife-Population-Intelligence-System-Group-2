export interface Survey {
  id: string;
  name: string;
  site: string;
  lat: number;
  lng: number;
  habitat: string;
  protectedArea: string;
  date: string;
  devices: string[];
  status: "Active" | "Completed" | "Planned";
  species: number;
  observations: number;
}

export interface Species {
  id: string;
  name: string;
  scientific: string;
  group: "Mammal" | "Bird" | "Reptile" | "Amphibian" | "Marine" | "Insect";
  status:
    | "Least Concern"
    | "Near Threatened"
    | "Vulnerable"
    | "Endangered"
    | "Critically Endangered";
  habitat: string;
  trend: "Rising" | "Stable" | "Declining";
  population: number;
  image?: string;
}

export interface Detection {
  id: string;
  species: string;
  confidence: number;
  count: number;
  timestamp: string;
  behavior?: string;
  bbox: { x: number; y: number; w: number; h: number };
}

export interface Sighting {
  id: string;
  species: string;
  lat: number;
  lng: number;
  count: number;
  date: string;
  method: "Camera Trap" | "Drone" | "Audio" | "Field Team";
}

export interface Notification {
  id: string;
  type: "endangered" | "decline" | "habitat" | "device" | "survey";
  title: string;
  message: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  read: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  category: "Habitat" | "Protection" | "Priority" | "Resource" | "Monitoring";
  priority: "Low" | "Medium" | "High" | "Urgent";
  detail: string;
  impact: number;
}

export const surveys: Survey[] = [
  {
    id: "SVY-2401",
    name: "Bandipur Tiger Census",
    site: "Bandipur National Park",
    lat: 11.6717,
    lng: 76.6344,
    habitat: "Deciduous Forest",
    protectedArea: "Bandipur NP",
    date: "2026-06-14",
    devices: ["Camera Trap", "Drone"],
    status: "Active",
    species: 42,
    observations: 318,
  },
  {
    id: "SVY-2402",
    name: "Sundarbans Avian Study",
    site: "Sundarbans Delta",
    lat: 21.9497,
    lng: 89.1833,
    habitat: "Mangrove",
    protectedArea: "Sundarbans NP",
    date: "2026-05-22",
    devices: ["Audio Sensor", "Camera Trap"],
    status: "Active",
    species: 87,
    observations: 612,
  },
  {
    id: "SVY-2403",
    name: "Western Ghats Amphibian Survey",
    site: "Silent Valley",
    lat: 11.0833,
    lng: 76.45,
    habitat: "Rainforest",
    protectedArea: "Silent Valley NP",
    date: "2026-04-05",
    devices: ["Audio Sensor", "Environmental Sensor"],
    status: "Completed",
    species: 29,
    observations: 204,
  },
  {
    id: "SVY-2404",
    name: "Kaziranga Rhino Population",
    site: "Kaziranga NP",
    lat: 26.5775,
    lng: 93.1711,
    habitat: "Grassland Wetland",
    protectedArea: "Kaziranga NP",
    date: "2026-07-01",
    devices: ["Drone", "Camera Trap"],
    status: "Planned",
    species: 0,
    observations: 0,
  },
  {
    id: "SVY-2405",
    name: "Gir Lion Monitoring",
    site: "Gir Forest",
    lat: 21.1249,
    lng: 70.8243,
    habitat: "Dry Forest",
    protectedArea: "Gir NP",
    date: "2026-03-18",
    devices: ["Camera Trap"],
    status: "Completed",
    species: 18,
    observations: 156,
  },
];

export const species: Species[] = [
  {
    id: "sp-1",
    name: "Bengal Tiger",
    scientific: "Panthera tigris tigris",
    group: "Mammal",
    status: "Endangered",
    habitat: "Tropical Forest",
    trend: "Rising",
    population: 3167,
  },
  {
    id: "sp-2",
    name: "Indian Rhino",
    scientific: "Rhinoceros unicornis",
    group: "Mammal",
    status: "Vulnerable",
    habitat: "Grassland",
    trend: "Rising",
    population: 4014,
  },
  {
    id: "sp-3",
    name: "Asiatic Lion",
    scientific: "Panthera leo persica",
    group: "Mammal",
    status: "Endangered",
    habitat: "Dry Forest",
    trend: "Rising",
    population: 674,
  },
  {
    id: "sp-4",
    name: "Great Indian Bustard",
    scientific: "Ardeotis nigriceps",
    group: "Bird",
    status: "Critically Endangered",
    habitat: "Grassland",
    trend: "Declining",
    population: 150,
  },
  {
    id: "sp-5",
    name: "Gharial",
    scientific: "Gavialis gangeticus",
    group: "Reptile",
    status: "Critically Endangered",
    habitat: "River",
    trend: "Stable",
    population: 650,
  },
  {
    id: "sp-6",
    name: "Purple Frog",
    scientific: "Nasikabatrachus sahyadrensis",
    group: "Amphibian",
    status: "Endangered",
    habitat: "Western Ghats",
    trend: "Declining",
    population: 135,
  },
  {
    id: "sp-7",
    name: "Dugong",
    scientific: "Dugong dugon",
    group: "Marine",
    status: "Vulnerable",
    habitat: "Coastal Seagrass",
    trend: "Declining",
    population: 250,
  },
  {
    id: "sp-8",
    name: "Sarus Crane",
    scientific: "Antigone antigone",
    group: "Bird",
    status: "Vulnerable",
    habitat: "Wetland",
    trend: "Stable",
    population: 15000,
  },
  {
    id: "sp-9",
    name: "Snow Leopard",
    scientific: "Panthera uncia",
    group: "Mammal",
    status: "Vulnerable",
    habitat: "High Altitude",
    trend: "Stable",
    population: 718,
  },
  {
    id: "sp-10",
    name: "Malabar Tree Toad",
    scientific: "Pedostibes tuberculosus",
    group: "Amphibian",
    status: "Endangered",
    habitat: "Evergreen Forest",
    trend: "Declining",
    population: 800,
  },
];

export const sightings: Sighting[] = [
  { id: "s1", species: "Bengal Tiger", lat: 11.67, lng: 76.63, count: 3, date: "2026-07-05", method: "Camera Trap" },
  { id: "s2", species: "Bengal Tiger", lat: 11.71, lng: 76.71, count: 2, date: "2026-07-04", method: "Camera Trap" },
  { id: "s3", species: "Indian Rhino", lat: 26.58, lng: 93.17, count: 5, date: "2026-07-01", method: "Drone" },
  { id: "s4", species: "Sarus Crane", lat: 27.2, lng: 78.02, count: 12, date: "2026-06-28", method: "Field Team" },
  { id: "s5", species: "Asiatic Lion", lat: 21.12, lng: 70.82, count: 4, date: "2026-06-30", method: "Camera Trap" },
  { id: "s6", species: "Gharial", lat: 26.86, lng: 80.94, count: 8, date: "2026-06-24", method: "Field Team" },
  { id: "s7", species: "Purple Frog", lat: 11.08, lng: 76.45, count: 15, date: "2026-06-18", method: "Audio" },
  { id: "s8", species: "Great Indian Bustard", lat: 26.8, lng: 71.05, count: 2, date: "2026-06-10", method: "Field Team" },
  { id: "s9", species: "Snow Leopard", lat: 34.1, lng: 77.58, count: 1, date: "2026-05-30", method: "Camera Trap" },
  { id: "s10", species: "Dugong", lat: 9.28, lng: 79.31, count: 6, date: "2026-06-02", method: "Drone" },
];

export const populationTrend = [
  { month: "Jan", tiger: 3100, rhino: 3950, lion: 665, bustard: 165 },
  { month: "Feb", tiger: 3115, rhino: 3970, lion: 668, bustard: 162 },
  { month: "Mar", tiger: 3128, rhino: 3988, lion: 670, bustard: 160 },
  { month: "Apr", tiger: 3140, rhino: 3999, lion: 671, bustard: 158 },
  { month: "May", tiger: 3152, rhino: 4005, lion: 672, bustard: 155 },
  { month: "Jun", tiger: 3160, rhino: 4010, lion: 673, bustard: 152 },
  { month: "Jul", tiger: 3167, rhino: 4014, lion: 674, bustard: 150 },
];

export const biodiversityByHabitat = [
  { habitat: "Rainforest", richness: 412, diversity: 3.8 },
  { habitat: "Mangrove", richness: 287, diversity: 3.2 },
  { habitat: "Grassland", richness: 189, diversity: 2.6 },
  { habitat: "Wetland", richness: 356, diversity: 3.4 },
  { habitat: "Dry Forest", richness: 214, diversity: 2.9 },
  { habitat: "Coastal", richness: 176, diversity: 2.7 },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "endangered",
    title: "Critically Endangered species spotted",
    message: "2 Great Indian Bustards detected at Desert NP camera trap #14.",
    timestamp: "2026-07-09T14:23:00Z",
    severity: "critical",
    read: false,
  },
  {
    id: "n2",
    type: "decline",
    title: "Population decline alert",
    message: "Purple Frog observations dropped 22% vs last quarter in Silent Valley.",
    timestamp: "2026-07-09T09:10:00Z",
    severity: "high",
    read: false,
  },
  {
    id: "n3",
    type: "device",
    title: "Monitoring device offline",
    message: "Camera Trap CT-088 has been offline for 36 hours (Sundarbans).",
    timestamp: "2026-07-08T22:45:00Z",
    severity: "medium",
    read: true,
  },
  {
    id: "n4",
    type: "habitat",
    title: "Habitat degradation detected",
    message: "Satellite imagery shows 3.2% canopy loss in Zone B this month.",
    timestamp: "2026-07-07T11:00:00Z",
    severity: "high",
    read: false,
  },
  {
    id: "n5",
    type: "survey",
    title: "Survey completed",
    message: "SVY-2403 Western Ghats Amphibian Survey finalized.",
    timestamp: "2026-07-05T16:32:00Z",
    severity: "low",
    read: true,
  },
];

export const recommendations: Recommendation[] = [
  {
    id: "r1",
    title: "Restore riparian buffer along Kabini River",
    category: "Habitat",
    priority: "High",
    detail: "Replant native species across 12 ha to reconnect elephant corridor.",
    impact: 84,
  },
  {
    id: "r2",
    title: "Deploy additional patrol units in Zone B",
    category: "Protection",
    priority: "Urgent",
    detail: "Poaching signals increased 18% — reinforce with 4 patrol teams.",
    impact: 91,
  },
  {
    id: "r3",
    title: "Prioritize funding for Bustard habitat",
    category: "Priority",
    priority: "Urgent",
    detail: "Species is critically endangered; allocate ₹2.4Cr this quarter.",
    impact: 96,
  },
  {
    id: "r4",
    title: "Reallocate camera traps to Sector 7",
    category: "Resource",
    priority: "Medium",
    detail: "Under-monitored sector shows high biodiversity potential.",
    impact: 62,
  },
  {
    id: "r5",
    title: "Increase acoustic sensor sampling rate",
    category: "Monitoring",
    priority: "Low",
    detail: "Detect rare amphibian calls with 2× temporal resolution.",
    impact: 48,
  },
];

export const detections: Detection[] = [
  { id: "d1", species: "Bengal Tiger", confidence: 0.96, count: 1, timestamp: "12:04:22", behavior: "Walking", bbox: { x: 18, y: 22, w: 46, h: 55 } },
  { id: "d2", species: "Spotted Deer", confidence: 0.88, count: 3, timestamp: "12:04:23", behavior: "Grazing", bbox: { x: 60, y: 40, w: 28, h: 40 } },
  { id: "d3", species: "Wild Boar", confidence: 0.71, count: 1, timestamp: "12:04:24", behavior: "Foraging", bbox: { x: 5, y: 60, w: 20, h: 30 } },
];

export const acousticDetections = [
  { species: "Malabar Whistling Thrush", confidence: 0.94, time: "05:12" },
  { species: "Great Hornbill", confidence: 0.89, time: "06:03" },
  { species: "Indian Cuckoo", confidence: 0.82, time: "06:41" },
  { species: "Purple Frog", confidence: 0.76, time: "22:18" },
];

export const healthScoreBreakdown = {
  overall: 78,
  status: "Healthy" as const,
  parts: [
    { label: "Species Diversity", weight: 30, value: 82 },
    { label: "Population Stability", weight: 25, value: 74 },
    { label: "Habitat Quality", weight: 20, value: 79 },
    { label: "Endangered Species", weight: 15, value: 68 },
    { label: "Environmental Conditions", weight: 10, value: 88 },
  ],
};

export const habitatSummary = [
  { zone: "Zone A", vegetation: 88, water: 74, degradation: 6, suitability: 91 },
  { zone: "Zone B", vegetation: 62, water: 55, degradation: 22, suitability: 58 },
  { zone: "Zone C", vegetation: 79, water: 82, degradation: 9, suitability: 84 },
  { zone: "Zone D", vegetation: 71, water: 68, degradation: 12, suitability: 76 },
];

export const monitoringDevices = [
  { id: "CT-011", type: "Camera Trap", site: "Bandipur", status: "Online", battery: 82 },
  { id: "CT-088", type: "Camera Trap", site: "Sundarbans", status: "Offline", battery: 3 },
  { id: "AS-042", type: "Audio Sensor", site: "Silent Valley", status: "Online", battery: 66 },
  { id: "DR-005", type: "Drone", site: "Kaziranga", status: "Idle", battery: 100 },
  { id: "ES-019", type: "Env. Sensor", site: "Gir Forest", status: "Online", battery: 47 },
];

export const users = [
  { id: "u1", name: "Priya Sharma", email: "priya@wildtrust.org", role: "Wildlife Researcher", active: true },
  { id: "u2", name: "Arjun Menon", email: "arjun@forestdept.gov", role: "Forest Department Officer", active: true },
  { id: "u3", name: "Dr. Lakshmi Rao", email: "lakshmi@conserve.ngo", role: "Conservation Officer", active: true },
  { id: "u4", name: "Ravi Patel", email: "ravi@wpis.io", role: "Administrator", active: true },
  { id: "u5", name: "Neha Iyer", email: "neha@wildtrust.org", role: "Wildlife Researcher", active: false },
];

export const aiModels = [
  { id: "m1", name: "YOLOv8-Wildlife", type: "Image Detection", version: "1.4.2", accuracy: 94.2, status: "Deployed" },
  { id: "m2", name: "BirdNET-Analyzer", type: "Bioacoustic", version: "2.4.0", accuracy: 91.8, status: "Deployed" },
  { id: "m3", name: "YAMNet-Ambient", type: "Audio Classification", version: "1.0.1", accuracy: 87.5, status: "Deployed" },
  { id: "m4", name: "HabitatSeg-U-Net", type: "Satellite Segmentation", version: "0.9.0", accuracy: 88.1, status: "Training" },
  { id: "m5", name: "PopulationForecast-XGB", type: "Time Series", version: "1.1.0", accuracy: 82.4, status: "Deployed" },
];