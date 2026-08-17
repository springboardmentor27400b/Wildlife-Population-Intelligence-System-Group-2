import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function ForestDepartmentDashboard() {
  const [sites, setSites] = useState([]);
  const [population, setPopulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadForestDashboard();
  }, []);

  const loadForestDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [sitesRes, populationRes] = await Promise.all([
        api.get("/monitoring"),
        api.post("/trend/analysis", {
          previous_population: 25,
          current_population: 32,
        }),
      ]);

      setSites(Array.isArray(sitesRes.data) ? sitesRes.data : []);

      setPopulation(
        populationRes.data || null
      );
    } catch (err) {
      console.error(
        "Forest dashboard error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load Forest Department Dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const statistics = useMemo(() => {
    const uniqueLocations = new Set(
      sites.map((site) => site.location)
    );

    const uniqueHabitats = new Set(
      sites.map((site) => site.habitat_type)
    );

    const uniqueSites = new Set(
      sites.map(
        (site) =>
          `${site.site_name}-${site.location}`
      )
    );

    return {
      totalSites: uniqueSites.size,
      protectedAreas: uniqueLocations.size,
      habitatTypes: uniqueHabitats.size,
      totalRecords: sites.length,
    };
  }, [sites]);

  const locationSummary = useMemo(() => {
    const grouped = {};

    sites.forEach((site) => {
      if (!grouped[site.location]) {
        grouped[site.location] = {
          location: site.location,
          sites: 0,
          habitats: new Set(),
          speciesZones: new Set(),
        };
      }

      grouped[site.location].sites += 1;

      if (site.habitat_type) {
        grouped[site.location].habitats.add(
          site.habitat_type
        );
      }

      if (site.site_name) {
        grouped[site.location].speciesZones.add(
          site.site_name
        );
      }
    });

    return Object.values(grouped).map(
      (item) => ({
        ...item,
        habitats: Array.from(item.habitats),
        speciesZones: Array.from(
          item.speciesZones
        ),
      })
    );
  }, [sites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">

          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-600 font-medium">
            Loading Forest Intelligence...
          </p>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-lg w-full text-center">

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
            onClick={loadForestDashboard}
            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
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

        {/* HEADER */}

        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 md:p-8 shadow-xl">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-200">

                <span className="w-2 h-2 rounded-full bg-emerald-400" />

                Milestone 4 • Forest Department

              </div>

              <h1 className="text-3xl md:text-4xl font-bold mt-4">
                Forest Department Dashboard
              </h1>

              <p className="text-slate-300 mt-2 max-w-3xl">
                Monitor protected areas, wildlife
                monitoring sites and population
                trends across the forest network.
              </p>

            </div>

            <button
              onClick={loadForestDashboard}
              className="bg-white text-emerald-800 px-5 py-3 rounded-xl font-semibold hover:bg-emerald-50"
            >
              ↻ Refresh
            </button>

          </div>

        </div>


        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <StatCard
            title="Monitoring Sites"
            value={statistics.totalSites}
            icon="📍"
          />

          <StatCard
            title="Protected Areas"
            value={statistics.protectedAreas}
            icon="🌳"
          />

          <StatCard
            title="Habitat Types"
            value={statistics.habitatTypes}
            icon="🌿"
          />

          <StatCard
            title="Monitoring Records"
            value={statistics.totalRecords}
            icon="📊"
          />

        </div>


        {/* POPULATION STATUS */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Wildlife Population Status
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Current population intelligence
              </p>

            </div>

            {population?.trend && (
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                  population.trend === "Increasing"
                    ? "bg-emerald-100 text-emerald-700"
                    : population.trend === "Decreasing"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {population.trend}
              </span>
            )}

          </div>


          {population ? (

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

              <MetricBox
                title="Previous Population"
                value={population.previous_population}
              />

              <MetricBox
                title="Current Population"
                value={population.current_population}
              />

              <MetricBox
                title="Growth Rate"
                value={`${population.growth_rate}%`}
              />

            </div>

          ) : (

            <EmptyState message="No population data available." />

          )}

        </section>


        {/* PROTECTED AREA MONITORING */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              Protected Area Monitoring
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Monitoring locations registered in the system
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {locationSummary.map(
              (area, index) => (

                <ProtectedAreaCard
                  key={`${area.location}-${index}`}
                  area={area}
                />

              )
            )}

          </div>

        </section>


        {/* MONITORING SITE TABLE */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              Monitoring Sites
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Active monitoring locations and habitat information
            </p>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>

                <tr className="border-b border-slate-200">

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Site
                  </th>

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Protected Area
                  </th>

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Habitat
                  </th>

                  <th className="p-3 text-left text-xs uppercase text-slate-500">
                    Site ID
                  </th>

                </tr>

              </thead>


              <tbody>

                {sites.map(
                  (site, index) => (

                    <tr
                      key={`${site.id}-${index}`}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >

                      <td className="p-3">

                        <div className="font-semibold text-slate-900">
                          {site.site_name}
                        </div>

                      </td>

                      <td className="p-3 text-slate-700">
                        {site.location}
                      </td>

                      <td className="p-3">

                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
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


        {/* WILDLIFE MOVEMENT */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <SectionHeader
            title="Wildlife Movement Analysis"
            subtitle="Movement intelligence requires historical location or movement-event data."
          />

          <EmptyState
            message="No movement-history API data is currently available."
          />

        </section>


        {/* PATROL PLANNING */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <SectionHeader
            title="Patrol Planning"
            subtitle="Patrol routes and schedules can be connected when patrol data is available."
          />

          <EmptyState
            message="No patrol planning data is currently available."
          />

        </section>


        {/* INCIDENT REPORTS */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <SectionHeader
            title="Incident Reports"
            subtitle="Forest incidents and threat events"
          />

          <EmptyState
            message="No incident-report API data is currently available."
          />

        </section>


        {/* REPORT */}

        <section className="rounded-3xl bg-emerald-950 text-white p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <h2 className="text-2xl font-bold">
                Population Intelligence Report
              </h2>

              <p className="text-emerald-200 mt-2">
                Generate or download the latest population report
                from the backend report service.
              </p>

            </div>

            <a
              href="http://127.0.0.1:8000/population/report"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50"
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
            {value}
          </p>

        </div>

        <span className="text-3xl">
          {icon}
        </span>

      </div>

    </div>
  );
}


function MetricBox({
  title,
  value,
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5">

      <p className="text-xs uppercase text-slate-500 font-semibold">
        {title}
      </p>

      <p className="text-2xl font-bold text-slate-900 mt-2">
        {value ?? "—"}
      </p>

    </div>
  );
}


function ProtectedAreaCard({
  area,
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition">

      <div className="flex items-start justify-between gap-3">

        <div>

          <h3 className="font-bold text-slate-900">
            {area.location}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {area.sites} monitoring records
          </p>

        </div>

        <span className="text-2xl">
          🌲
        </span>

      </div>


      <div className="mt-4">

        <p className="text-xs uppercase text-slate-500 font-semibold">
          Habitat Types
        </p>

        <div className="flex flex-wrap gap-2 mt-2">

          {area.habitats.map(
            (habitat, index) => (

              <span
                key={index}
                className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold"
              >
                {habitat}
              </span>

            )
          )}

        </div>

      </div>


      <div className="mt-4">

        <p className="text-xs uppercase text-slate-500 font-semibold">
          Monitoring Zones
        </p>

        <p className="text-sm text-slate-700 mt-1">
          {area.speciesZones.join(", ")}
        </p>

      </div>

    </div>
  );
}


function SectionHeader({
  title,
  subtitle,
}) {
  return (
    <div className="mb-4">

      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        {subtitle}
      </p>

    </div>
  );
}


function EmptyState({
  message,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-8 text-center">

      <div className="text-3xl">
        📋
      </div>

      <p className="text-sm text-slate-500 mt-2">
        {message}
      </p>

    </div>
  );
}