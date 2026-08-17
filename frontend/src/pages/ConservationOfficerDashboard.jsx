import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function ConservationOfficerDashboard() {
  const [priorities, setPriorities] = useState([]);
  const [restoration, setRestoration] = useState([]);
  const [protection, setProtection] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        prioritiesRes,
        restorationRes,
        protectionRes,
        monitoringRes,
        resourcesRes,
      ] = await Promise.all([
        api.get("/conservation/priorities"),
        api.get("/conservation/habitat-restoration"),
        api.get("/conservation/wildlife-protection"),
        api.get("/conservation/monitoring-optimization"),
        api.get("/conservation/resource-allocation"),
      ]);

      setPriorities(prioritiesRes.data?.conservation_priorities || []);
      setRestoration(restorationRes.data?.habitat_restoration || []);
      setProtection(protectionRes.data?.wildlife_protection || []);
      setMonitoring(
        monitoringRes.data?.monitoring_optimization || []
      );
      setResources(
        resourcesRes.data?.resource_allocation || []
      );
    } catch (err) {
      console.error("Conservation dashboard error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load conservation dashboard data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     DYNAMIC SUMMARY
  ============================================================ */

  const summary = useMemo(() => {
    const critical = priorities.filter(
      (x) => x.priority === "Critical"
    ).length;

    const high = priorities.filter(
      (x) => x.priority === "High"
    ).length;

    const moderate = priorities.filter(
      (x) => x.priority === "Moderate"
    ).length;

    const intensiveMonitoring = monitoring.filter(
      (x) => x.monitoring_level === "Intensive"
    ).length;

    const criticalHabitats = restoration.filter(
      (x) => x.priority === "Critical"
    ).length;

    const veryHighResources = resources.filter(
      (x) => x.allocation_level === "Very High"
    ).length;

    return {
      totalSpecies: priorities.length,
      critical,
      high,
      moderate,
      intensiveMonitoring,
      criticalHabitats,
      veryHighResources,
    };
  }, [priorities, restoration, monitoring, resources]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-600 font-medium">
            Loading Conservation Intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8 max-w-lg w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>

          <h2 className="text-xl font-bold text-red-700">
            Dashboard Loading Failed
          </h2>

          <p className="text-slate-600 mt-2">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-6 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 md:p-8 shadow-xl">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Milestone 4 • Conservation Intelligence
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mt-4">
                Conservation Officer Dashboard
              </h1>

              <p className="text-slate-300 mt-2 max-w-3xl">
                Monitor wildlife threats, conservation priorities,
                habitat restoration, protection strategies,
                monitoring requirements and resource allocation.
              </p>
            </div>

            <button
              onClick={loadDashboard}
              className="bg-white text-emerald-800 px-5 py-3 rounded-xl font-semibold hover:bg-emerald-50"
            >
              ↻ Refresh Intelligence
            </button>

          </div>
        </div>

        {/* ======================================================
            SUMMARY CARDS
        ======================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <SummaryCard
            title="Species Requiring Attention"
            value={summary.totalSpecies}
            icon="🦌"
          />

          <SummaryCard
            title="Critical Species"
            value={summary.critical}
            icon="🚨"
            danger
          />

          <SummaryCard
            title="High Priority Species"
            value={summary.high}
            icon="⚠️"
            warning
          />

          <SummaryCard
            title="Intensive Monitoring Areas"
            value={summary.intensiveMonitoring}
            icon="📡"
          />

        </div>

        {/* ======================================================
            QUICK STATUS
        ======================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <StatusCard
            title="Critical Habitats"
            value={summary.criticalHabitats}
            description="Habitats requiring immediate restoration attention"
            color="red"
          />

          <StatusCard
            title="Very High Resource Areas"
            value={summary.veryHighResources}
            description="Locations requiring maximum conservation resources"
            color="orange"
          />

          <StatusCard
            title="Moderate Priority Species"
            value={summary.moderate}
            description="Species requiring continued monitoring"
            color="emerald"
          />

        </div>

        {/* ======================================================
            SECTION 1 - CONSERVATION PRIORITIES
        ======================================================= */}

        <Section
          title="Conservation Priority Analysis"
          subtitle="Species ranked using population, observation and distribution risks"
        >

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {priorities.map((item, index) => (
              <PriorityCard
                key={`${item.species}-${index}`}
                item={item}
              />
            ))}

          </div>

        </Section>

        {/* ======================================================
            SECTION 2 - THREAT MONITORING
        ======================================================= */}

        <Section
          title="Threat Monitoring"
          subtitle="Species requiring protection based on calculated risk"
        >

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="p-3 text-xs uppercase text-slate-500">
                    Species
                  </th>

                  <th className="p-3 text-xs uppercase text-slate-500">
                    Population
                  </th>

                  <th className="p-3 text-xs uppercase text-slate-500">
                    Population Risk
                  </th>

                  <th className="p-3 text-xs uppercase text-slate-500">
                    Monitoring Risk
                  </th>

                  <th className="p-3 text-xs uppercase text-slate-500">
                    Distribution Risk
                  </th>

                  <th className="p-3 text-xs uppercase text-slate-500">
                    Protection
                  </th>
                </tr>
              </thead>

              <tbody>

                {protection.map((item, index) => (
                  <tr
                    key={`${item.species}-${index}`}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >

                    <td className="p-3 font-semibold text-slate-900">
                      {item.species}
                    </td>

                    <td className="p-3 text-slate-700">
                      {item.population}
                    </td>

                    <td className="p-3">
                      <RiskBadge
                        value={item.population_risk}
                      />
                    </td>

                    <td className="p-3">
                      <RiskBadge
                        value={item.monitoring_risk}
                      />
                    </td>

                    <td className="p-3">
                      <RiskBadge
                        value={item.distribution_risk}
                      />
                    </td>

                    <td className="p-3">
                      <PriorityBadge
                        value={item.protection_level}
                      />
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </Section>

        {/* ======================================================
            SPECIES PROTECTION STRATEGIES
        ======================================================= */}

        <Section
          title="Wildlife Protection Strategies"
          subtitle="Recommended actions generated by the conservation engine"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {protection.map((item, index) => (
              <ProtectionCard
                key={`${item.species}-protection-${index}`}
                item={item}
              />
            ))}

          </div>

        </Section>

        {/* ======================================================
            SPECIES TREND / RISK ANALYSIS
        ======================================================= */}

        <Section
          title="Species Risk Analysis"
          subtitle="Current population and observation signals available from conservation intelligence"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {priorities.map((item, index) => (
              <RiskAnalysisCard
                key={`${item.species}-risk-${index}`}
                item={item}
              />
            ))}

          </div>

        </Section>

        {/* ======================================================
            HABITAT RESTORATION
        ======================================================= */}

        <Section
          title="Habitat Restoration Recommendations"
          subtitle="Habitats ranked according to calculated restoration requirements"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {restoration.map((item, index) => (
              <HabitatCard
                key={`${item.habitat}-${index}`}
                item={item}
              />
            ))}

          </div>

        </Section>

        {/* ======================================================
            MONITORING OPTIMIZATION
        ======================================================= */}

        <Section
          title="Monitoring Optimization"
          subtitle="Recommended monitoring intensity, frequency and methods"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {monitoring.map((item, index) => (
              <MonitoringCard
                key={`${item.location}-${index}`}
                item={item}
              />
            ))}

          </div>

        </Section>

        {/* ======================================================
            RESOURCE ALLOCATION
        ======================================================= */}

        <Section
          title="Resource Allocation"
          subtitle="Recommended conservation resources by location"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {resources.map((item, index) => (
              <ResourceCard
                key={`${item.location}-${index}`}
                item={item}
              />
            ))}

          </div>

        </Section>

        {/* ======================================================
            FINAL ACTION SUMMARY
        ======================================================= */}

        <div className="rounded-3xl bg-emerald-950 text-white p-6 md:p-8">

          <h2 className="text-2xl font-bold">
            Conservation Action Summary
          </h2>

          <p className="text-emerald-200 mt-2">
            Recommended priorities for immediate officer attention.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            <ActionSummary
              number={summary.critical}
              label="Critical species requiring protection"
            />

            <ActionSummary
              number={summary.intensiveMonitoring}
              label="Areas requiring intensive monitoring"
            />

            <ActionSummary
              number={summary.veryHighResources}
              label="Areas requiring very high resources"
            />

          </div>

        </div>

      </div>
    </div>
  );
}


/* ================================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({
  title,
  value,
  icon,
  danger,
  warning,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            {title}
          </p>

          <p
            className={`text-3xl font-bold mt-2 ${
              danger
                ? "text-red-600"
                : warning
                ? "text-orange-600"
                : "text-emerald-600"
            }`}
          >
            {value}
          </p>
        </div>

        <div className="text-3xl">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ================================================================
   STATUS CARD
================================================================ */

function StatusCard({
  title,
  value,
  description,
  color,
}) {

  const colors = {
    red: "border-red-200 bg-red-50 text-red-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${colors[color]}`}
    >

      <p className="text-sm font-semibold">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

      <p className="text-xs mt-2 opacity-80">
        {description}
      </p>

    </div>
  );
}


/* ================================================================
   PRIORITY CARD
================================================================ */

function PriorityCard({ item }) {

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div>

          <h3 className="text-lg font-bold text-slate-900">
            {item.species}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Population: {item.population}
          </p>

        </div>

        <PriorityBadge
          value={item.priority}
        />

      </div>


      <div className="mt-5">

        <div className="flex justify-between text-sm">

          <span className="text-slate-500">
            Priority Score
          </span>

          <strong>
            {item.priority_score}
          </strong>

        </div>

        <ProgressBar
          value={item.priority_score}
          color="emerald"
        />

      </div>


      <div className="grid grid-cols-3 gap-3 mt-5">

        <RiskBox
          title="Population"
          value={item.population_risk}
        />

        <RiskBox
          title="Observation"
          value={item.observation_risk}
        />

        <RiskBox
          title="Distribution"
          value={item.distribution_risk}
        />

      </div>


      <div className="mt-5 rounded-xl bg-slate-50 p-4">

        <p className="text-xs text-slate-500 uppercase font-semibold">
          Recommended Action
        </p>

        <p className="text-sm text-slate-700 mt-1">
          {item.recommendation}
        </p>

      </div>

    </div>
  );
}


/* ================================================================
   PROTECTION CARD
================================================================ */

function ProtectionCard({ item }) {

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex justify-between gap-3">

        <h3 className="font-bold text-slate-900">
          {item.species}
        </h3>

        <PriorityBadge
          value={item.protection_level}
        />

      </div>


      <div className="mt-4">

        <div className="flex justify-between text-sm">

          <span className="text-slate-500">
            Protection Score
          </span>

          <strong>
            {item.protection_score}
          </strong>

        </div>

        <ProgressBar
          value={item.protection_score}
          color="red"
        />

      </div>


      <div className="mt-5 space-y-2">

        {item.strategies?.map(
          (strategy, index) => (
            <div
              key={index}
              className="flex gap-2 text-sm text-slate-700"
            >
              <span className="text-emerald-600">
                ✓
              </span>

              <span>
                {strategy}
              </span>
            </div>
          )
        )}

      </div>


      <div className="mt-5 bg-red-50 rounded-xl p-4">

        <p className="text-xs font-semibold text-red-700">
          Recommendation
        </p>

        <p className="text-sm text-slate-700 mt-1">
          {item.recommendation}
        </p>

      </div>

    </div>
  );
}


/* ================================================================
   RISK ANALYSIS CARD
================================================================ */

function RiskAnalysisCard({ item }) {

  const averageRisk =
    (
      Number(item.population_risk) +
      Number(item.observation_risk) +
      Number(item.distribution_risk)
    ) / 3;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">

      <div className="flex justify-between">

        <h3 className="font-bold">
          {item.species}
        </h3>

        <span className="text-sm font-bold text-slate-700">
          {averageRisk.toFixed(1)}%
        </span>

      </div>

      <p className="text-xs text-slate-500 mt-1">
        Combined current risk indicator
      </p>

      <ProgressBar
        value={averageRisk}
        color="orange"
      />

      <div className="grid grid-cols-3 gap-2 mt-4">

        <MiniMetric
          label="Population"
          value={item.population_risk}
        />

        <MiniMetric
          label="Observation"
          value={item.observation_risk}
        />

        <MiniMetric
          label="Distribution"
          value={item.distribution_risk}
        />

      </div>

    </div>
  );
}


/* ================================================================
   HABITAT CARD
================================================================ */

function HabitatCard({ item }) {

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex justify-between gap-3">

        <div>

          <h3 className="font-bold text-slate-900">
            {item.habitat}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {item.species_count} species •{" "}
            {item.population} population
          </p>

        </div>

        <PriorityBadge
          value={item.priority}
        />

      </div>


      <div className="mt-5">

        <div className="flex justify-between text-sm">

          <span>
            Habitat Health
          </span>

          <strong>
            {item.habitat_health_score}
          </strong>

        </div>

        <ProgressBar
          value={item.habitat_health_score}
          color="emerald"
        />

      </div>


      <div className="mt-4">

        <div className="flex justify-between text-sm">

          <span>
            Restoration Score
          </span>

          <strong>
            {item.restoration_score}
          </strong>

        </div>

        <ProgressBar
          value={item.restoration_score}
          color="red"
        />

      </div>


      <div className="mt-5 space-y-2">

        {item.suggestions?.map(
          (suggestion, index) => (
            <div
              key={index}
              className="text-sm text-slate-700 flex gap-2"
            >
              <span className="text-emerald-600">
                •
              </span>

              <span>
                {suggestion}
              </span>
            </div>
          )
        )}

      </div>

    </div>
  );
}


