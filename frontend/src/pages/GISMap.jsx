import { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    MapPin, Filter, Layers, ShieldCheck, AlertTriangle, Eye,
    RefreshCw, Search, X, Compass, CheckCircle2, Trees, Users, Info, Maximize2
} from 'lucide-react';

export default function GISMap() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [activeLayer, setActiveLayer] = useState('all'); // all, sites, observations, habitats, hotspots
    const [baseMap, setBaseMap] = useState('osm'); // osm, light
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        species: 'All',
        habitat: 'All',
        threatLevel: 'All',
    });

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const tileLayerRef = useRef(null);
    const markersLayerRef = useRef(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/gis/map-data');
            setData(res.data);
        } catch (err) {
            console.error('Failed to load GIS map data', err);
            setError(err.response?.data?.detail || err.message || 'Unable to load spatial GIS telemetry.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // 1. Initialize Map Instance Once
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        try {
            // Delete _leaflet_id if left over
            if (mapContainerRef.current._leaflet_id) {
                mapContainerRef.current._leaflet_id = null;
            }

            const map = L.map(mapContainerRef.current, {
                center: [-2.3333, 34.8333],
                zoom: 5,
                zoomControl: true,
                attributionControl: true
            });

            const initialTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors | Wildlife GIS Platform',
                maxZoom: 18,
            }).addTo(map);

            tileLayerRef.current = initialTile;
            markersLayerRef.current = L.featureGroup().addTo(map);
            mapInstanceRef.current = map;

            // Invalidate size on initial mount and window resize
            setTimeout(() => {
                map.invalidateSize();
            }, 250);

            const handleResize = () => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                }
            };
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        } catch (err) {
            console.error('Error initializing Leaflet GIS map:', err);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // 2. Base Map Tile Switcher
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        if (tileLayerRef.current) {
            mapInstanceRef.current.removeLayer(tileLayerRef.current);
        }

        const url = baseMap === 'light'
            ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const attr = baseMap === 'light'
            ? '&copy; CARTO &copy; OpenStreetMap contributors'
            : '&copy; OpenStreetMap contributors | Wildlife Spatial Intelligence';

        tileLayerRef.current = L.tileLayer(url, { attribution: attr, maxZoom: 18 }).addTo(mapInstanceRef.current);
        if (markersLayerRef.current) {
            markersLayerRef.current.bringToFront();
        }
    }, [baseMap]);

    // 3. Filter Markers and Render onto Feature Group without Destroying Map
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current || !data) return;

        const markersLayer = markersLayerRef.current;
        markersLayer.clearLayers();

        const query = searchQuery.toLowerCase().trim();
        let plottedCount = 0;

        // Custom marker builder
        const createCircleMarker = (lat, lng, color, radius, strokeColor = '#ffffff') => {
            return L.circleMarker([lat, lng], {
                radius: radius,
                fillColor: color,
                color: strokeColor,
                weight: 2,
                opacity: 1,
                fillOpacity: 0.88,
            });
        };

        // A. Monitoring Sites
        if (activeLayer === 'all' || activeLayer === 'sites') {
            (data.sites || []).forEach((site) => {
                if (filters.habitat !== 'All' && site.habitat !== filters.habitat) return;
                if (query && !site.name.toLowerCase().includes(query) && !site.habitat.toLowerCase().includes(query) && !site.country.toLowerCase().includes(query)) return;

                const marker = createCircleMarker(site.lat, site.lng, '#059669', 9);
                marker.on('click', () => {
                    setSelectedFeature({ ...site, featureType: 'Site' });
                });

                const popupHtml = `
                    <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
                        <div style="font-weight: 700; color: #065f46; font-size: 13px; display: flex; align-items: center; gap: 4px;">
                            📍 ${site.name}
                        </div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Monitoring Station</div>
                        <div style="margin-top: 6px; font-size: 11px; color: #334155; line-height: 1.4;">
                            <div><b>Habitat:</b> ${site.habitat}</div>
                            <div><b>Country:</b> ${site.country}</div>
                            <div><b>GPS:</b> ${site.lat.toFixed(4)}, ${site.lng.toFixed(4)}</div>
                        </div>
                        <div style="margin-top: 6px; font-size: 10px; color: #059669; font-weight: 600; text-transform: uppercase;">
                            Active Field Sensor Hub
                        </div>
                    </div>
                `;
                marker.bindPopup(popupHtml);
                marker.addTo(markersLayer);
                plottedCount++;
            });
        }

        // B. Observations / Wildlife Sightings
        if (activeLayer === 'all' || activeLayer === 'observations') {
            (data.observations || []).forEach((obs) => {
                if (filters.species !== 'All' && obs.species !== filters.species) return;
                if (filters.habitat !== 'All' && obs.habitat !== filters.habitat) return;
                if (filters.threatLevel !== 'All' && obs.risk_level !== filters.threatLevel) return;
                if (query && !obs.species.toLowerCase().includes(query) && !obs.scientific_name.toLowerCase().includes(query) && !obs.site.toLowerCase().includes(query)) return;

                const marker = createCircleMarker(obs.lat, obs.lng, obs.marker_color, 8);
                marker.on('click', () => {
                    setSelectedFeature({ ...obs, featureType: 'Observation' });
                });

                const popupHtml = `
                    <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 200px;">
                        <div style="font-weight: 700; color: #0f172a; font-size: 14px;">🐾 ${obs.species}</div>
                        <div style="font-size: 11px; color: #64748b; font-style: italic;">${obs.scientific_name}</div>
                        <div style="margin-top: 6px; font-size: 11px; color: #334155; line-height: 1.4;">
                            <div><b>Station:</b> ${obs.site}</div>
                            <div><b>Count Observed:</b> ${obs.count}</div>
                            <div><b>IUCN / Status:</b> <span style="font-weight: 700; color: ${obs.marker_color};">${obs.risk_level}</span></div>
                            <div><b>Date:</b> ${obs.observation_date}</div>
                        </div>
                    </div>
                `;
                marker.bindPopup(popupHtml);
                marker.addTo(markersLayer);
                plottedCount++;
            });
        }

        // C. Habitat Health Zones
        if (activeLayer === 'all' || activeLayer === 'habitats') {
            (data.habitats || []).forEach((hab) => {
                if (filters.habitat !== 'All' && hab.name !== filters.habitat) return;
                if (filters.threatLevel !== 'All' && hab.risk_level !== filters.threatLevel) return;
                if (query && !hab.name.toLowerCase().includes(query) && !hab.region.toLowerCase().includes(query)) return;

                const marker = createCircleMarker(hab.lat, hab.lng, hab.marker_color, 12, '#0f172a');
                marker.on('click', () => {
                    setSelectedFeature({ ...hab, featureType: 'Habitat' });
                });

                const popupHtml = `
                    <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 200px;">
                        <div style="font-weight: 700; color: #0284c7; font-size: 14px;">🌳 ${hab.name}</div>
                        <div style="font-size: 11px; color: #64748b;">${hab.region}</div>
                        <div style="margin-top: 6px; font-size: 11px; color: #334155; line-height: 1.4;">
                            <div><b>Suitability Score:</b> ${hab.quality_score}%</div>
                            <div><b>Risk Level:</b> <span style="font-weight: 700; color: ${hab.marker_color};">${hab.risk_level}</span></div>
                            <div><b>Monitored Species:</b> ${hab.species_count}</div>
                            <div><b>Area:</b> ${hab.area_km2} km²</div>
                        </div>
                    </div>
                `;
                marker.bindPopup(popupHtml);
                marker.addTo(markersLayer);
                plottedCount++;
            });
        }

        // D. Population Hotspots
        if (activeLayer === 'all' || activeLayer === 'hotspots') {
            (data.hotspots || []).forEach((spot) => {
                if (filters.species !== 'All' && spot.species !== filters.species) return;
                if (query && !spot.species.toLowerCase().includes(query) && !spot.habitat_name.toLowerCase().includes(query)) return;

                const marker = createCircleMarker(spot.lat, spot.lng, '#2563eb', 10);
                marker.on('click', () => {
                    setSelectedFeature({ ...spot, featureType: 'Hotspot' });
                });

                const popupHtml = `
                    <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 190px;">
                        <div style="font-weight: 700; color: #1d4ed8; font-size: 13px;">👥 Population Density Hotspot</div>
                        <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-top: 2px;">${spot.species}</div>
                        <div style="margin-top: 6px; font-size: 11px; color: #334155; line-height: 1.4;">
                            <div><b>Habitat:</b> ${spot.habitat_name}</div>
                            <div><b>Density:</b> ${spot.density} animals/km²</div>
                            <div><b>Estimated Count:</b> ${spot.population_count}</div>
                        </div>
                    </div>
                `;
                marker.bindPopup(popupHtml);
                marker.addTo(markersLayer);
                plottedCount++;
            });
        }

        // Auto-adjust bounds on initial load if valid
        if (plottedCount > 0 && markersLayer.getLayers().length > 0) {
            try {
                const bounds = markersLayer.getBounds();
                if (bounds.isValid()) {
                    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
                }
            } catch (e) {
                // Ignore non-fatal bound exceptions
            }
        }
    }, [data, activeLayer, filters, searchQuery]);

    // Unique filter options
    const speciesList = useMemo(() => {
        const set = new Set();
        (data?.observations || []).forEach((o) => set.add(o.species));
        (data?.hotspots || []).forEach((h) => set.add(h.species));
        return ['All', ...Array.from(set)];
    }, [data]);

    const habitatList = useMemo(() => {
        const set = new Set();
        (data?.sites || []).forEach((s) => set.add(s.habitat));
        (data?.habitats || []).forEach((h) => set.add(h.name));
        return ['All', ...Array.from(set)];
    }, [data]);

    const threatList = ['All', 'Healthy', 'Medium Risk', 'High Risk', 'Critical'];

    const resetFilters = () => {
        setFilters({ species: 'All', habitat: 'All', threatLevel: 'All' });
        setSearchQuery('');
        setActiveLayer('all');
    };

    const zoomToFeature = (lat, lng) => {
        if (mapInstanceRef.current && lat != null && lng != null) {
            mapInstanceRef.current.setView([lat, lng], 10, { animate: true });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>GIS Spatial Intelligence Engine</span>
                    </div>
                    <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">Wildlife GIS & Habitat Map</h1>
                    <p className="mt-2 max-w-2xl text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
                        Interactive GIS spatial canvas plotting real-time field monitoring stations, wildlife observation sightings, habitat suitability polygons, and population density clusters.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 transition cursor-pointer border border-white/10 shadow-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Telemetry</span>
                    </button>
                </div>
            </div>

            {/* Live KPI Metric Ribbon */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Monitoring Stations</span>
                        <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{data?.total_sites || 0}</div>
                    <span className="text-[11px] font-medium text-emerald-600">Active Field Sensor Hubs</span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Observation Sightings</span>
                        <Eye className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{data?.total_observations || 0}</div>
                    <span className="text-[11px] font-medium text-sky-600">Georeferenced Records</span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Habitat Zones</span>
                        <Trees className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{data?.total_habitats || 0}</div>
                    <span className="text-[11px] font-medium text-teal-600">Suitability Polygons</span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Density Hotspots</span>
                        <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{data?.total_hotspots || 0}</div>
                    <span className="text-[11px] font-medium text-indigo-600">Census Clusters</span>
                </div>
            </div>

            {/* Filter & Control Bar */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by species, site name, habitat, country..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Layer Selector Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        {[
                            { id: 'all', label: 'All Layers', icon: Layers },
                            { id: 'sites', label: 'Sites', icon: MapPin },
                            { id: 'observations', label: 'Sightings', icon: Eye },
                            { id: 'habitats', label: 'Habitats', icon: Trees },
                            { id: 'hotspots', label: 'Hotspots', icon: Users },
                        ].map((layer) => {
                            const Icon = layer.icon;
                            const active = activeLayer === layer.id;
                            return (
                                <button
                                    key={layer.id}
                                    onClick={() => setActiveLayer(layer.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition cursor-pointer whitespace-nowrap ${
                                        active
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{layer.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Dropdowns */}
                <div className="grid gap-3 sm:grid-cols-4 pt-2 border-t border-slate-100 text-xs">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Species</label>
                        <select
                            value={filters.species}
                            onChange={(e) => setFilters({ ...filters, species: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        >
                            {speciesList.map((sp) => (
                                <option key={sp} value={sp}>{sp}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Habitat</label>
                        <select
                            value={filters.habitat}
                            onChange={(e) => setFilters({ ...filters, habitat: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        >
                            {habitatList.map((hab) => (
                                <option key={hab} value={hab}>{hab}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Threat / Risk Level</label>
                        <select
                            value={filters.threatLevel}
                            onChange={(e) => setFilters({ ...filters, threatLevel: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        >
                            {threatList.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={resetFilters}
                            className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 font-semibold transition cursor-pointer text-center"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button onClick={loadData} className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition">
                        Retry
                    </button>
                </div>
            )}

            {/* Map Canvas & Inspector Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Map Container */}
                <div className="lg:col-span-3 relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
                    {/* Map Canvas */}
                    <div ref={mapContainerRef} className="h-[620px] w-full z-0" />

                    {/* Top Right Base Map Switcher */}
                    <div className="absolute top-4 right-4 z-10 flex rounded-xl bg-white/95 backdrop-blur-md p-1 shadow-md border border-slate-200 text-xs">
                        <button
                            onClick={() => setBaseMap('osm')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                                baseMap === 'osm' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Standard Map
                        </button>
                        <button
                            onClick={() => setBaseMap('light')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                                baseMap === 'light' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Light Positron
                        </button>
                    </div>

                    {/* Floating Legend Box (Bottom Left) */}
                    <div className="absolute bottom-4 left-4 z-10 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-xl border border-slate-200 max-w-xs text-[11px]">
                        <span className="font-bold text-slate-800 uppercase tracking-wider block mb-2">GIS Telemetry Legend</span>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-xs inline-block"></span>
                                <span className="text-slate-700 font-medium">Monitoring Site</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs inline-block"></span>
                                <span className="text-slate-700 font-medium">Density Hotspot</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs inline-block"></span>
                                <span className="text-slate-700 font-medium">Vulnerable / Med</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-xs inline-block"></span>
                                <span className="text-slate-700 font-medium">Critical / Endang.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Inspector Drawer */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-emerald-600" />
                                <h3 className="font-bold text-slate-800 text-sm">Spatial Inspector</h3>
                            </div>
                            {selectedFeature && (
                                <button
                                    onClick={() => setSelectedFeature(null)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {selectedFeature ? (
                            <div className="mt-4 space-y-4 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Feature: {selectedFeature.featureType}
                                    </span>
                                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                                        {selectedFeature.species || selectedFeature.name || selectedFeature.habitat_name}
                                    </h4>
                                    {selectedFeature.scientific_name && (
                                        <p className="italic text-slate-500">{selectedFeature.scientific_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-100 text-slate-700">
                                    {selectedFeature.site && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Station:</span>
                                            <span className="font-semibold text-slate-800">{selectedFeature.site}</span>
                                        </div>
                                    )}
                                    {selectedFeature.habitat && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Habitat:</span>
                                            <span className="font-semibold text-slate-800">{selectedFeature.habitat}</span>
                                        </div>
                                    )}
                                    {selectedFeature.country && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Country:</span>
                                            <span className="font-semibold text-slate-800">{selectedFeature.country}</span>
                                        </div>
                                    )}
                                    {selectedFeature.count != null && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Count:</span>
                                            <span className="font-bold text-slate-900">{selectedFeature.count}</span>
                                        </div>
                                    )}
                                    {selectedFeature.population_count != null && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Population:</span>
                                            <span className="font-bold text-slate-900">{selectedFeature.population_count}</span>
                                        </div>
                                    )}
                                    {selectedFeature.density != null && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Density:</span>
                                            <span className="font-bold text-blue-700">{selectedFeature.density} / km²</span>
                                        </div>
                                    )}
                                    {selectedFeature.quality_score != null && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Suitability:</span>
                                            <span className="font-bold text-emerald-700">{selectedFeature.quality_score}%</span>
                                        </div>
                                    )}
                                    {selectedFeature.risk_level && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Risk Level:</span>
                                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px]" style={{ color: selectedFeature.marker_color }}>
                                                {selectedFeature.risk_level}
                                            </span>
                                        </div>
                                    )}
                                    {selectedFeature.observation_date && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Observed:</span>
                                            <span className="text-slate-700">{selectedFeature.observation_date}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-1 border-t border-slate-200/60 font-mono text-[10px]">
                                        <span className="text-slate-400">Coords:</span>
                                        <span className="text-slate-600">
                                            {selectedFeature.lat?.toFixed(4)}, {selectedFeature.lng?.toFixed(4)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => zoomToFeature(selectedFeature.lat, selectedFeature.lng)}
                                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer shadow-xs"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                    <span>Focus on Map</span>
                                </button>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400 text-xs">
                                <Compass className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-medium">No feature selected</p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Click any marker or zone on the map to inspect live environmental metrics.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

