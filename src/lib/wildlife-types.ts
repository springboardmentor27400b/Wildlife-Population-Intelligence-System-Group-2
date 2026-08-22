export type ConservationStatus = "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX" | "DD";
export type AppRole = "administrator" | "researcher" | "officer";
export type SurveyStatus = "planned" | "in_progress" | "completed" | "archived" | "pending" | "active" | "cancelled";
export type HabitatStatus = "optimal" | "stable" | "caution" | "degraded" | "critical";

export const CONSERVATION_LABELS: Record<ConservationStatus, string> = {
  LC: "Least Concern",
  NT: "Near Threatened",
  VU: "Vulnerable",
  EN: "Endangered",
  CR: "Critically Endangered",
  EW: "Extinct in Wild",
  EX: "Extinct",
  DD: "Data Deficient",
};

export const CONSERVATION_TONE: Record<ConservationStatus, string> = {
  LC: "bg-emerald-100 text-emerald-800",
  NT: "bg-lime-100 text-lime-800",
  VU: "bg-amber-100 text-amber-900",
  EN: "bg-orange-100 text-orange-900",
  CR: "bg-red-100 text-red-800",
  EW: "bg-red-200 text-red-900",
  EX: "bg-neutral-200 text-neutral-800",
  DD: "bg-slate-100 text-slate-700",
};

export const HABITAT_TONE: Record<HabitatStatus, string> = {
  optimal: "text-emerald-600",
  stable: "text-emerald-700",
  caution: "text-amber-600",
  degraded: "text-orange-600",
  critical: "text-red-600",
};

export const SURVEY_TONE: Record<SurveyStatus, string> = {
  planned: "bg-slate-100 text-slate-700",
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-900",
  active: "bg-amber-100 text-amber-900",
  completed: "bg-emerald-100 text-emerald-800",
  archived: "bg-neutral-100 text-neutral-600",
  cancelled: "bg-red-100 text-red-800",
};