/* ================================================================
   MONITORING CARD
================================================================ */

function MonitoringCard({ item }) {

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex justify-between gap-3">

        <div>

          <h3 className="font-bold">
            {item.location}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {item.species_count} species •{" "}
            {item.population} population
          </p>

        </div>

        <PriorityBadge
          value={item.monitoring_level}
        />

      </div>


      <div className="mt-5">

        <div className="flex justify-between">

          <span className="text-sm text-slate-500">
            Monitoring Score
          </span>

          <strong>
            {item.monitoring_score}
          </strong>

        </div>

        <ProgressBar
          value={item.monitoring_score}
          color="emerald"
        />

      </div>


      <div className="mt-5 rounded-xl bg-blue-50 p-4">

        <p className="text-xs font-semibold text-blue-700">
          Recommended Frequency
        </p>

        <p className="text-sm font-semibold text-slate-800 mt-1">
          {item.recommended_frequency}
        </p>

      </div>


      <div className="mt-4">

        <p className="text-xs uppercase text-slate-500 font-semibold">
          Methods
        </p>

        <div className="flex flex-wrap gap-2 mt-2">

          {item.recommended_methods?.map(
            (method, index) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-700"
              >
                {method}
              </span>
            )
          )}

        </div>

      </div>


      <p className="mt-4 text-sm text-slate-700">
        {item.recommendation}
      </p>

    </div>
  );
}


