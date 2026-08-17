import { useEffect, useState } from "react";
import axios from "axios";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const scoreWidth = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const getDegradationTone = (score) => {
    const value = Number(score) || 0;
    if (value >= 75) return { label: "Severe Degradation", badge: "bg-red-50 text-red-700 border-red-200", bar: "bg-red-500", dot: "bg-red-500" };
    if (value >= 40) return { label: "Potential Degradation", badge: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500", dot: "bg-amber-500" };
    return { label: "Stable", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", dot: "bg-emerald-500" };
};

const getScoreTone = (score) => {
    const value = Number(score) || 0;
    if (value >= 75) return "text-emerald-600";
    if (value >= 50) return "text-amber-600";
    return "text-red-600";
};

function HabitatDashboard() {

    const [classification, setClassification] = useState([]);
    const [degradation, setDegradation] = useState([]);
    const [vegetation, setVegetation] = useState([]);
    const [environment, setEnvironment] = useState([]);
    const [suitability, setSuitability] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadHabitatData = async () => {

            try {

                setLoading(true);
                setError("");

                const token =
                    localStorage.getItem("token");

                const config = {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                };

                const [
                    classificationRes,
                    degradationRes,
                    vegetationRes,
                    environmentRes,
                    suitabilityRes
                ] = await Promise.all([

                    axios.get(
                        "http://127.0.0.1:8000/habitat/classification",
                        config
                    ),

                    axios.get(
                        "http://127.0.0.1:8000/habitat/degradation",
                        config
                    ),

                    axios.get(
                        "http://127.0.0.1:8000/habitat/vegetation",
                        config
                    ),

                    axios.get(
                        "http://127.0.0.1:8000/habitat/environmental-conditions",
                        config
                    ),

                    axios.get(
                        "http://127.0.0.1:8000/habitat/suitability",
                        config
                    )

                ]);

                setClassification(
                    classificationRes.data.habitats || []
                );

                setDegradation(
                    degradationRes.data.habitat_degradation || []
                );

                setVegetation(
                    vegetationRes.data.vegetation_analysis || []
                );

                setEnvironment(
                    environmentRes.data.environmental_conditions || []
                );

                setSuitability(
                    suitabilityRes.data.habitat_suitability || []
                );

            } catch (err) {

                console.error(
                    "Habitat Dashboard Error:",
                    err
                );

                setError(
                    "Unable to load habitat intelligence data."
                );

            } finally {

                setLoading(false);

            }

        };

        loadHabitatData();

    }, []);

    if (loading) {

        return (
            <div className="p-6">
                Loading Habitat Intelligence...
            </div>
        );

    }

    if (error) {

        return (
            <div className="p-6 text-red-600">
                {error}
            </div>
        );

    }
    const habitatMapData = [
    {
        habitat: "Dense Forest",
        type: "Forest",
        latitude: 14.4426,
        longitude: 79.9865,
        species: 6,
        population: 42
    },
    {
        habitat: "Grassland",
        type: "Grassland",
        latitude: 15.8281,
        longitude: 78.0373,
        species: 4,
        population: 27
    },
    {
        habitat: "Wetland",
        type: "Wetland",
        latitude: 16.3067,
        longitude: 80.4365,
        species: 5,
        population: 31
    }
    ];
    
    const totalPopulation = classification.reduce((sum, item) => sum + (Number(item.population) || 0), 0);
    const totalSpecies = classification.reduce((sum, item) => sum + (Number(item.species_count) || 0), 0);
    const severeCount = degradation.filter(item => Number(item.degradation_score) >= 75).length;
    const stableCount = degradation.filter(item => Number(item.degradation_score) < 40).length;

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <header className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-7 text-white shadow-xl sm:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Habitat Intelligence Engine
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Habitat Intelligence</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                Monitor habitat classification, degradation, vegetation, environmental conditions and suitability across monitored areas.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wider text-slate-400">Monitoring status</p>
                            <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                Data synchronized
                            </p>
                        </div>
                    </div>
                </header>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Monitored Habitats</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{classification.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Population</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{totalPopulation}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Species Recorded</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{totalSpecies}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stable Habitats</p>
                        <p className="mt-2 text-3xl font-bold text-emerald-600">{stableCount}</p>
                        {severeCount > 0 && <p className="mt-1 text-xs text-red-600">{severeCount} require attention</p>}
                    </div>
                </div>

                {/* Classification */}
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Habitat intelligence</p>
                            <h2 className="mt-1 text-xl font-bold text-slate-900">Habitat Classification</h2>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Live database data</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {classification.map((item, index) => (
                            <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{item.location}</h3>
                                        <p className="mt-1 text-sm text-slate-500">{item.habitat_type}</p>
                                    </div>
                                    <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>
                                </div>
                                <div className="mt-5 grid grid-cols-3 gap-2">
                                    <div className="rounded-xl bg-white p-3 text-center"><p className="text-[11px] text-slate-500">Observations</p><p className="mt-1 font-bold text-slate-900">{item.observation_count}</p></div>
                                    <div className="rounded-xl bg-white p-3 text-center"><p className="text-[11px] text-slate-500">Species</p><p className="mt-1 font-bold text-slate-900">{item.species_count}</p></div>
                                    <div className="rounded-xl bg-white p-3 text-center"><p className="text-[11px] text-slate-500">Population</p><p className="mt-1 font-bold text-slate-900">{item.population}</p></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Map */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Geospatial monitoring</p>
                            <h2 className="mt-1 text-xl font-bold text-slate-900">Habitat Distribution</h2>
                            <p className="mt-1 text-sm text-slate-500">Geographic distribution of monitored habitats.</p>
                        </div>
                        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-block">OpenStreetMap</span>
                    </div>
                    <div className="h-[430px] overflow-hidden border-t border-slate-200">
                        <MapContainer center={[15.5, 79.5]} zoom={6} style={{ height: "100%", width: "100%" }}>
                            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {habitatMapData.map((item, index) => (
                                <CircleMarker key={index} center={[item.latitude, item.longitude]} radius={10} pathOptions={{ fillOpacity: 0.85 }}>
                                    <Popup>
                                        <div className="min-w-[170px] space-y-1">
                                            <h3 className="font-bold">{item.habitat}</h3>
                                            <p>Type: {item.type}</p><p>Species: {item.species}</p><p>Population: {item.population}</p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                </section>

                {/* Degradation */}
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Risk monitoring</p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">Habitat Degradation</h2>
                        <p className="mt-1 text-sm text-slate-500">Higher degradation scores indicate greater ecological pressure.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {degradation.map((item, index) => {
                            const tone = getDegradationTone(item.degradation_score);
                            return (
                                <div key={index} className="rounded-2xl border border-slate-200 p-5 transition hover:shadow-md">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0"><h3 className="truncate font-bold text-slate-900">{item.habitat}</h3><p className="mt-1 text-xs text-slate-500">Ecological pressure assessment</p></div>
                                        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${tone.badge}`}>{tone.label}</span>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between text-sm"><span className="font-medium text-slate-600">Degradation score</span><span className="text-lg font-bold text-slate-900">{item.degradation_score}</span></div>
                                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${scoreWidth(item.degradation_score)}%` }} /></div>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Species change</p><p className={`mt-1 font-bold ${Number(item.species_change) < 0 ? "text-red-600" : "text-slate-900"}`}>{item.species_change}%</p></div>
                                        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Population change</p><p className={`mt-1 font-bold ${Number(item.population_change) < 0 ? "text-red-600" : "text-slate-900"}`}>{item.population_change}%</p></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Vegetation + Environment */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Vegetation</p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">Vegetation Analysis</h2>
                        <div className="mt-5 space-y-3">
                            {vegetation.map((item, index) => (
                                <div key={index} className="rounded-2xl border border-slate-200 p-4">
                                    <div className="flex items-center justify-between gap-4"><div><h3 className="font-semibold text-slate-900">{item.habitat}</h3><p className="text-xs text-slate-500">{item.vegetation_condition}</p></div><span className={`text-2xl font-bold ${getScoreTone(item.vegetation_score)}`}>{item.vegetation_score}</span></div>
                                    <div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${scoreWidth(item.vegetation_score)}%` }} /></div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Environment</p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">Environmental Conditions</h2>
                        <div className="mt-5 space-y-3">
                            {environment.map((item, index) => (
                                <div key={index} className="rounded-2xl border border-slate-200 p-4">
                                    <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">{item.habitat}</h3><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-900">{item.condition_score}</span></div>
                                    <p className="mt-2 text-sm font-medium text-slate-600">{item.environmental_condition}</p>
                                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">Species</p><p className="mt-1 font-bold">{item.species_count}</p></div><div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">Population</p><p className="mt-1 font-bold">{item.population}</p></div><div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">Monitoring</p><p className="mt-1 font-bold">{item.monitoring_score}</p></div></div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Suitability */}
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Prediction</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">Habitat Suitability Prediction</h2>
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {suitability.map((item, index) => (
                            <div key={index} className="rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-slate-900">{item.habitat}</h3><p className="mt-1 text-sm text-slate-500">{item.suitability}</p></div><span className={`text-2xl font-bold ${getScoreTone(item.suitability_score)}`}>{item.suitability_score}</span></div>
                                <div className="mt-4 h-2.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${scoreWidth(item.suitability_score)}%` }} /></div>
                                <p className="mt-4 text-sm leading-6 text-slate-600">{item.recommendation}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}


export default HabitatDashboard;