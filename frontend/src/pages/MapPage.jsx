import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Filter, Search, X, RotateCcw, Layers, ChevronLeft, ChevronRight,
  MapPin, Camera, Activity, AlertCircle, CheckCircle2, Clock, Loader2,
  ExternalLink, Thermometer, Info, ZoomIn, ZoomOut, Maximize, Compass, ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import mapService from '../services/mapService';
import siteService from '../services/siteService';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom markers using SVG divIcons
const createMarkerIcon = (color, isRare = false, size = 32) => {
  const glowClass = isRare ? 'animate-ping' : '';
  const scaleClass = isRare ? 'scale-110 border-red-500' : 'border-white';
  
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
        ${isRare ? `<div class="absolute inset-0 rounded-full bg-rose-500/40 opacity-75 ${glowClass}"></div>` : ''}
        <div style="
          width: ${size - 8}px; height: ${size - 8}px;
          background: ${color};
          border: 2px solid ${isRare ? '#ef4444' : 'white'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        " class="${scaleClass}"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

const MARKER_COLORS = {
  site: '#10b981',       // Emerald
  verified: '#10b981',   // Emerald/Green for verified
  pending: '#f59e0b',    // Amber for pending validation/verification
  rejected: '#ef4444',   // Rose/Red for rejected
  prediction: '#8b5cf6'  // Purple/Violet for predictions
};

const RARE_SPECIES = new Set([
  "Apex Predators", "Cold-Climate Survivors", "Stealth & Shadows", "Tough Defenders",
  "Bengal Tiger", "Asian Elephant", "Indian Leopard", "Lion-tailed Macaque"
]);

// Fit map bounds helper
const FitBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (!markers || markers.length === 0) return;
    const valid = markers.filter(m => m.latitude && m.longitude);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(valid.map(m => [m.latitude, m.longitude]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [markers, map]);
  return null;
};

// Reset view controller helper
const MapController = ({ resetTrigger, currentZoom, mapRef }) => {
  const map = useMap();
  useEffect(() => {
    if (resetTrigger > 0) {
      map.setView([11.5623, 76.5412], 8); // Reset to seeding region (Mudumalai/Anamalai)
    }
  }, [resetTrigger, map]);
  return null;
};

// Heatmap circles layer
const HeatmapLayer = ({ points }) => {
  if (!points || points.length === 0) return null;
  const maxIntensity = Math.max(...points.map(p => p.intensity), 1);
  return (
    <>
      {points.map((p, i) => {
        const ratio = p.intensity / maxIntensity;
        const radius = 25 + ratio * 60;
        const opacity = 0.2 + ratio * 0.6;
        const color = ratio > 0.7 ? '#ef4444' : ratio > 0.4 ? '#f97316' : '#10b981';
        return (
          <CircleMarker
            key={i}
            center={[p.lat, p.lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: opacity, weight: 0 }}
          >
            <Popup>
              <div className="text-xs font-bold p-1">
                <span className="block text-gray-500 uppercase tracking-wide">Density Intensity</span>
                <span className="text-sm font-extrabold text-gray-900">{p.intensity} Mapped Records</span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};

const EMPTY_FILTERS = {
  species: '',
  monitoring_site_id: '',
  verification_status: '',
  prediction_source: '',
  start_date: '',
  end_date: '',
  search: ''
};

const MapPage = () => {
  // Data state
  const [sites, setSites] = useState([]);
  const [observations, setObservations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [speciesDistribution, setSpeciesDistribution] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);

  // Filters state
  const [draftFilters, setDraftFilters] = useState({ ...EMPTY_FILTERS });
  const [activeFilters, setActiveFilters] = useState({ ...EMPTY_FILTERS });

  // Layer toggles
  const [layerSites, setLayerSites] = useState(true);
  const [layerObservations, setLayerObservations] = useState(true);
  const [layerPredictions, setLayerPredictions] = useState(true);

  const mapRef = useRef(null);

  // Load sites for dropdown
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const s = await siteService.getSites();
        setSiteOptions(s);
      } catch (err) {
        console.error("Failed to load site list", err);
      }
    };
    fetchSites();
  }, []);

  // Main data fetcher
  const loadMapData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sitesData, obsData, heatData, distData] = await Promise.all([
        mapService.getSites(),
        mapService.getObservations(activeFilters),
        mapService.getHeatmap(activeFilters),
        mapService.getSpeciesDistribution(activeFilters)
      ]);
      
      setSites(sitesData);
      setObservations(obsData.observations || []);
      setPredictions(obsData.predictions || []);
      setHeatmapPoints(heatData.points || []);
      setSpeciesDistribution(distData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch Map details. Please reload.");
      toast.error("Map connection failed");
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(activeFilters).filter(([k, v]) => v !== '' && k !== 'search').length;
  }, [activeFilters]);

  const applyFilters = (e) => {
    e?.preventDefault();
    setActiveFilters({ ...draftFilters });
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftFilters({ ...EMPTY_FILTERS });
    setActiveFilters({ ...EMPTY_FILTERS });
    setFilterOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveFilters(prev => ({ ...prev, search: draftFilters.search }));
  };

  const handleResetMap = () => {
    setResetViewTrigger(prev => prev + 1);
  };

  // Compile list of markers that should show
  const filteredMarkers = useMemo(() => {
    const markers = [];
    
    if (layerSites) {
      sites.forEach(s => {
        markers.push({
          ...s,
          latitude: s.latitude,
          longitude: s.longitude,
          markerType: 'site'
        });
      });
    }

    if (layerObservations) {
      observations.forEach(o => {
        markers.push({
          ...o,
          markerType: 'observation'
        });
      });
    }

    if (layerPredictions) {
      predictions.forEach(p => {
        markers.push({
          ...p,
          markerType: 'prediction'
        });
      });
    }

    return markers;
  }, [sites, observations, predictions, layerSites, layerObservations, layerPredictions]);

  return (
    <div className="flex flex-col h-full -m-6 md:-m-10 overflow-hidden" style={{ height: 'calc(100vh - 2.5rem)' }}>
      {/* Map Header and Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-100 shadow-sm z-10 flex-wrap">
        <div className="flex items-center gap-2 mr-auto">
          <Map className="w-5.5 h-5.5 text-emerald-600 animate-pulse" />
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">Interactive Wildlife Map</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WPIS Geographic Center</p>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600 ml-2" />}
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search species, site, observer..."
            className="pl-9 pr-3 h-9 w-full text-xs rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            value={draftFilters.search}
            onChange={e => setDraftFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </form>

        {/* Heatmap trigger */}
        <Button
          size="sm"
          variant={showHeatmap ? 'default' : 'outline'}
          className={`h-9 text-xs gap-1.5 font-bold rounded-xl ${showHeatmap ? 'bg-amber-500 text-white hover:bg-amber-600 border-transparent shadow' : ''}`}
          onClick={() => setShowHeatmap(prev => !prev)}
        >
          <Thermometer className="w-4 h-4" />
          Heatmap Layer
        </Button>

        {/* Filters trigger */}
        <Button
          size="sm"
          variant={activeFiltersCount > 0 ? 'default' : 'outline'}
          className={`h-9 text-xs gap-1.5 font-bold rounded-xl ${activeFiltersCount > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
          onClick={() => setFilterOpen(prev => !prev)}
        >
          <Filter className="w-4 h-4" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>

        {/* Panel trigger */}
        <Button
          size="sm"
          variant="outline"
          className="h-9 text-xs gap-1.5 font-bold rounded-xl"
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {sidebarOpen ? 'Hide Info' : 'Sidebar'}
        </Button>
      </div>

      {/* Slide down Filters Container */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-100 z-10 shadow-inner overflow-hidden"
          >
            <form onSubmit={applyFilters} className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-500 uppercase">Species</Label>
                <Input
                  className="h-9 text-xs rounded-xl"
                  placeholder="e.g. Tiger"
                  value={draftFilters.species}
                  onChange={e => setDraftFilters(prev => ({ ...prev, species: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-500 uppercase">Site</Label>
                <select
                  value={draftFilters.monitoring_site_id}
                  onChange={e => setDraftFilters(prev => ({ ...prev, monitoring_site_id: e.target.value }))}
                  className="flex h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs"
                >
                  <option value="">All Sites</option>
                  {siteOptions.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.site_name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-500 uppercase">Status</Label>
                <select
                  value={draftFilters.verification_status}
                  onChange={e => setDraftFilters(prev => ({ ...prev, verification_status: e.target.value }))}
                  className="flex h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs"
                >
                  <option value="">All Statuses</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Pending Validation">Pending Validation</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-500 uppercase">Source</Label>
                <select
                  value={draftFilters.prediction_source}
                  onChange={e => setDraftFilters(prev => ({ ...prev, prediction_source: e.target.value }))}
                  className="flex h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs"
                >
                  <option value="">All Sources</option>
                  <option value="AI">AI Prediction</option>
                  <option value="Manual">Manual Entry</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-500 uppercase">Start Date</Label>
                <Input
                  type="date"
                  className="h-9 text-xs rounded-xl"
                  value={draftFilters.start_date}
                  onChange={e => setDraftFilters(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-500 uppercase">End Date</Label>
                <Input
                  type="date"
                  className="h-9 text-xs rounded-xl"
                  value={draftFilters.end_date}
                  onChange={e => setDraftFilters(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>

              <div className="col-span-2 lg:col-span-6 flex gap-3 justify-end pt-2">
                <Button size="sm" type="button" variant="ghost" className="h-9 text-xs rounded-xl" onClick={resetFilters}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                </Button>
                <Button size="sm" type="submit" className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5">
                  Apply Filters
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel Content: Map & Info Sidebars */}
      <div className="flex flex-1 overflow-hidden">
        {/* Leaflet Map Column */}
        <div className="flex-1 relative h-full">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-[999] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-gray-500">Querying geographic databases...</p>
            </div>
          )}

          <MapContainer
            center={[11.5623, 76.5412]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds markers={filteredMarkers} />
            <MapController resetTrigger={resetViewTrigger} />

            {/* Heatmap Density Overlays */}
            {showHeatmap && <HeatmapLayer points={heatmapPoints} />}

            {/* Sites, Observations, Predictions Markers */}
            {!showHeatmap && filteredMarkers.map((marker, idx) => {
              let color = MARKER_COLORS.site;
              const isRare = marker.markerType !== 'site' && RARE_SPECIES.has(marker.species_name);
              
              if (marker.markerType === 'observation') {
                if (marker.verification_status === 'Verified') color = MARKER_COLORS.verified;
                else if (marker.verification_status === 'Rejected') color = MARKER_COLORS.rejected;
                else color = MARKER_COLORS.pending;
              } else if (marker.markerType === 'prediction') {
                color = MARKER_COLORS.prediction;
              }

              return (
                <Marker
                  key={`${marker.markerType}-${marker.id}-${idx}`}
                  position={[marker.latitude, marker.longitude]}
                  icon={createMarkerIcon(color, isRare)}
                  eventHandlers={{
                    click: () => {
                      setSelectedItem(marker);
                    }
                  }}
                >
                  <Popup className="wpis-map-popup" maxWidth={300}>
                    <MapMarkerPopup marker={marker} />
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Reset View & Custom Zoom Controls */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
            <button 
              onClick={() => mapRef.current?.zoomIn()}
              className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-md flex items-center justify-center font-bold border border-gray-100 transition-transform active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button 
              onClick={() => mapRef.current?.zoomOut()}
              className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-md flex items-center justify-center font-bold border border-gray-100 transition-transform active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button 
              onClick={handleResetMap}
              className="w-10 h-10 bg-white hover:bg-gray-50 text-emerald-600 rounded-xl shadow-md flex items-center justify-center font-bold border border-gray-100 transition-transform active:scale-95"
              title="Reset View"
            >
              <Compass className="w-5 h-5" />
            </button>
          </div>

          {/* Layer Panel Overlay */}
          <div className="absolute bottom-6 left-6 z-[400] bg-white/90 backdrop-blur-md border border-gray-150 rounded-2xl p-4 shadow-lg text-xs space-y-2.5 min-w-[150px]">
            <p className="font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">Map Layers</p>
            {[
              { label: 'Monitoring Sites', value: layerSites, set: setLayerSites, color: MARKER_COLORS.site },
              { label: 'Observations', value: layerObservations, set: setLayerObservations, color: MARKER_COLORS.verified },
              { label: 'AI Predictions', value: layerPredictions, set: setLayerPredictions, color: MARKER_COLORS.prediction }
            ].map((layer, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer select-none">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: layer.color }} />
                <span className="font-semibold text-gray-700">{layer.label}</span>
                <input 
                  type="checkbox" 
                  checked={layer.value} 
                  onChange={e => layer.set(e.target.checked)} 
                  className="ml-auto accent-emerald-600"
                />
              </label>
            ))}
          </div>

          {/* Rare Species Alert Legend Overlay */}
          <div className="absolute bottom-6 right-6 z-[400] bg-white/95 backdrop-blur-md border border-red-100 rounded-2xl p-3 shadow-lg text-[10px] space-y-1.5 max-w-[170px]">
            <p className="font-extrabold text-red-500 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> High Alert Alert
            </p>
            <p className="text-gray-500 font-medium leading-relaxed">
              Rare species and top apex predator detections are surrounded by a <span className="text-red-500 font-bold">blinking red ring</span> indicator.
            </p>
          </div>
        </div>

        {/* SIDE BAR / DETAIL PANEL */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-l border-gray-100 overflow-y-auto flex-shrink-0 h-full shadow-lg"
            >
              <div className="p-6 space-y-6">
                {/* Detail View Mode */}
                {selectedItem ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider">
                        {selectedItem.markerType === 'site' ? 'Site Detail' : selectedItem.markerType === 'prediction' ? 'Prediction Detail' : 'Observation Detail'}
                      </h2>
                      <button 
                        onClick={() => setSelectedItem(null)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <DetailPanelItem item={selectedItem} />
                  </div>
                ) : (
                  // Species Distribution Stats View Mode
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider mb-1">Species Distribution</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dynamic Density Metrics</p>
                    </div>

                    <div className="space-y-3.5">
                      {speciesDistribution.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6 font-semibold">No species matched the active filter</p>
                      ) : (
                        speciesDistribution.map((spec, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-gray-900 text-xs truncate max-w-[180px]">{spec.species_name}</span>
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                {spec.observation_count} Obs
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-gray-200/50 font-bold text-gray-500">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Verified: {spec.verified_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Pending: {spec.pending_count}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Map Popup contents
const MapMarkerPopup = ({ marker }) => {
  if (marker.markerType === 'site') {
    return (
      <div className="space-y-1 text-xs">
        <h4 className="font-extrabold text-emerald-700 text-sm">{marker.site_name}</h4>
        <p className="text-gray-500 font-medium">{marker.location}, {marker.state}</p>
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-100">
            {marker.status}
          </span>
          <span className="text-gray-400 font-bold">{marker.habitat_type}</span>
        </div>
      </div>
    );
  }

  const isAI = marker.prediction_source === 'AI' || marker.markerType === 'prediction';

  return (
    <div className="space-y-2 text-xs min-w-[200px]">
      {marker.file_url && (
        <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-55 shadow-inner">
          <img src={marker.file_url} alt={marker.species_name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <h4 className="font-extrabold text-gray-900 text-sm">{marker.species_name}</h4>
        {marker.confidence_score != null && (
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
            {marker.confidence_score}%
          </span>
        )}
      </div>
      {marker.scientific_name && <p className="text-[10px] italic text-gray-400">{marker.scientific_name}</p>}
      
      <div className="space-y-1 pt-1.5 border-t border-gray-100 text-gray-500 font-medium">
        <p>Observer: {marker.observer_name}</p>
        <p>Site: {marker.monitoring_site_name}</p>
        <p>Date: {new Date(marker.observed_at).toLocaleDateString()}</p>
      </div>

      <div className="pt-1 flex items-center justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
          marker.verification_status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
          marker.verification_status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
          'bg-amber-50 text-amber-700 border border-amber-100'
        }`}>
          {marker.verification_status || 'Pending'}
        </span>
        {isAI && (
          <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded font-bold">
            AI Mapped
          </span>
        )}
      </div>
    </div>
  );
};

// Detail panel side drawer views
const DetailPanelItem = ({ item }) => {
  if (item.markerType === 'site') {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <MapPin className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-lg font-black text-gray-900">{item.site_name}</h3>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wide">{item.location}</p>
        </div>

        <div className="space-y-3 pt-2">
          {[
            { label: 'District / State', value: `${item.district}, ${item.state}` },
            { label: 'Habitat Type', value: item.habitat_type },
            { label: 'Area Covered', value: `${item.area_sq_km} sq. km` },
            { label: 'Status', value: item.status },
            { label: 'Coordinates', value: `${item.latitude.toFixed(4)}° N, ${item.longitude.toFixed(4)}° E` }
          ].map((field, idx) => (
            <div key={idx} className="flex justify-between text-xs border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-400 uppercase">{field.label}</span>
              <span className="font-extrabold text-gray-800">{field.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isAI = item.prediction_source === 'AI' || item.markerType === 'prediction';

  return (
    <div className="space-y-4">
      {item.file_url ? (
        <div className="w-full h-44 rounded-2xl overflow-hidden border border-gray-150 bg-gray-50 shadow-inner">
          <img src={item.file_url} alt={item.species_name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-24 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-xs font-semibold">
          <Camera className="w-8 h-8 opacity-30 mb-1" />
          No Photo Uploaded
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-xl font-black text-gray-900">{item.species_name}</h3>
        {item.scientific_name && <p className="text-xs italic text-gray-400 font-medium">{item.scientific_name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <span className="text-[10px] text-gray-400 block font-bold uppercase">Confidence</span>
          <span className="text-base font-extrabold text-gray-800">{item.confidence_score != null ? `${item.confidence_score}%` : '100%'}</span>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <span className="text-[10px] text-gray-400 block font-bold uppercase">Verification</span>
          <span className="text-xs font-extrabold text-gray-850 block mt-1">{item.verification_status || 'Pending'}</span>
        </div>
      </div>

      <div className="space-y-3 pt-2 text-xs">
        <h4 className="font-extrabold text-gray-400 uppercase tracking-wider text-[10px]">Registry Metadata</h4>
        {[
          { label: 'Observer / Agent', value: item.observer_name },
          { label: 'Monitoring Location', value: item.monitoring_site_name },
          { label: 'Date Observed', value: new Date(item.observed_at).toLocaleString() },
          { label: 'Coordinates Mapped', value: `${item.latitude.toFixed(4)}°, ${item.longitude.toFixed(4)}°` },
          { label: 'Prediction Mode', value: isAI ? 'AI Recognizer' : 'Manual Entry' }
        ].map((field, idx) => (
          <div key={idx} className="flex justify-between border-b border-gray-50 pb-2">
            <span className="font-bold text-gray-400 uppercase text-[10px]">{field.label}</span>
            <span className="font-extrabold text-gray-800">{field.value}</span>
          </div>
        ))}
      </div>

      {isAI && item.prediction_id && (
        <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-4 space-y-2">
          <h4 className="text-[10px] font-extrabold text-violet-800 uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> AI Model Linkage
          </h4>
          <p className="text-[11px] text-violet-700/80 font-medium">
            This record was automatically derived from the species detection model under run code <span className="font-extrabold">{item.prediction_id.slice(-6)}</span>.
          </p>
        </div>
      )}

      {item.notes && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Notes & Logs</span>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">{item.notes}</p>
        </div>
      )}
    </div>
  );
};

export default MapPage;
