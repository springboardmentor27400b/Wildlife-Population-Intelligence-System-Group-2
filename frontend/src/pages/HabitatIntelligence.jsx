import { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    Trees, ShieldAlert, CheckCircle2, AlertTriangle, Route, Activity,
    Droplets, Wind, Thermometer, Flame, RefreshCw, Search, ArrowRight, MapPin, Maximize2
} from 'lucide-react';

function HabitatMap({ habitats }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        try {
            if (mapContainerRef.current._leaflet_id) {
                mapContainerRef.current._leaflet_id = null;
            }

            const map = L.map(mapContainerRef.current, {
                center: [-2.3333, 34.8333],
                zoom: 4,
                zoomControl: true,
                attributionControl: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors | Habitat GIS',
                maxZoom: 18,
            }).addTo(map);

            markersLayerRef.current = L.featureGroup().addTo(map);
            mapInstanceRef.current = map;

            setTimeout(() => {
                map.invalidateSize();
            }, 250);
        } catch (err) {
            console.error('Error initializing Habitat Leaflet Map:', err);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current || !habitats || habitats.length === 0) return;

        const markersLayer = markersLayerRef.current;
        markersLayer.clearLayers();

        habitats.forEach((h) => {
            const lat = Number(h.latitude) || -2.3333;
            const lng = Number(h.longitude) || 34.8333;
            const risk = h.risk_level || 'Low';
            const color = risk === 'Critical' ? '#dc2626' : risk === 'High' ? '#ea580c' : risk === 'Medium' ? '#d97706' : '#059669';

            const marker = L.circleMarker([lat, lng], {
                radius: 11,
                fillColor: color,
                color: '#ffffff',
                weight: 2.5,
                opacity: 1,
                fillOpacity: 0.9,
            });

            const popupContent = `
                <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 190px;">
                    <div style="font-weight: 700; color: #0f172a; font-size: 14px;">🌳 ${h.habitat_name}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${h.region || h.location || 'Sanctuary Zone'}</div>
                    <div style="margin-top: 6px; font-size: 11px; color: #334155; line-height: 1.4;">
                        <div><b>Suitability Score:</b> ${h.quality_score || h.suitability_score}%</div>
                        <div><b>Risk Level:</b> <span style="font-weight: 700; color: ${color};">${risk}</span></div>
                        <div><b>Water Availability:</b> ${h.water_availability}%</div>
                        <div><b>Vegetation Density:</b> ${h.vegetation_density}%</div>
                        <div><b>Monitored Species:</b> ${h.species_count || 10}</div>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent);
            marker.addTo(markersLayer);
        });

        if (markersLayer.getLayers().length > 0) {
            try {
                const bounds = markersLayer.getBounds();
                if (bounds.isValid()) {
                    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
                }
            } catch (e) {
                // Ignore bounds exception
            }
        }
    }, [habitats]);

    return (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Habitat Location & GPS Telemetry</h2>
                    <p className="text-xs text-slate-500">Live georeferenced spatial boundaries and environmental risk telemetry.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live GPS Coordinates
                </span>
            </div>
            <div ref={mapContainerRef} className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-200 z-0" />
        </div>
    );
}

export default function HabitatIntelligence() {
    const [summary, setSummary] = useState(null);
    const [riskData, setRiskData] = useState([]);
    const [corridors, setCorridors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [summaryRes, riskRes, corridorsRes] = await Promise.allSettled([
                api.get('/habitat/summary'),
                api.get('/habitat/risk'),
                api.get('/habitat/corridors'),
            ]);

            if (summaryRes.status === 'fulfilled') {
                setSummary(summaryRes.value.data);
            } else {
                throw new Error(summaryRes.reason?.response?.data?.detail || 'Failed to load habitat summary.');
            }

            if (riskRes.status === 'fulfilled') {
                setRiskData(riskRes.value.data || []);
            }

            if (corridorsRes.status === 'fulfilled') {
                setCorridors(corridorsRes.value.data || []);
            }
        } catch (err) {
            console.error('Habitat fetch error:', err);
            setError(err.message || 'Error loading habitat intelligence.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const habitatsList = useMemo(() => {
        return summary?.habitats || summary?.analyses || [];
    }, [summary]);

    const filteredHabitats = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return habitatsList;
        return habitatsList.filter((h) =>
            h.habitat_name?.toLowerCase().includes(q) ||
            h.region?.toLowerCase().includes(q) ||
            h.location?.toLowerCase().includes(q) ||
            h.risk_level?.toLowerCase().includes(q)
        );
    }, [habitatsList, search]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-28 rounded-3xl bg-slate-200"></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 rounded-2xl bg-slate-200"></div>
                    ))}
                </div>
                <div className="h-96 rounded-3xl bg-slate-200"></div>
            </div>
        );
    }

    if (error && !summary) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 space-y-3">
                <div className="flex items-center gap-2 font-bold text-base">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Unable to load Habitat Intelligence</span>
                </div>
                <p className="text-xs">{error}</p>
                <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Loading</span>
                </button>
            </div>
        );
    }

    const PIE_COLORS = { 'Low': '#059669', 'Medium': '#d97706', 'High': '#ea580c', 'Critical': '#dc2626' };

    const riskDistribution = [
        { name: 'Low', value: summary?.healthy_count || habitatsList.filter((h) => h.risk_level === 'Low').length || 0 },
        { name: 'Medium', value: habitatsList.filter((h) => h.risk_level === 'Medium' || h.risk_level === 'Moderate').length || 0 },
        { name: 'High', value: summary?.at_risk_count || habitatsList.filter((h) => h.risk_level === 'High').length || 0 },
        { name: 'Critical', value: summary?.critical_count || habitatsList.filter((h) => h.risk_level === 'Critical').length || 0 }
    ].filter(item => item.value > 0);

    const avgQuality = summary?.average_quality || (habitatsList.length > 0 ? (habitatsList.reduce((acc, h) => acc + (h.quality_score || 0), 0) / habitatsList.length).toFixed(1) : 0);

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                        <Trees className="w-3.5 h-3.5" />
                        <span>Habitat Health & Suitability Engine</span>
                    </div>
                    <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">Habitat Intelligence Dashboard</h1>
                    <p className="mt-2 max-w-2xl text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
                        Continuous telemetry assessing vegetation indices, water availability, human disturbance, ecological carrying capacity, and protected migration corridors.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    <button
                        onClick={fetchData}
                        className="inline-flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 transition cursor-pointer border border-white/10 shadow-xs"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh Telemetry</span>
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500">Total Monitored Habitats</span>
                    <div className="mt-2 text-3xl font-black text-slate-900">{summary?.total_habitats || habitatsList.length}</div>
                    <span className="text-[11px] font-medium text-slate-500">Active Ecosystem Sectors</span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500">Average Quality Score</span>
                    <div className="mt-2 text-3xl font-black text-emerald-600">{avgQuality}%</div>
                    <span className="text-[11px] font-medium text-emerald-600">Suitability Index</span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500">Healthy Habitats</span>
                    <div className="mt-2 text-3xl font-black text-teal-600">{summary?.healthy_count || 0}</div>
                    <span className="text-[11px] font-medium text-teal-600">Low Risk Zones</span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500">Vulnerable / Critical</span>
                    <div className="mt-2 text-3xl font-black text-rose-600">{(summary?.at_risk_count || 0) + (summary?.critical_count || 0)}</div>
                    <span className="text-[11px] font-medium text-rose-600">Requiring Interventions</span>
                </div>
            </div>

            {/* GPS Telemetry Map */}
            <HabitatMap habitats={habitatsList} />

            {/* Visual Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Habitat Suitability & Quality Comparison */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-1">Habitat Quality & Suitability Comparison</h3>
                    <p className="text-xs text-slate-500 mb-4">Quality and environmental sustainability index across monitored regions.</p>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={habitatsList.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="habitat_name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                                />
                                <Bar dataKey="quality_score" name="Quality Score" fill="#059669" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Risk Distribution Pie Chart */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-1">Risk Category Distribution</h3>
                    <p className="text-xs text-slate-500 mb-4">Classification of habitat risk levels across protected reserves.</p>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {riskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#059669'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Suitable Migration Corridors */}
            {corridors.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Route className="w-4 h-4 text-emerald-600" />
                                <span>Protected Migration Corridors</span>
                            </h3>
                            <p className="text-xs text-slate-500">Active seasonal wildlife transit pathways between interconnected habitat zones.</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            {corridors.length} Active Corridors
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
                        {corridors.map((c) => (
                            <div key={c.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 hover:bg-slate-50 transition">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="font-bold text-slate-900 text-xs">{c.corridor_name}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        c.risk_level === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                                        c.risk_level === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {c.risk_level} Risk
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                    <span>{c.from_habitat}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{c.to_habitat}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200/70 flex justify-between items-center text-[11px] text-slate-500">
                                    <span>Target: <b>{c.species}</b></span>
                                    <span>{c.distance_km} km</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Habitat Environmental Telemetry Table */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Environmental Telemetry Table ({filteredHabitats.length})</h3>
                        <p className="text-xs text-slate-500">Comprehensive sensory metrics across vegetation, water, climate, and human pressure.</p>
                    </div>
                    <div className="relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter habitats..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-4 py-3">Habitat Sector</th>
                                <th className="px-4 py-3">Region</th>
                                <th className="px-4 py-3 text-center">Quality Score</th>
                                <th className="px-4 py-3 text-center">Water Index</th>
                                <th className="px-4 py-3 text-center">Vegetation Index</th>
                                <th className="px-4 py-3 text-center">Temperature</th>
                                <th className="px-4 py-3 text-center">Human Disturbance</th>
                                <th className="px-4 py-3 text-center">Species Count</th>
                                <th className="px-4 py-3">Risk Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredHabitats.map((h, i) => (
                                <tr key={i} className="even:bg-slate-50/40 hover:bg-slate-100/70 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-900">{h.habitat_name}</td>
                                    <td className="px-4 py-3 text-slate-600">{h.region || h.location || 'Sanctuary'}</td>
                                    <td className="px-4 py-3 text-center font-bold text-emerald-700">{h.quality_score}%</td>
                                    <td className="px-4 py-3 text-center text-slate-700">{h.water_availability}%</td>
                                    <td className="px-4 py-3 text-center text-slate-700">{h.vegetation_density}%</td>
                                    <td className="px-4 py-3 text-center text-slate-700">{h.temperature_celsius || h.temperature}°C</td>
                                    <td className="px-4 py-3 text-center text-slate-700">{h.human_disturbance}%</td>
                                    <td className="px-4 py-3 text-center font-semibold text-slate-800">{h.species_count || 10}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            h.risk_level === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                                            h.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                            h.risk_level === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {h.risk_level} Risk
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

