import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function ConservationDashboard() {
    const [priorities, setPriorities] = useState([]);
    const [restoration, setRestoration] = useState([]);
    const [protection, setProtection] = useState([]);
    const [monitoring, setMonitoring] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadConservationData = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Your session has expired. Please log in again.");
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const [
                    priorityRes,
                    restorationRes,
                    protectionRes,
                    monitoringRes,
                    resourceRes,
                ] = await Promise.all([
                    axios.get("http://127.0.0.1:8000/conservation/priorities", config),
                    axios.get("http://127.0.0.1:8000/conservation/habitat-restoration", config),
                    axios.get("http://127.0.0.1:8000/conservation/wildlife-protection", config),
                    axios.get("http://127.0.0.1:8000/conservation/monitoring-optimization", config),
                    axios.get("http://127.0.0.1:8000/conservation/resource-allocation", config),
                ]);

                setPriorities(priorityRes.data.conservation_priorities || []);
                setRestoration(restorationRes.data.habitat_restoration || []);
                setProtection(protectionRes.data.wildlife_protection || []);
                setMonitoring(monitoringRes.data.monitoring_optimization || []);
                setResources(resourceRes.data.resource_allocation || []);
            } catch (err) {
                console.error("Conservation Dashboard Error:", err);
                setError(
                    err.response?.status === 401
                        ? "Your session has expired. Please log in again."
                        : "Unable to load conservation intelligence."
                );
            } finally {
                setLoading(false);
            }
        };

        loadConservationData();
    }, []);

    const summary = useMemo(
        () => ({
            priorities: priorities.length,
            restoration: restoration.length,
            monitoring: monitoring.length,
            resources: resources.length,
        }),
        [priorities, restoration, monitoring, resources]
    );

    const score = (value) => {
        const n = Number(value);
        return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
    };

    const badge = (value) => {
        const v = String(value || "").toLowerCase();
        if (v === "critical" || v === "intensive" || v === "very high")
            return "bg-red-50 text-red-700 border-red-100";
        if (v === "high") return "bg-orange-50 text-orange-700 border-orange-100";
        if (v === "moderate" || v === "regular")
            return "bg-amber-50 text-amber-700 border-amber-100";
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
    };

    const Empty = ({ text }) => (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            {text}
        </div>
    );

    if (loading)
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl animate-pulse space-y-5">
                    <div className="h-44 rounded-3xl bg-slate-200" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((x) => (
                            <div key={x} className="h-28 rounded-2xl bg-white" />
                        ))}
                    </div>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
                    <div className="mb-3 text-2xl font-bold text-red-600">!</div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Conservation intelligence unavailable
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">{error}</p>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">

                {/* HEADER */}
                <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-7 text-white shadow-lg sm:p-9">
                    <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/5" />
                    <div className="absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-teal-300/10" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-wider">
                                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                CONSERVATION INTELLIGENCE
                            </span>

                            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                                Conservation Recommendation Engine
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80 sm:text-base">
                                Data-driven conservation priorities, habitat restoration,
                                wildlife protection, monitoring optimization and resource allocation.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                            <p className="text-xs uppercase tracking-wider text-emerald-100/70">
                                Active modules
                            </p>
                            <p className="mt-1 text-3xl font-bold">05</p>
                            <p className="text-xs text-emerald-100/70">
                                intelligence areas
                            </p>
                        </div>
                    </div>
                </header>

                {/* SUMMARY */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ["Species Priorities", summary.priorities, "Species assessed", "SP"],
                        ["Restoration Areas", summary.restoration, "Habitats assessed", "HR"],
                        ["Monitoring Sites", summary.monitoring, "Sites optimized", "MO"],
                        ["Resource Areas", summary.resources, "Allocation recommendations", "RA"],
                    ].map(([title, value, subtitle, icon]) => (
                        <div
                            key={title}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{title}</p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700">
                                    {icon}
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
                        </div>
                    ))}
                </section>

                <Section title="Conservation Priorities" subtitle="Species requiring conservation attention." count={priorities.length} tag="01 / PRIORITY ANALYSIS">
                    {priorities.length === 0 ? <Empty text="No conservation priorities are available." /> : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {priorities.map((item, i) => (
                                <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Species assessment</p>
                                            <h3 className="mt-1 text-xl font-bold text-slate-900">{item.species || "Unknown species"}</h3>
                                            <p className="mt-1 text-sm text-slate-500">Population: <b className="text-slate-700">{item.population ?? "—"}</b></p>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${badge(item.priority)}`}>
                                            {item.priority || "Unknown"}
                                        </span>
                                    </div>

                                    <Progress label="Priority Score" value={item.priority_score} />

                                    <div className="mt-5 grid grid-cols-3 gap-2">
                                        {[
                                            ["Population Risk", item.population_risk],
                                            ["Observation Risk", item.observation_risk],
                                            ["Distribution Risk", item.distribution_risk],
                                        ].map(([label, value]) => (
                                            <Mini key={label} label={label} value={value} />
                                        ))}
                                    </div>

                                    <Recommendation text={item.recommendation} />
                                </article>
                            ))}
                        </div>
                    )}
                </Section>

                <Section title="Habitat Restoration" subtitle="Recommended restoration actions for monitored habitats." count={restoration.length} tag="02 / HABITAT">
                    {restoration.length === 0 ? <Empty text="No habitat restoration recommendations are available." /> : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {restoration.map((item, i) => (
                                <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Habitat</p>
                                            <h3 className="mt-1 font-bold text-slate-900">{item.habitat || "Unknown habitat"}</h3>
                                        </div>
                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge(item.priority)}`}>
                                            {item.priority || "Unknown"}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <Mini label="Habitat Health" value={item.habitat_health_score} large />
                                        <Mini label="Restoration" value={item.restoration_score} large />
                                    </div>

                                    <List title="Recommended actions" items={item.suggestions} />
                                </article>
                            ))}
                        </div>
                    )}
                </Section>

                <Section title="Wildlife Protection Strategies" subtitle="Species-specific protection recommendations." count={protection.length} tag="03 / PROTECTION">
                    {protection.length === 0 ? <Empty text="No wildlife protection recommendations are available." /> : (
                        <div className="space-y-4">
                            {protection.map((item, i) => (
                                <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Species protection</p>
                                            <h3 className="mt-1 text-lg font-bold text-slate-900">{item.species || "Unknown species"}</h3>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Population: <b>{item.population ?? "—"}</b> &nbsp;•&nbsp; Locations: <b>{item.locations ?? "—"}</b>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-[11px] text-slate-400">Protection score</p>
                                                <p className="text-2xl font-bold text-slate-900">{item.protection_score ?? "—"}</p>
                                            </div>
                                            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${badge(item.protection_level)}`}>
                                                {item.protection_level || "Unknown"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                        <div className="rounded-xl bg-slate-50 p-4">
                                            <List title="Protection strategies" items={item.strategies} />
                                        </div>
                                        <Recommendation text={item.recommendation} blue />
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </Section>

                <Section title="Monitoring Optimization" subtitle="Recommended monitoring intensity, frequency and methods." count={monitoring.length} tag="04 / MONITORING">
                    {monitoring.length === 0 ? <Empty text="No monitoring optimization recommendations are available." /> : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {monitoring.map((item, i) => (
                                <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">Monitoring site</p>
                                            <h3 className="mt-1 font-bold text-slate-900">{item.location || "Unknown location"}</h3>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge(item.monitoring_level)}`}>
                                            {item.monitoring_level || "Unknown"}
                                        </span>
                                    </div>

                                    <Progress label="Monitoring Score" value={item.monitoring_score} violet />

                                    <div className="mt-5 grid grid-cols-3 gap-2">
                                        <Mini label="Frequency" value={item.recommended_frequency} />
                                        <Mini label="Species" value={item.species_count} />
                                        <Mini label="Population" value={item.population} />
                                    </div>

                                    <List title="Recommended methods" items={item.recommended_methods} />
                                </article>
                            ))}
                        </div>
                    )}
                </Section>

                <Section title="Resource Allocation" subtitle="Recommended allocation of conservation resources." count={resources.length} tag="05 / RESOURCES">
                    {resources.length === 0 ? <Empty text="No resource allocation recommendations are available." /> : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {resources.map((item, i) => (
                                <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Resource planning</p>
                                            <h3 className="mt-1 text-lg font-bold text-slate-900">{item.location || "Unknown location"}</h3>
                                            <p className="mt-1 text-sm text-slate-500">Recommended resource priority</p>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${badge(item.allocation_level)}`}>
                                            {item.allocation_level || "Unknown"}
                                        </span>
                                    </div>

                                    <Progress label="Allocation Priority" value={item.allocation_percentage} amber suffix="%" />

                                    <div className="mt-5 grid grid-cols-3 gap-2">
                                        <Mini label="Population" value={item.population} />
                                        <Mini label="Species" value={item.species_count} />
                                        <Mini label="Observations" value={item.observations} />
                                    </div>

                                    <List title="Recommended resources" items={item.recommended_resources} />
                                    <Recommendation text={item.recommendation} amber />
                                </article>
                            ))}
                        </div>
                    )}
                </Section>

                <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
                    Conservation Intelligence • Recommendations generated from current monitoring data
                </footer>
            </main>
        </div>
    );
}

function Section({ title, subtitle, count, tag, children }) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-600">{tag}</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>
                <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                    {count} {count === 1 ? "item" : "items"}
                </span>
            </div>
            {children}
        </section>
    );
}

function Progress({ label, value, violet = false, amber = false, suffix = "" }) {
    const n = Number(value);
    const width = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
    const color = violet
        ? "bg-gradient-to-r from-violet-500 to-indigo-500"
        : amber
        ? "bg-gradient-to-r from-amber-400 to-orange-500"
        : "bg-gradient-to-r from-emerald-500 to-teal-500";

    return (
        <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="font-bold text-slate-900">{value ?? "—"}{value != null ? suffix : ""}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
            </div>
        </div>
    );
}

function Mini({ label, value, large = false }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] leading-4 text-slate-400">{label}</p>
            <p className={`${large ? "text-xl" : "text-sm"} mt-1 font-bold text-slate-800`}>
                {value ?? "—"}
            </p>
        </div>
    );
}

function List({ title, items = [] }) {
    return (
        <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
            {items?.length ? (
                <ul className="mt-3 space-y-2">
                    {items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-5 text-slate-600">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 text-sm text-slate-400">No recommendations available.</p>
            )}
        </div>
    );
}

function Recommendation({ text, blue = false, amber = false }) {
    const style = blue
        ? "border-blue-100 bg-blue-50/70 text-blue-950"
        : amber
        ? "border-amber-100 bg-amber-50/70 text-amber-950"
        : "border-emerald-100 bg-emerald-50/70 text-emerald-950";

    const label = blue ? "Recommendation" : amber ? "Recommendation" : "Recommended action";

    return (
        <div className={`mt-5 rounded-xl border p-4 ${style}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</p>
            <p className="mt-1.5 text-sm leading-5">{text || "No recommendation available."}</p>
        </div>
    );
}

export default ConservationDashboard;