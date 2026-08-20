import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Filter, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function GISMap() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        species: 'All',
        habitat: 'All',
        threatLevel: 'All',
    });

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/gis/map-data');
            setData(res.data);
        } catch (err) {
            console.error('Failed to load GIS map data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!data || !mapContainerRef.current) return;

        try {
            // Clean up previous map instance if exists
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
                mapContainerRef.current._leaflet_id = null;
            }

            // Initialize Leaflet map
            const map = L.map(mapContainerRef.current).setView(data.center || [-2.333, 34.833], 8);
            mapInstanceRef.current = map;

            // OpenStreetMap Tile Layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors | Wildlife GIS Platform',
                maxZoom: 18,
            }).addTo(map);

        // Custom Circle Markers helper
        const addMarker = (lat, lng, color, popupHtml) => {
            const circleMarker = L.circleMarker([lat, lng], {
                radius: 9,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.85
            }).addTo(map);

            circleMarker.bindPopup(popupHtml);
        };

        // Filter and plot points
        // 1. Sites
        data.sites.forEach((s) => {
            if (filters.habitat !== 'All' && s.habitat !== filters.habitat) return;
            const popup = `
                <div style="font-family: system-ui, sans-serif; padding: 4px;">
                    <div style="font-weight: bold; color: #059669; font-size: 14px;">📍 ${s.name}</div>
                    <div style="font-size: 12px; color: #475569; margin-top: 4px;"><b>Type:</b> Monitoring Site</div>
                    <div style="font-size: 12px; color: #475569;"><b>Habitat:</b> ${s.habitat}</div>
                    <div style="font-size: 12px; color: #475569;"><b>Country:</b> ${s.country}</div>
                    <div style="font-size: 12px; color: #475569;"><b>Coords:</b> ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}</div>
                </div>
            `;
            addMarker(s.lat, s.lng, s.marker_color, popup);
        });

        // 2. Observations
        data.observations.forEach((o) => {
            if (filters.species !== 'All' && o.species !== filters.species) return;
            if (filters.habitat !== 'All' && o.habitat !== filters.habitat) return;
            if (filters.threatLevel !== 'All' && o.risk_level !== filters.threatLevel) return;

            const popup = `
                <div style="font-family: system-ui, sans-serif; padding: 4px;">
                    <div style="font-weight: bold; color: #1e293b; font-size: 14px;">🐾 ${o.species}</div>
                    <div style="font-size: 12px; color: #64748b; font-style: italic;">${o.scientific_name}</div>
                    <div style="font-size: 12px; color: #475569; margin-top: 6px;"><b>Site:</b> ${o.site}</div>
                    <div style="font-size: 12px; color: #475569;"><b>Count Observed:</b> ${o.count}</div>
                    <div style="font-size: 12px; color: #475569;"><b>Confidence:</b> ${(o.confidence * 100).toFixed(0)}%</div>
                    <div style="font-size: 12px; color: ${o.marker_color}; font-weight: bold; margin-top: 4px;"><b>Status:</b> ${o.risk_level}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Observed on ${o.observation_date}</div>
                </div>
            `;
            addMarker(o.lat + 0.02, o.lng + 0.02, o.marker_color, popup);
        });

        // 3. Habitats
        data.habitats.forEach((h) => {
            if (filters.habitat !== 'All' && h.name !== filters.habitat) return;
            if (filters.threatLevel !== 'All' && h.risk_level !== filters.threatLevel) return;

            const popup = `
                <div style="font-family: system-ui, sans-serif; padding: 4px;">
                    <div style="font-weight: bold; color: #0284c7; font-size: 14px;">🌳 ${h.name}</div>
                    <div style="font-size: 12px; color: #475569; margin-top: 4px;"><b>Quality Score:</b> ${h.quality_score}/100</div>
                    <div style="font-size: 12px; color: #475569;"><b>Risk Level:</b> ${h.risk_level}</div>
                    <div style="font-size: 12px; color: #475569;"><b>Area:</b> ${h.area_km2} km²</div>
                    <div style="font-size: 12px; color: #475569;"><b>Monitored Species:</b> ${h.species_count}</div>
                </div>
            `;
            addMarker(h.lat - 0.03, h.lng - 0.03, h.marker_color, popup);
        });

        } catch (err) {
            console.error('Leaflet map initialization warning:', err);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [data, filters]);

    // Extract filter lists
    const speciesList = ['All', ...new Set(data?.observations?.map((o) => o.species) || [])];
    const habitatList = ['All', ...new Set(data?.sites?.map((s) => s.habitat) || [])];
    const threatList = ['All', 'Healthy', 'Medium Risk', 'High Risk', 'Critical'];

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-emerald-800 to-slate-900 p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-700/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                        <MapPin className="w-4 h-4" />
                        <span>GIS Spatial Analytics</span>
                    </div>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Interactive Wildlife GIS Map</h1>
                    <p className="mt-2 max-w-2xl text-emerald-100/80 text-sm">
                        Spatial visualization plotting monitoring sites, species observations, habitat health boundaries, and population hotspot clusters.
                    </p>
                </div>
            </div>

            {/* Filter Bar & Legend */}
            <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 md:grid-cols-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Species Filter</label>
                    <select
                        value={filters.species}
                        onChange={(e) => setFilters({ ...filters, species: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        {speciesList.map((sp) => (
                            <option key={sp} value={sp}>{sp}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Habitat Filter</label>
                    <select
                        value={filters.habitat}
                        onChange={(e) => setFilters({ ...filters, habitat: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        {habitatList.map((hab) => (
                            <option key={hab} value={hab}>{hab}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Threat / Risk Level</label>
                    <select
                        value={filters.threatLevel}
                        onChange={(e) => setFilters({ ...filters, threatLevel: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        {threatList.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col justify-end">
                    <button
                        onClick={() => setFilters({ species: 'All', habitat: 'All', threatLevel: 'All' })}
                        className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Map & Legend Box */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-md border border-slate-100">
                <div ref={mapContainerRef} className="h-[600px] w-full z-10"></div>

                {/* Map Legend Floating Box */}
                <div className="absolute bottom-6 right-6 z-20 rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-xl border border-slate-200 max-w-xs w-full">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Map Marker Legend</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm inline-block"></span>
                            <span className="text-slate-700 font-medium">Healthy / Low Risk</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm inline-block"></span>
                            <span className="text-slate-700 font-medium">Medium Risk</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-sm inline-block"></span>
                            <span className="text-slate-700 font-medium">High Risk</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm inline-block"></span>
                            <span className="text-slate-700 font-medium">Critical Threat</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
