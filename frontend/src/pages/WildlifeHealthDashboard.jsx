import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function WildlifeHealthDashboard() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHealth = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://127.0.0.1:8000/wildlife-health/score",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setHealth(response.data);
            } catch (err) {
                console.error("Wildlife Health Error:", err);
                setError("Unable to load wildlife health data.");
            } finally {
                setLoading(false);
            }
        };

        loadHealth();
    }, []);

    const scoreCards = useMemo(() => {
        if (!health) return [];

        return [
            {
                title: "Species Diversity",
                value: Number(health.species_diversity_score || 0),
                weight: "30%",
                description: "Variety and balance of species"
            },
            {
                title: "Population Stability",
                value: Number(health.population_stability_score || 0),
                weight: "25%",
                description: "Population growth and stability"
            },
            {
                title: "Habitat Quality",
                value: Number(health.habitat_quality_score || 0),
                weight: "20%",
                description: "Condition of monitored habitats"
            },
            {
                title: "Endangered Species",
                value: Number(health.endangered_species_score || 0),
                weight: "15%",
                description: "Conservation status of species"
            },
            {
                title: "Environmental Conditions",
                value: Number(health.environmental_condition_score || 0),
                weight: "10%",
                description: "Current environmental factors"
            }
        ];
    }, [health]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "Excellent":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Healthy":
                return "bg-green-50 text-green-700 border-green-200";
            case "Moderate Concern":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "Vulnerable":
                return "bg-orange-50 text-orange-700 border-orange-200";
            case "Critical":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const getScoreColor = (value) => {
        if (value >= 75) return "bg-emerald-500";
        if (value >= 50) return "bg-amber-500";
        if (value >= 30) return "bg-orange-500";
        return "bg-red-500";
    };

    const getScoreTextColor = (value) => {
        if (value >= 75) return "text-emerald-600";
        if (value >= 50) return "text-amber-600";
        if (value >= 30) return "text-orange-600";
        return "text-red-600";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl animate-pulse space-y-6">
                    <div className="h-10 w-80 rounded-lg bg-slate-200" />
                    <div className="h-5 w-96 rounded bg-slate-200" />
                    <div className="h-48 rounded-3xl bg-white shadow-sm" />
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="h-40 rounded-2xl bg-white shadow-sm" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !health) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error || "Wildlife health data is unavailable."}
                </div>
            </div>
        );
    }

    const overall = Math.max(
        0,
        Math.min(100, Number(health.overall_ecosystem_health_score || 0))
    );

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-7">

                {/* Header */}
                <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-6 py-7 text-white shadow-xl sm:px-8">
                    <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-400/10" />
                    <div className="absolute -bottom-28 right-24 h-72 w-72 rounded-full bg-teal-300/10" />

                    <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-100">
                                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                Ecosystem Intelligence
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Wildlife Health Scoring Engine
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm text-emerald-100 sm:text-base">
                                Dynamic ecosystem health and conservation assessment
                                based on monitored wildlife indicators.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wider text-emerald-100">
                                Current Status
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                                <span className="font-semibold">
                                    {health.conservation_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Overall Health */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">

                        <div className="p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                                    🌿
                                </div>

                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                                        Overall Ecosystem Health
                                    </p>
                                    <div className="mt-1 flex items-end gap-2">
                                        <span className="text-5xl font-extrabold tracking-tight text-slate-900">
                                            {overall.toFixed(2)}
                                        </span>
                                        <span className="mb-2 text-sm text-slate-400">
                                            / 100
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">
                                        Health index
                                    </span>
                                    <span className={`text-sm font-bold ${getScoreTextColor(overall)}`}>
                                        {overall.toFixed(2)}%
                                    </span>
                                </div>

                                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${getScoreColor(overall)}`}
                                        style={{ width: `${overall}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center border-t border-slate-100 bg-slate-50 p-6 lg:border-l lg:border-t-0">
                            <div className="text-center">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Conservation Status
                                </p>

                                <div
                                    className={`mt-4 inline-flex rounded-full border px-5 py-2.5 text-sm font-bold ${getStatusStyle(
                                        health.conservation_status
                                    )}`}
                                >
                                    {health.conservation_status}
                                </div>

                                <p className="mt-3 text-xs text-slate-500">
                                    Based on weighted ecosystem indicators
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Health Components */}
                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                Assessment breakdown
                            </p>
                            <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                Health Components
                            </h2>
                        </div>

                        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 sm:block">
                            5 weighted indicators
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {scoreCards.map((card) => (
                            <div
                                key={card.title}
                                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            {card.title}
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                            {card.description}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-2xl font-extrabold ${getScoreTextColor(card.value)}`}>
                                            {card.value}
                                        </div>
                                        <div className="text-xs font-medium text-slate-400">
                                            / 100
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="mb-2 flex justify-between text-xs">
                                        <span className="font-medium text-slate-500">
                                            Contribution
                                        </span>
                                        <span className="font-bold text-slate-700">
                                            Weight {card.weight}
                                        </span>
                                    </div>

                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${getScoreColor(card.value)}`}
                                            style={{
                                                width: `${Math.max(
                                                    0,
                                                    Math.min(100, card.value)
                                                )}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Weighted Model */}
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Calculation framework
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            Weighted Scoring Model
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Each indicator contributes according to its assigned ecological weight.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <div className="hidden grid-cols-[1fr_120px_120px] bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:grid">
                            <span>Indicator</span>
                            <span>Weight</span>
                            <span className="text-right">Score</span>
                        </div>

                        {scoreCards.map((card, index) => (
                            <div
                                key={card.title}
                                className={`grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[1fr_120px_120px] sm:items-center ${
                                    index !== scoreCards.length - 1
                                        ? "border-b border-slate-100"
                                        : ""
                                }`}
                            >
                                <span className="font-medium text-slate-800">
                                    {card.title}
                                </span>

                                <span className="text-sm text-slate-500">
                                    Weight: <strong className="text-slate-700">{card.weight}</strong>
                                </span>

                                <span className={`text-lg font-bold sm:text-right ${getScoreTextColor(card.value)}`}>
                                    {card.value}
                                </span>
                            </div>
                        ))}

                        <div className="flex items-center justify-between bg-emerald-950 px-5 py-4 text-white">
                            <span className="font-bold">
                                Overall Ecosystem Health
                            </span>
                            <span className="text-xl font-extrabold">
                                {overall.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Conservation Status */}
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Classification
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            Conservation Status
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {[
                            "Excellent",
                            "Healthy",
                            "Moderate Concern",
                            "Vulnerable",
                            "Critical"
                        ].map((status) => {
                            const active =
                                status === health.conservation_status;

                            return (
                                <div
                                    key={status}
                                    className={`rounded-2xl border p-4 text-center text-sm font-semibold transition ${
                                        active
                                            ? getStatusStyle(status)
                                            : "border-slate-200 bg-slate-50 text-slate-400"
                                    }`}
                                >
                                    {status}
                                    {active && (
                                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider">
                                            Current
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <p className="pb-2 text-center text-xs text-slate-400">
                    Wildlife Population Intelligence System • Ecosystem Health Analytics
                </p>
            </div>
        </div>
    );
}

export default WildlifeHealthDashboard;