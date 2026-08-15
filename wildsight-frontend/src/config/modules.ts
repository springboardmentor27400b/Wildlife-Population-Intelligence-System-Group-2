import type { Role } from "@/contexts/AuthContext";

export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "date"
  | "datetime"
  | "select"
  | "boolean"
  | "email";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  showInTable?: boolean;
}

export interface ModuleDef {
  key: string;
  path: string;
  resource: string;
  title: string;
  subtitle?: string;
  icon: string; // lucide name
  roles: Role[];
  /** Name of the primary key field on the response DTO (e.g. speciesId) */
  primaryKey: string;
  columns: { key: string; label: string }[];
  fields: FieldDef[];
}

const allRoles: Role[] = ["ADMIN", "RESEARCHER", "FOREST_OFFICER", "VOLUNTEER"];

/* ---------- shared option sets ---------- */

const CONSERVATION_STATUS = [
  { label: "Least Concern", value: "LEAST_CONCERN" },
  { label: "Near Threatened", value: "NEAR_THREATENED" },
  { label: "Vulnerable", value: "VULNERABLE" },
  { label: "Endangered", value: "ENDANGERED" },
  { label: "Critically Endangered", value: "CRITICALLY_ENDANGERED" },
];

const IUCN_STATUS = [
  { label: "LC — Least Concern", value: "LC" },
  { label: "NT — Near Threatened", value: "NT" },
  { label: "VU — Vulnerable", value: "VU" },
  { label: "EN — Endangered", value: "EN" },
  { label: "CR — Critically Endangered", value: "CR" },
  { label: "EW — Extinct in the Wild", value: "EW" },
  { label: "EX — Extinct", value: "EX" },
];

const HABITAT_TYPES = [
  { label: "Forest", value: "FOREST" },
  { label: "Grassland", value: "GRASSLAND" },
  { label: "Wetland", value: "WETLAND" },
  { label: "Desert", value: "DESERT" },
  { label: "Marine", value: "MARINE" },
  { label: "Mountain", value: "MOUNTAIN" },
  { label: "Savanna", value: "SAVANNA" },
  { label: "Tundra", value: "TUNDRA" },
];

const DEVICE_STATUS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Faulty", value: "FAULTY" },
];

