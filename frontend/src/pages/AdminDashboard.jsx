import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [monitoringSites, setMonitoringSites] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersRes, monitoringRes, analyticsRes] =
        await Promise.all([
          api.get("/users"),
          api.get("/monitoring"),
          api.get("/analytics/dashboard"),
        ]);

      setUsers(
        Array.isArray(usersRes.data)
          ? usersRes.data
          : []
      );

      setMonitoringSites(
        Array.isArray(monitoringRes.data)
          ? monitoringRes.data
          : []
      );

      setAnalytics(
        analyticsRes.data || null
      );
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load Admin Dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* -----------------------------
     USER STATISTICS
  ----------------------------- */

  const userStats = useMemo(() => {
    const researchers = users.filter(
      (user) => user.role === "Researcher"
    ).length;

    const admins = users.filter(
      (user) => user.role === "Admin"
    ).length;

    const forestOfficers = users.filter(
      (user) => user.role === "Forest Officer"
    ).length;

    return {
      total: users.length,
      researchers,
      admins,
      forestOfficers,
    };
  }, [users]);

  /* -----------------------------
     MONITORING STATISTICS
  ----------------------------- */

  const monitoringStats = useMemo(() => {
    const locations = new Set(
      monitoringSites.map(
        (site) => site.location
      )
    );

    const habitats = new Set(
      monitoringSites.map(
        (site) => site.habitat_type
      )
    );

    return {
      total: monitoringSites.length,
      locations: locations.size,
      habitats: habitats.size,
    };
  }, [monitoringSites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-600 font-medium">
            Loading Admin Intelligence...
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-lg w-full">

          <div className="text-4xl">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-red-700 mt-3">
            Dashboard Loading Failed
          </h2>

          <p className="text-slate-600 mt-2">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }

  const metrics =
    analytics?.population_metrics || {};

  const species =
    analytics?.species_distribution || [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 md:p-8 shadow-xl">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">

                <span className="w-2 h-2 rounded-full bg-emerald-400" />

                Milestone 4 • Administration

              </span>

              <h1 className="text-3xl md:text-4xl font-bold mt-4">
                Admin Dashboard
              </h1>

              <p className="text-slate-300 mt-2 max-w-3xl">
                Manage users, monitor the wildlife
                intelligence platform and oversee
                system-wide analytics.
              </p>

            </div>

            <button
              onClick={loadDashboard}
              className="px-5 py-3 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50"
            >
              ↻ Refresh
            </button>

          </div>

        </div>


        {/* ======================================
            PLATFORM OVERVIEW
        ====================================== */}

        <section>

          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Platform Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <StatCard
              title="Total Users"
              value={userStats.total}
              icon="👥"
            />

            <StatCard
              title="Monitoring Sites"
              value={monitoringStats.total}
              icon="📍"
            />

            <StatCard
              title="Species"
              value={metrics.species_richness ?? 0}
              icon="🦁"
            />

            <StatCard
              title="Population"
              value={metrics.population_size ?? 0}
              icon="🐘"
            />

          </div>

        </section>


        {/* ======================================
            USER MANAGEMENT
        ====================================== */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                User Management
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Registered platform users and their roles
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <RoleBadge
                label="Researchers"
                value={userStats.researchers}
              />

              <RoleBadge
                label="Admins"
                value={userStats.admins}
              />

              <RoleBadge
                label="Forest Officers"
                value={userStats.forestOfficers}
              />

            </div>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>

                <tr className="border-b border-slate-200">

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    ID
                  </th>

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Name
                  </th>

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Email
                  </th>

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Role
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >

                    <td className="p-3 text-slate-500">
                      #{user.id}
                    </td>

                    <td className="p-3">

                      <div className="font-semibold text-slate-900">
                        {user.full_name}
                      </div>

                    </td>

                    <td className="p-3 text-slate-600">
                      {user.email}
                    </td>

                    <td className="p-3">
                      <RolePill role={user.role} />
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* ======================================
            PLATFORM ANALYTICS
        ====================================== */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              Platform Analytics
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Current wildlife intelligence statistics
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <AnalyticsBox
              title="Population Size"
              value={metrics.population_size}
              icon="🐾"
            />

            <AnalyticsBox
              title="Population Density"
              value={metrics.density}
              icon="📈"
            />

            <AnalyticsBox
              title="Growth Rate"
              value={
                metrics.growth_rate !== undefined
                  ? `${metrics.growth_rate}%`
                  : "—"
              }
              icon="📊"
            />

            <AnalyticsBox
              title="Species Richness"
              value={metrics.species_richness}
              icon="🌿"
            />

          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs uppercase text-slate-500 font-semibold">
                Population Trend
              </p>

              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {metrics.trend || "—"}
              </p>

            </div>


            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs uppercase text-slate-500 font-semibold">
                Dominant Species
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                {metrics.dominant_species || "—"}
              </p>

            </div>

          </div>


          {/* MIGRATION */}

          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">

            <div className="flex items-start gap-4">

              <div className="text-3xl">
                🧭
              </div>

              <div>

                <p className="text-xs uppercase text-blue-600 font-bold">
                  Wildlife Movement
                </p>

                <p className="text-lg font-bold text-slate-900 mt-1">
                  {metrics.migration_status || "No movement data"}
                </p>

                <p className="text-sm text-slate-600 mt-1">
                  {metrics.migration_pattern || "—"}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================
            SPECIES DISTRIBUTION
        ====================================== */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              Species Distribution
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Current population by species
            </p>

          </div>


          <div className="space-y-4">

            {species.map((item) => {

              const maxPopulation = Math.max(
                ...species.map(
                  (s) => s.population || 0
                ),
                1
              );

              const percentage =
                ((item.population || 0) /
                  maxPopulation) *
                100;

              return (
                <div key={item.species}>

                  <div className="flex justify-between mb-1">

                    <span className="font-semibold text-slate-800">
                      {item.species}
                    </span>

                    <span className="font-bold text-slate-900">
                      {item.population}
                    </span>

                  </div>

                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>

        </section>


        {/* ======================================
            MONITORING SYSTEM MANAGEMENT
        ====================================== */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              Monitoring System Management
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Registered monitoring infrastructure
            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

            <AnalyticsBox
              title="Monitoring Records"
              value={monitoringStats.total}
              icon="📍"
            />

            <AnalyticsBox
              title="Protected Areas"
              value={monitoringStats.locations}
              icon="🌳"
            />

            <AnalyticsBox
              title="Habitat Types"
              value={monitoringStats.habitats}
              icon="🌱"
            />

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>

                <tr className="border-b border-slate-200">

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Site
                  </th>

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Location
                  </th>

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Habitat
                  </th>

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    ID
                  </th>

                </tr>

              </thead>

              <tbody>

                {monitoringSites.map(
                  (site) => (

                    <tr
                      key={site.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >

                      <td className="p-3 font-semibold text-slate-900">
                        {site.site_name}
                      </td>

                      <td className="p-3 text-slate-600">
                        {site.location}
                      </td>

                      <td className="p-3">

                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                          {site.habitat_type}
                        </span>

                      </td>

                      <td className="p-3 text-slate-500">
                        #{site.id}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* ======================================
            REPORT GENERATION
        ====================================== */}

        <section className="rounded-3xl bg-emerald-950 text-white p-6 md:p-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                Reports
              </span>

              <h2 className="text-2xl font-bold mt-2">
                Population Report Generation
              </h2>

              <p className="text-emerald-200 mt-2 max-w-2xl">
                Generate and access the latest wildlife
                population report from the backend.
              </p>

            </div>


            <a
              href="http://127.0.0.1:8000/population/report"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 text-center"
            >
              📄 Open Population Report
            </a>

          </div>

        </section>

      </div>

    </div>
  );
}


/* ============================================================
   COMPONENTS
============================================================ */

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            {title}
          </p>

          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {value ?? "—"}
          </p>

        </div>

        <span className="text-3xl">
          {icon}
        </span>

      </div>

    </div>
  );
}


function AnalyticsBox({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-xs uppercase text-slate-500 font-semibold">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-2">
            {value ?? "—"}
          </p>

        </div>

        <span className="text-2xl">
          {icon}
        </span>

      </div>

    </div>
  );
}


function RoleBadge({
  label,
  value,
}) {
  return (
    <div className="px-3 py-2 rounded-xl bg-slate-100">

      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="ml-2 font-bold text-slate-900">
        {value}
      </span>

    </div>
  );
}


function RolePill({
  role,
}) {
  let style =
    "bg-slate-100 text-slate-700";

  if (role === "Admin") {
    style =
      "bg-purple-100 text-purple-700";
  }

  if (role === "Researcher") {
    style =
      "bg-blue-100 text-blue-700";
  }

  if (role === "Forest Officer") {
    style =
      "bg-emerald-100 text-emerald-700";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${style}`}
    >
      {role}
    </span>
  );
}