/* ================================================================
   RESOURCE CARD
================================================================ */

function ResourceCard({ item }) {

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex justify-between gap-3">

        <div>

          <h3 className="font-bold">
            {item.location}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Population: {item.population}
          </p>

        </div>

        <PriorityBadge
          value={item.allocation_level}
        />

      </div>


      <div className="mt-5">

        <div className="flex justify-between">

          <span className="text-sm text-slate-500">
            Resource Priority
          </span>

          <strong>
            {item.resource_priority_score}
          </strong>

        </div>

        <ProgressBar
          value={item.resource_priority_score}
          color="orange"
        />

      </div>


      <div className="mt-5">

        <div className="flex justify-between text-sm">

          <span>
            Recommended Allocation
          </span>

          <strong>
            {item.allocation_percentage}%
          </strong>

        </div>

      </div>


      <div className="mt-4 space-y-2">

        {item.recommended_resources?.map(
          (resource, index) => (
            <div
              key={index}
              className="text-sm text-slate-700 flex gap-2"
            >
              <span className="text-orange-600">
                ◆
              </span>

              {resource}

            </div>
          )
        )}

      </div>


      <div className="mt-5 bg-orange-50 rounded-xl p-4">

        <p className="text-xs font-semibold text-orange-700">
          Recommendation
        </p>

        <p className="text-sm text-slate-700 mt-1">
          {item.recommendation}
        </p>

      </div>

    </div>
  );
}