const SURVEY_STATUS = [
  { label: "Planned", value: "PLANNED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const RISK_LEVEL = [
  { label: "Low", value: "LOW" },
  { label: "Moderate", value: "MODERATE" },
  { label: "High", value: "HIGH" },
  { label: "Critical", value: "CRITICAL" },
];

const POPULATION_TREND = [
  { label: "Increasing", value: "INCREASING" },
  { label: "Stable", value: "STABLE" },
  { label: "Decreasing", value: "DECREASING" },
  { label: "Unknown", value: "UNKNOWN" },
];

/* ---------- modules ---------- */

export const modules: ModuleDef[] = [
  /* ================= SPECIES ================= */
  {
    key: "species",
    path: "/species",
    resource: "species",
    title: "Species",
    subtitle: "Catalog of all tracked wildlife species",
    icon: "Leaf",
    roles: allRoles,
    primaryKey: "speciesId",
    columns: [
      { key: "speciesId", label: "ID" },
      { key: "commonName", label: "Common Name" },
      { key: "scientificName", label: "Scientific Name" },
      { key: "conservationStatus", label: "Status" },
      { key: "iucnStatus", label: "IUCN" },
    ],
    fields: [
      { name: "categoryId", label: "Category ID", type: "number", required: true },
      { name: "commonName", label: "Common Name", type: "text", required: true },
      { name: "scientificName", label: "Scientific Name", type: "text", required: true },
      { name: "conservationStatus", label: "Conservation Status", type: "select", options: CONSERVATION_STATUS },
      { name: "iucnStatus", label: "IUCN Status", type: "select", options: IUCN_STATUS },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },

  /* ============ SPECIES CATEGORIES ============ */
  {
    key: "species-categories",
    path: "/species-categories",
    resource: "species-categories",
    title: "Species Categories",
    subtitle: "Taxonomic groupings for species",
    icon: "FolderTree",
    roles: ["ADMIN", "RESEARCHER"],
    primaryKey: "categoryId",
    columns: [
      { key: "categoryId", label: "ID" },
      { key: "categoryName", label: "Name" },
      { key: "description", label: "Description" },
    ],
    fields: [
      { name: "categoryName", label: "Category Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },

  /* ================= SURVEYS ================= */
  {
    key: "surveys",
    path: "/surveys",
    resource: "surveys",
    title: "Surveys",
    subtitle: "Field surveys and expedition records",
    icon: "ClipboardList",
    roles: ["ADMIN", "RESEARCHER", "FOREST_OFFICER"],
    primaryKey: "surveyId",
    columns: [
      { key: "surveyId", label: "ID" },
      { key: "surveyName", label: "Name" },
      { key: "habitatType", label: "Habitat" },
      { key: "protectedArea", label: "Protected Area" },
      { key: "surveyDate", label: "Date" },
      { key: "status", label: "Status" },
    ],
    fields: [
      { name: "userId", label: "User ID", type: "number", required: true },
      { name: "surveyName", label: "Survey Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "habitatType", label: "Habitat Type", type: "select", options: HABITAT_TYPES },
      { name: "protectedArea", label: "Protected Area", type: "text" },
      { name: "surveyDate", label: "Survey Date", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: SURVEY_STATUS },
    ],
  },

  /* ================= HABITATS ================= */
  {
    key: "habitats",
    path: "/habitats",
    resource: "habitats",
    title: "Habitats",
    subtitle: "Ecosystem and habitat types",
    icon: "Trees",
    roles: allRoles,
    primaryKey: "habitatId",
    columns: [
      { key: "habitatId", label: "ID" },
      { key: "habitatName", label: "Name" },
      { key: "habitatType", label: "Type" },
      { key: "vegetationType", label: "Vegetation" },
    ],
    fields: [
      { name: "habitatName", label: "Habitat Name", type: "text", required: true },
      { name: "habitatType", label: "Habitat Type", type: "select", options: HABITAT_TYPES, required: true },
      { name: "vegetationType", label: "Vegetation Type", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },

  /* ============ MONITORING LOCATIONS ============ */
  {
    key: "monitoring-locations",
    path: "/monitoring-locations",
    resource: "monitoring-locations",
    title: "Monitoring Locations",
    subtitle: "GPS-tagged field monitoring sites",
    icon: "MapPin",
    roles: ["ADMIN", "FOREST_OFFICER", "RESEARCHER"],
    primaryKey: "locationId",
    columns: [
      { key: "locationId", label: "ID" },
      { key: "locationName", label: "Location" },
      { key: "surveyName", label: "Survey" },
      { key: "latitude", label: "Lat" },
      { key: "longitude", label: "Lng" },
      { key: "district", label: "District" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
    ],
    fields: [
      { name: "surveyId", label: "Survey ID", type: "number", required: true },
      { name: "locationName", label: "Location Name", type: "text", required: true },
      { name: "latitude", label: "Latitude", type: "number", required: true },
      { name: "longitude", label: "Longitude", type: "number", required: true },
      { name: "district", label: "District", type: "text" },
      { name: "state", label: "State", type: "text" },
      { name: "country", label: "Country", type: "text" },
    ],
  },

  /* ============ MONITORING DEVICES ============ */
  {
    key: "monitoring-devices",
    path: "/monitoring-devices",
    resource: "monitoring-devices",
    title: "Monitoring Devices",
    subtitle: "Field cameras, audio traps and sensors",
    icon: "Cpu",
    roles: ["ADMIN", "FOREST_OFFICER"],
    primaryKey: "deviceId",
    columns: [
      { key: "deviceId", label: "ID" },
      { key: "deviceName", label: "Device" },
      { key: "deviceType", label: "Type" },
      { key: "serialNumber", label: "Serial #" },
      { key: "locationName", label: "Location" },
      { key: "surveyName", label: "Survey" },
      { key: "status", label: "Status" },
    ],
    fields: [
      { name: "surveyId", label: "Survey ID", type: "number", required: true },
      { name: "deviceTypeId", label: "Device Type ID", type: "number", required: true },
      { name: "deviceName", label: "Device Name", type: "text", required: true },
      { name: "serialNumber", label: "Serial Number", type: "text", required: true },
      { name: "locationId", label: "Location ID", type: "number" },
      { name: "status", label: "Status", type: "select", options: DEVICE_STATUS },
    ],
  },

  /* ================ OBSERVATIONS ================ */
  {
    key: "observations",
    path: "/observations",
    resource: "observations",
    title: "Observations",
    subtitle: "Recorded wildlife sightings",
    icon: "Eye",
    roles: allRoles,
    primaryKey: "observationId",
    columns: [
      { key: "observationId", label: "ID" },
      { key: "commonName", label: "Species" },
      { key: "surveyName", label: "Survey" },
      { key: "locationName", label: "Location" },
      { key: "deviceName", label: "Device" },
      { key: "observationTime", label: "Observed At" },
      { key: "confidenceScore", label: "Confidence" },
    ],
    fields: [
      { name: "surveyId", label: "Survey ID", type: "number", required: true },
      { name: "speciesId", label: "Species ID", type: "number", required: true },
      { name: "locationId", label: "Location ID", type: "number" },
      { name: "deviceId", label: "Device ID", type: "number" },
      { name: "observationTime", label: "Observation Time", type: "datetime", required: true },
      { name: "weather", label: "Weather", type: "text" },
      { name: "confidenceScore", label: "Confidence Score (0-1)", type: "number" },
      { name: "observerNotes", label: "Observer Notes", type: "textarea" },
    ],
  },

  /* ============= AUDIO DETECTIONS ============= */
  {
    key: "audio-detections",
    path: "/audio-detections",
    resource: "audio-detections",
    title: "Audio Detections",
    subtitle: "AI-analyzed audio species detections",
    icon: "AudioLines",
    roles: ["ADMIN", "RESEARCHER", "FOREST_OFFICER"],
    primaryKey: "audioDetectionId",
    columns: [
      { key: "audioDetectionId", label: "ID" },
      { key: "speciesName", label: "Species" },
      { key: "detectedCall", label: "Call" },
      { key: "confidence", label: "Confidence" },
      { key: "noiseLevel", label: "Noise dB" },
      { key: "processedAt", label: "Processed" },
    ],
    fields: [
      { name: "audioId", label: "Audio ID", type: "number", required: true },
      { name: "speciesId", label: "Species ID", type: "number" },
      { name: "confidence", label: "Confidence (0-1)", type: "number" },
      { name: "detectedCall", label: "Detected Call", type: "text" },
      { name: "noiseLevel", label: "Noise Level (dB)", type: "number" },
      { name: "processedAt", label: "Processed At", type: "datetime" },
    ],
  },

  /* ============ ENDANGERED SPECIES ============ */
  {
    key: "endangered-species",
    path: "/endangered-species",
    resource: "endangered-species",
    title: "Endangered Species",
    subtitle: "Registry of threatened wildlife",
    icon: "AlertTriangle",
    roles: ["ADMIN", "RESEARCHER", "FOREST_OFFICER"],
    primaryKey: "endangeredId",
    columns: [
      { key: "endangeredId", label: "ID" },
      { key: "speciesName", label: "Species" },
      { key: "riskLevel", label: "Risk Level" },
      { key: "remarks", label: "Remarks" },
      { key: "updatedAt", label: "Updated" },
    ],
    fields: [
      { name: "speciesId", label: "Species ID", type: "number", required: true },
      { name: "riskLevel", label: "Risk Level", type: "select", options: RISK_LEVEL, required: true },
      { name: "remarks", label: "Remarks", type: "textarea" },
    ],
  },

  /* ============ ENVIRONMENT CONDITIONS ============ */
  {
    key: "environment-conditions",
    path: "/environment-conditions",
    resource: "environment-conditions",
    title: "Environment Conditions",
    subtitle: "Weather & environment readings per habitat",
    icon: "CloudSun",
    roles: ["ADMIN", "RESEARCHER", "FOREST_OFFICER"],
    primaryKey: "conditionId",
    columns: [
      { key: "conditionId", label: "ID" },
      { key: "habitatName", label: "Habitat" },
      { key: "temperature", label: "Temp °C" },
      { key: "humidity", label: "Humidity %" },
      { key: "rainfall", label: "Rain mm" },
      { key: "windSpeed", label: "Wind" },
      { key: "airQuality", label: "AQ" },
      { key: "weatherCondition", label: "Weather" },
      { key: "recordedAt", label: "Recorded" },
    ],
    fields: [
      { name: "habitatId", label: "Habitat ID", type: "number", required: true },
      { name: "surveyId", label: "Survey ID", type: "number" },
      { name: "temperature", label: "Temperature (°C)", type: "number" },
      { name: "humidity", label: "Humidity (%)", type: "number" },
      { name: "rainfall", label: "Rainfall (mm)", type: "number" },
      { name: "windSpeed", label: "Wind Speed (km/h)", type: "number" },
      { name: "airQuality", label: "Air Quality", type: "text" },
      { name: "weatherCondition", label: "Weather Condition", type: "text" },
      { name: "recordedAt", label: "Recorded At", type: "datetime" },
    ],
  },

  /* ============ POPULATION HISTORY ============ */
  {
    key: "population-history",
    path: "/population-history",
    resource: "population-history",
    title: "Population History",
    subtitle: "Historical population trends",
    icon: "LineChart",
    roles: ["ADMIN", "RESEARCHER"],
    primaryKey: "historyId",
    columns: [
      { key: "historyId", label: "ID" },
      { key: "speciesName", label: "Species" },
      { key: "previousPopulation", label: "Previous" },
      { key: "currentPopulation", label: "Current" },
      { key: "trend", label: "Trend" },
      { key: "recordedAt", label: "Recorded" },
    ],
    fields: [
      { name: "estimateId", label: "Estimate ID", type: "number", required: true },
      { name: "speciesId", label: "Species ID", type: "number", required: true },
      { name: "previousPopulation", label: "Previous Population", type: "number" },
      { name: "currentPopulation", label: "Current Population", type: "number", required: true },
      { name: "trend", label: "Trend", type: "select", options: POPULATION_TREND },
    ],
  },

  /* ============ POPULATION ESTIMATES ============ */
  {
    key: "population-estimates",
    path: "/population-estimates",
    resource: "population-estimates",
    title: "Population Estimates",
    subtitle: "Current population estimates per species & survey",
    icon: "BarChart3",
    roles: ["ADMIN", "RESEARCHER"],
    primaryKey: "estimateId",
    columns: [
      { key: "estimateId", label: "ID" },
      { key: "speciesName", label: "Species" },
      { key: "surveyName", label: "Survey" },
      { key: "estimatedPopulation", label: "Estimated" },
      { key: "density", label: "Density" },
      { key: "growthRate", label: "Growth %" },
      { key: "migrationPattern", label: "Migration" },
      { key: "calculatedAt", label: "Calculated" },
    ],
    fields: [
      { name: "speciesId", label: "Species ID", type: "number", required: true },
      { name: "surveyId", label: "Survey ID", type: "number", required: true },
      { name: "estimatedPopulation", label: "Estimated Population", type: "number", required: true },
      { name: "density", label: "Density (per km²)", type: "number" },
      { name: "growthRate", label: "Growth Rate (%)", type: "number" },
      { name: "migrationPattern", label: "Migration Pattern", type: "text" },
    ],
  },

  /* ============ BIODIVERSITY SCORES ============ */
  {
    key: "biodiversity-scores",
    path: "/biodiversity-scores",
    resource: "biodiversity-scores",
    title: "Biodiversity Scores",
    subtitle: "Composite biodiversity health scores per habitat",
    icon: "Gauge",
    roles: ["ADMIN", "RESEARCHER"],
    primaryKey: "biodiversityId",
    columns: [
      { key: "biodiversityId", label: "ID" },
      { key: "habitatName", label: "Habitat" },
      { key: "surveyName", label: "Survey" },
      { key: "speciesDiversityScore", label: "Diversity" },
      { key: "habitatQualityScore", label: "Habitat Q." },
      { key: "ecosystemHealthScore", label: "Ecosystem" },
      { key: "overallScore", label: "Overall" },
      { key: "speciesCount", label: "Species #" },
      { key: "healthStatus", label: "Health" },
      { key: "calculatedAt", label: "Calculated" },
    ],
    fields: [
      { name: "surveyId", label: "Survey ID", type: "number", required: true },
      { name: "habitatId", label: "Habitat ID", type: "number", required: true },
      { name: "speciesDiversityScore", label: "Species Diversity Score", type: "number" },
      { name: "habitatQualityScore", label: "Habitat Quality Score", type: "number" },
      { name: "ecosystemHealthScore", label: "Ecosystem Health Score", type: "number" },
      { name: "overallScore", label: "Overall Score", type: "number" },
      { name: "speciesCount", label: "Species Count", type: "number" },
      { name: "healthStatus", label: "Health Status", type: "select", options: [
        { label: "Excellent", value: "EXCELLENT" },
        { label: "Good", value: "GOOD" },
        { label: "Fair", value: "FAIR" },
        { label: "Poor", value: "POOR" },
        { label: "Critical", value: "CRITICAL" },
      ] },
    ],
  },

  /* ======== CONSERVATION RECOMMENDATIONS ======== */
  {
    key: "conservation-recommendations",
    path: "/conservation-recommendations",
    resource: "conservation-recommendations",
    title: "Conservation Recommendations",
    subtitle: "AI-generated conservation actions",
    icon: "Sparkles",
    roles: ["ADMIN", "RESEARCHER", "FOREST_OFFICER"],
    primaryKey: "recommendationId",
    columns: [
      { key: "recommendationId", label: "ID" },
      { key: "biodiversityId", label: "Biodiversity ID" },
      { key: "overallScore", label: "Score" },
      { key: "priority", label: "Priority" },
      { key: "recommendation", label: "Recommendation" },
      { key: "generatedAt", label: "Generated" },
    ],
    fields: [
      { name: "biodiversityId", label: "Biodiversity ID", type: "number", required: true },
      { name: "overallScore", label: "Overall Score", type: "number" },
      { name: "priority", label: "Priority", type: "select", options: [
        { label: "Low", value: "LOW" },
        { label: "Medium", value: "MEDIUM" },
        { label: "High", value: "HIGH" },
        { label: "Critical", value: "CRITICAL" },
      ], required: true },
      { name: "recommendation", label: "Recommendation", type: "textarea", required: true },
    ],
  },

  /* ============ UPLOADED IMAGES ============ */
  {
    key: "uploaded-images",
    path: "/uploaded-images",
    resource: "uploaded-images",
    title: "Uploaded Images",
    subtitle: "Field photos linked to observations",
    icon: "Image",
    roles: allRoles,
    primaryKey: "imageId",
    columns: [
      { key: "imageId", label: "ID" },
      { key: "fileName", label: "File" },
      { key: "uploaderName", label: "Uploader" },
      { key: "capturedAt", label: "Captured" },
      { key: "uploadTime", label: "Uploaded" },
      { key: "imageQuality", label: "Quality" },
    ],
    fields: [
      { name: "observationId", label: "Observation ID", type: "number", required: true },
      { name: "uploadedBy", label: "Uploaded By (User ID)", type: "number", required: true },
      { name: "fileName", label: "File Name", type: "text", required: true },
      { name: "filePath", label: "File Path", type: "text", required: true },
      { name: "capturedAt", label: "Captured At", type: "datetime" },
      { name: "fileSize", label: "File Size (bytes)", type: "number" },
      { name: "imageQuality", label: "Image Quality (0-1)", type: "number" },
    ],
  },

  /* ============ UPLOADED AUDIO ============ */
  {
    key: "uploaded-audio",
    path: "/uploaded-audio",
    resource: "uploaded-audio",
    title: "Uploaded Audio",
    subtitle: "Field audio recordings linked to observations",
    icon: "Mic",
    roles: allRoles,
    primaryKey: "audioId",
    columns: [
      { key: "audioId", label: "ID" },
      { key: "fileName", label: "File" },
      { key: "uploaderName", label: "Uploader" },
      { key: "capturedAt", label: "Captured" },
      { key: "uploadTime", label: "Uploaded" },
      { key: "durationSeconds", label: "Duration (s)" },
    ],
    fields: [
      { name: "observationId", label: "Observation ID", type: "number", required: true },
      { name: "uploadedBy", label: "Uploaded By (User ID)", type: "number", required: true },
      { name: "fileName", label: "File Name", type: "text", required: true },
      { name: "filePath", label: "File Path", type: "text", required: true },
      { name: "capturedAt", label: "Captured At", type: "datetime" },
      { name: "fileSize", label: "File Size (bytes)", type: "number" },
      { name: "durationSeconds", label: "Duration (seconds)", type: "number" },
    ],
  },
];

export function modulesForRole(role: string) {
  return modules.filter((m) => m.roles.includes(role as Role));
}
