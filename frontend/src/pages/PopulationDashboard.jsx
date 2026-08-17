import { useEffect, useState } from "react";
import api from "../api";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    XAxis,
    Line,
    YAxis,
    CartesianGrid,
    Legend
} from "recharts";

function PopulationDashboard() {
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [lastUpdated, setLastUpdated] = useState("");
    const [speciesDistribution, setSpeciesDistribution] = useState([]);
    const [error, setError] = useState("");

    const COLORS = [
        "#16A34A",
        "#2563EB",
        "#F59E0B",
        "#DC2626",
        "#7C3AED",
        "#0891B2",
        "#EA580C"
    ];

    const loadDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await api.get("/dashboard/metrics");

            setMetrics(res.data);
            setSpeciesDistribution(
                res.data.species_distribution || []
            );
            setLastUpdated(new Date().toLocaleString());
        } catch (err) {
            console.error("Dashboard metrics error:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please login again.");
            } else {
                setError("Unable to load population dashboard data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            const res = await api.get("/dashboard/history");
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Population history error:", err);
        }
    };

    const loadAlerts = async (currentMetrics) => {
        if (!currentMetrics?.population_metrics) return;

        try {
            const res = await api.post(
                "/alerts/generate",
                currentMetrics.population_metrics
            );

            setAlerts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Alerts error:", err);
            setAlerts([]);
        }
    };

    useEffect(() => {
        loadDashboard();
        loadHistory();

        const interval = setInterval(() => {
            loadDashboard();
            loadHistory();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (metrics) {
            loadAlerts(metrics);
        }
    }, [metrics]);

    const generateReport = async () => {
        if (!metrics?.population_metrics) return;

        try {
            const reportData = {
                population_size:
                    metrics.population_metrics.population_size,
                density:
                    metrics.population_metrics.density,
                growth_rate:
                    metrics.population_metrics.growth_rate,
                trend:
                    metrics.population_metrics.trend,
                migration_status:
                    metrics.population_metrics.migration_status,
                dominant_species:
                    metrics.population_metrics.dominant_species,
                species_richness:
                    metrics.population_metrics.species_richness
            };

            await api.post("/report/generate", reportData);

            const response = await api.get("/report/download", {
                responseType: "blob"
            });

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                "population_report.pdf"
            );

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Report generation error:", err);
        }
    };

    if (loading && !metrics) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl animate-pulse space-y-6">
                    <div className="h-10 w-72 rounded-lg bg-slate-200" />
                    <div className="h-32 rounded-2xl bg-white shadow-sm" />
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-32 rounded-2xl bg-white shadow-sm"
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div className="h-96 rounded-2xl bg-white shadow-sm" />
                        <div className="h-96 rounded-2xl bg-white shadow-sm" />
                    </div>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Population data unavailable
                    </h2>
                    <p className="mt-2 text-slate-500">
                        {error || "No dashboard data was returned by the server."}
                    </p>
                    <button
                        onClick={loadDashboard}
                        className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const populationMetrics = metrics.population_metrics || {};

    const populationSize = populationMetrics.population_size ?? 0;
    const density = populationMetrics.density ?? 0;
    const growthRate = populationMetrics.growth_rate ?? 0;
    const trend = populationMetrics.trend || "Unknown";
    const migrationStatus =
        populationMetrics.migration_status || "Unknown";
    const migrationPattern =
        populationMetrics.migration_pattern || "Not available";
    const speciesRichness =
        populationMetrics.species_richness ?? 0;
    const dominantSpecies =
        populationMetrics.dominant_species || "Unknown";

    const totalSpeciesPopulation = speciesDistribution.reduce(
        (sum, item) => sum + Number(item.population || 0),
        0
    );

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 p-6 text-white shadow-lg">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-emerald-200">
                                <span className="text-xl">🌿</span>
                                <span className="text-sm font-semibold uppercase tracking-wider">
                                    Wildlife Intelligence
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold sm:text-4xl">
                                Population Dashboard
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm text-emerald-100 sm:text-base">
                                Monitor population size, species distribution,
                                growth patterns and conservation signals.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={loadDashboard}
                                className="rounded-lg bg-white px-4 py-2.5 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
                            >
                                ↻ Refresh
                            </button>

                            <button
                                onClick={generateReport}
                                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                            >
                                ↓ Download Report
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-white/15 pt-4 text-xs text-emerald-100">
                        Last updated: {lastUpdated || "Just now"}
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {error}
                    </div>
                )}

                {/* Summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                                Wildlife Summary
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                Ecosystem population overview
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Current population intelligence generated from
                                the monitoring observations.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-emerald-50 px-5 py-4">
                                <p className="text-xs font-medium text-emerald-700">
                                    Total Population
                                </p>
                                <p className="mt-1 text-2xl font-bold text-emerald-900">
                                    {populationSize}
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 px-5 py-4">
                                <p className="text-xs font-medium text-blue-700">
                                    Species
                                </p>
                                <p className="mt-1 text-2xl font-bold text-blue-900">
                                    {speciesRichness}
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 px-5 py-4 col-span-2 sm:col-span-1">
                                <p className="text-xs font-medium text-amber-700">
                                    Trend
                                </p>
                                <p className="mt-1 text-lg font-bold text-amber-900">
                                    {trend}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: "Population Size",
                            value: populationSize,
                            icon: "🐾",
                            bg: "bg-emerald-50",
                            text: "text-emerald-700"
                        },
                        {
                            label: "Population Density",
                            value: `${density} / km²`,
                            icon: "📍",
                            bg: "bg-blue-50",
                            text: "text-blue-700"
                        },
                        {
                            label: "Growth Rate",
                            value: `${growthRate}%`,
                            icon: "📈",
                            bg: "bg-amber-50",
                            text: "text-amber-700"
                        },
                        {
                            label: "Species Richness",
                            value: speciesRichness,
                            icon: "🦋",
                            bg: "bg-violet-50",
                            text: "text-violet-700"
                        }
                    ].map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {card.label}
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {card.value}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg} text-xl`}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Secondary metrics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Dominant Species
                        </p>
                        <p className="mt-2 text-xl font-bold text-slate-900">
                            {dominantSpecies}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Migration Status
                        </p>
                        <p className="mt-2 text-xl font-bold text-slate-900">
                            {migrationStatus}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Migration Pattern
                        </p>
                        <p className="mt-2 truncate text-xl font-bold text-slate-900">
                            {migrationPattern}
                        </p>
                    </div>
                </div>

                {/* Species Distribution */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Species Distribution
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Population detected by species
                                </p>
                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {speciesDistribution.length} species
                            </span>
                        </div>

                        {speciesDistribution.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">
                                                Species
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold">
                                                Population
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold">
                                                Share
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {speciesDistribution.map((item, index) => {
                                            const population = Number(
                                                item.population || 0
                                            );

                                            const share =
                                                totalSpeciesPopulation > 0
                                                    ? (
                                                          (population /
                                                              totalSpeciesPopulation) *
                                                          100
                                                      ).toFixed(1)
                                                    : "0.0";

                                            return (
                                                <tr
                                                    key={`${item.species}-${index}`}
                                                    className="border-t border-slate-100"
                                                >
                                                    <td className="px-4 py-3 font-medium text-slate-800">
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className="h-2.5 w-2.5 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        COLORS[
                                                                            index %
                                                                                COLORS.length
                                                                        ]
                                                                }}
                                                            />
                                                            {item.species}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                        {population}
                                                    </td>

                                                    <td className="px-4 py-3 text-right text-sm text-slate-500">
                                                        {share}%
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex h-72 items-center justify-center text-slate-400">
                                No species distribution data available.
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900">
                            Species Composition
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Relative contribution of each species
                        </p>

                        <div className="h-[360px]">
                            {speciesDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={speciesDistribution}
                                            dataKey="population"
                                            nameKey="species"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={75}
                                            outerRadius={125}
                                            paddingAngle={3}
                                            label
                                        >
                                            {speciesDistribution.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-400">
                                    No chart data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bar chart */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                        Population by Species
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Comparison of detected animal populations
                    </p>

                    <div className="mt-5 h-[360px]">
                        {speciesDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={speciesDistribution}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 55
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="species"
                                        angle={-25}
                                        textAnchor="end"
                                        interval={0}
                                        height={70}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                        dataKey="population"
                                        fill="#16A34A"
                                        radius={[6, 6, 0, 0]}
                                        name="Population"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                No population data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Growth trend */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Population Growth Trend
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Historical population observations
                            </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Current: {populationSize}
                        </span>
                    </div>

                    <div className="mt-5 h-[360px]">
                        {history.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={history}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 10
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="population"
                                        stroke="#16A34A"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                            fill: "#16A34A"
                                        }}
                                        activeDot={{ r: 6 }}
                                        name="Population"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                No population history available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            AI Conservation Alerts
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Automated conservation signals based on current
                            population intelligence.
                        </p>
                    </div>

                    {alerts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {alerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-amber-200 bg-amber-50 p-5"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                            ⚠️
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-amber-900">
                                                {alert.type}
                                            </h3>

                                            <p className="mt-1 text-sm leading-6 text-amber-800">
                                                {alert.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-800">
                            ✓ No active conservation alerts were returned.
                        </div>
                    )}
                </div>

                {/* Footer action */}
                <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
                    <div>
                        <p className="font-semibold text-slate-900">
                            Population Intelligence Report
                        </p>
                        <p className="text-sm text-slate-500">
                            Export the current population metrics as a PDF.
                        </p>
                    </div>

                    <button
                        onClick={generateReport}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Download PDF Report
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PopulationDashboard;