/* ================================================================
   GENERIC COMPONENTS
================================================================ */

function Section({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 md:p-6">

      <div className="mb-6">

        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          {subtitle}
        </p>

      </div>

      {children}

    </section>
  );
}


function RiskBox({
  title,
  value,
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">

      <p className="text-[11px] text-slate-500">
        {title}
      </p>

      <p
        className={`text-lg font-bold mt-1 ${riskTextColor(
          value
        )}`}
      >
        {value}%
      </p>

    </div>
  );
}


function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 text-center">

      <p className="text-[10px] text-slate-500">
        {label}
      </p>

      <p
        className={`font-bold text-sm ${riskTextColor(
          value
        )}`}
      >
        {value}%
      </p>

    </div>
  );
}


function ProgressBar({
  value,
  color = "emerald",
}) {

  const colors = {
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2">

      <div
        className={`h-full ${colors[color]}`}
        style={{
          width: `${Math.max(
            0,
            Math.min(Number(value) || 0, 100)
          )}%`,
        }}
      />

    </div>
  );
}


function PriorityBadge({
  value,
}) {

  const text = String(value || "");

  let style =
    "bg-slate-100 text-slate-700";

  if (
    text === "Critical"
  ) {
    style =
      "bg-red-100 text-red-700";
  } else if (
    text === "High" ||
    text === "Very High" ||
    text === "Intensive"
  ) {
    style =
      "bg-orange-100 text-orange-700";
  } else if (
    text === "Moderate"
  ) {
    style =
      "bg-yellow-100 text-yellow-700";
  } else if (
    text === "Low"
  ) {
    style =
      "bg-emerald-100 text-emerald-700";
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${style}`}
    >
      {text}
    </span>
  );
}


function RiskBadge({
  value,
}) {

  const score = Number(value) || 0;

  let style =
    "bg-emerald-100 text-emerald-700";

  if (score >= 75) {
    style =
      "bg-red-100 text-red-700";
  } else if (score >= 50) {
    style =
      "bg-orange-100 text-orange-700";
  } else if (score >= 25) {
    style =
      "bg-yellow-100 text-yellow-700";
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold ${style}`}
    >
      {score}%
    </span>
  );
}


function ActionSummary({
  number,
  label,
}) {
  return (
    <div className="bg-white/10 rounded-2xl p-5">

      <p className="text-3xl font-bold">
        {number}
      </p>

      <p className="text-sm text-emerald-200 mt-1">
        {label}
      </p>

    </div>
  );
}


function riskTextColor(value) {

  const score = Number(value) || 0;

  if (score >= 75) {
    return "text-red-600";
  }

  if (score >= 50) {
    return "text-orange-600";
  }

  if (score >= 25) {
    return "text-yellow-600";
  }

  return "text-emerald-600";
}