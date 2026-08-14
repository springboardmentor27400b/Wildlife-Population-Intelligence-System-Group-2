import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import { 
  getObservations, 
  analyzeObservation 
} from '../api/observations';
import { getMonitoringSites } from '../api/monitoringSites';
import { getCameraTraps } from '../api/cameraTraps';
import { getAudioSensors } from '../api/audioSensors';
import { getEcologicalReport } from '../api/ecological';
import { 
  MapPin, 
  Globe, 
  Compass, 
  LayoutGrid, 
  Eye, 
  Volume2, 
  Camera, 
  Play, 
  Calendar, 
  Sparkles, 
  Activity, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Search,
  SlidersHorizontal,
  Terminal,
  Cpu,
  Info
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export const MapVisualization = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  
  // Data layers
  const [sites, setSites] = useState([]);
  const [observations, setObservations] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [sensors, setSensors] = useState([]);
  
  // Selection and Filter states
  const [showObs, setShowObs] = useState(true);
  const [showSites, setShowSites] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showSensors, setShowSensors] = useState(true);

  const [selectedObs, setSelectedObs] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedSiteReport, setSelectedSiteReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [sitesData, obsData, camData, sensData] = await Promise.all([
        getMonitoringSites({ page_size: 100 }),
        getObservations({ page_size: 100 }),
        getCameraTraps({ page_size: 100 }),
        getAudioSensors({ page_size: 100 })
      ]);
      setSites(sitesData.items || []);
      setObservations(obsData.items || []);
      setCameras(camData.items || []);
      setSensors(sensData.items || []);
      
      // Process deep-link search parameters
      const speciesParam = searchParams.get('species');
      const siteParam = searchParams.get('site');
      if (speciesParam) {
        setSearchQuery(speciesParam);
      } else if (siteParam) {
        const foundSite = (sitesData.items || []).find(s => s.id === siteParam || s.name?.toLowerCase().includes(siteParam.toLowerCase()));
        if (foundSite) {
          handleSelectSite(foundSite);
        }
      }
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to retrieve spatial coordinates.', type: 'error' });
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [searchParams]);

  const handleSelectSite = async (site) => {
    setSelectedObs(null);
    setSelectedSite(site);
    setLoadingReport(true);
    try {
      const report = await getEcologicalReport(site.id);
      setSelectedSiteReport(report);
    } catch (err) {
      console.error('Failed to load site ecological report:', err);
      setSelectedSiteReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleRunAI = async (obsId) => {
    setAnalyzing(true);
    try {
      setToastMsg({ text: 'Initiating neural inference...', type: 'info' });
      const result = await analyzeObservation(obsId);
      if (result.success) {
        setToastMsg({ text: 'AI inference pipeline success!', type: 'success' });
        const updatedObsData = await getObservations({ page_size: 100 });
        const freshList = updatedObsData.items || [];
        setObservations(freshList);
        const match = freshList.find(o => o.id === obsId);
        if (match) setSelectedObs(match);
      } else {
        setToastMsg({ text: 'Analysis failed: ' + result.message, type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'AI pipeline connection failure.', type: 'error' });
    } finally {
      setAnalyzing(false);
    }
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/static/')) {
      const BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/api')[0] : 'http://localhost:8000';
      return `${BASE}${url}`;
    }
    return url;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Running':
        return <Badge variant="info">Running</Badge>;
      case 'Failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="warning">Not Started</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  // Site coordinate lookup helper
  const siteMap = {};
  sites.forEach(s => { siteMap[s.id] = s; });

  // Compile coordinate log objects
  const rawLogs = [];
  if (showSites) {
    sites.forEach(s => {
      rawLogs.push({ 
        name: s.name, 
        type: 'Site', 
        coords: `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`, 
        detail: s.habitat_type,
        data: s 
      });
    });
  }
  if (showCameras) {
    cameras.forEach(c => {
      const site = siteMap[c.site_id];
      const coordsText = site 
        ? `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}` 
        : 'Not Associated';
      rawLogs.push({ 
        name: `${c.model} (S/N: ${c.serial_number})`, 
        type: 'Camera', 
        coords: coordsText, 
        detail: site ? `Location: ${site.name}` : 'Warehouse',
        data: c 
      });
    });
  }
  if (showSensors) {
    sensors.forEach(s => {
      const site = siteMap[s.site_id];
      const coordsText = site 
        ? `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}` 
        : 'Not Associated';
      rawLogs.push({ 
        name: `${s.model} (S/N: ${s.serial_number})`, 
        type: 'Sensor', 
        coords: coordsText, 
        detail: site ? `Location: ${site.name}` : 'Warehouse',
        data: s 
      });
    });
  }
  if (showObs) {
    observations.forEach(o => {
      rawLogs.push({
        name: `${o.species} Sighting (Qty: ${o.count})`,
        type: 'Observation',
        coords: `${o.latitude.toFixed(4)}, ${o.longitude.toFixed(4)}`,
        detail: formatDateTime(o.observed_at),
        data: o
      });
    });
  }

  // Filter list logs on query input
  const coordinateLogs = rawLogs.filter(log => {
    const q = searchQuery.toLowerCase();
    return log.name.toLowerCase().includes(q) || log.type.toLowerCase().includes(q) || log.coords.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Self-contained CSS Animations for scan line and glowing markers */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0.15; }
          50% { opacity: 0.45; }
          100% { top: 100%; opacity: 0.15; }
        }
        .animate-scan {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #10b981, transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none;
        }
        @keyframes halo {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 0.15; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        .pulse-halo {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          animation: halo 2s infinite ease-in-out;
        }
      `}</style>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-forest-850 pb-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Globe className="w-6.5 h-6.5 text-emerald-600 animate-spin-slow" />
            Biological Spatial Command Center
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 font-semibold">
            Real-time coordinates telemetry tracking sensor distributions and species detection logs.
          </p>
        </div>

        {/* Checkbox Layer Controls */}
        <div className="flex flex-wrap gap-3 text-xs bg-slate-50 dark:bg-forest-900 border p-2.5 rounded-xl">
          <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-655 dark:text-slate-300">
            <input type="checkbox" checked={showObs} onChange={(e) => setShowObs(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
            Sightings
          </label>
          <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-655 dark:text-slate-300">
            <input type="checkbox" checked={showSites} onChange={(e) => setShowSites(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
            Sites
          </label>
          <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-655 dark:text-slate-300">
            <input type="checkbox" checked={showCameras} onChange={(e) => setShowCameras(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
            Cameras
          </label>
          <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-655 dark:text-slate-300">
            <input type="checkbox" checked={showSensors} onChange={(e) => setShowSensors(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
            Sensors
          </label>
        </div>
      </div>

      {/* Hero Mini-Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3 bg-white dark:bg-forest-900 border border-slate-150 dark:border-forest-850">
          <div className="p-2 bg-amber-50 rounded-xl dark:bg-amber-950/20"><MapPin className="w-5 h-5 text-amber-500" /></div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Sightings Logged</span>
            <span className="text-lg font-black font-outfit text-slate-800 dark:text-slate-100">{observations.length}</span>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 bg-white dark:bg-forest-900 border border-slate-150 dark:border-forest-850">
          <div className="p-2 bg-emerald-50 rounded-xl dark:bg-emerald-950/20"><Compass className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Monitoring Sites</span>
            <span className="text-lg font-black font-outfit text-slate-800 dark:text-slate-100">{sites.length}</span>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 bg-white dark:bg-forest-900 border border-slate-150 dark:border-forest-850">
          <div className="p-2 bg-blue-50 rounded-xl dark:bg-blue-950/20"><Camera className="w-5 h-5 text-blue-600" /></div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Camera Traps</span>
            <span className="text-lg font-black font-outfit text-slate-800 dark:text-slate-100">{cameras.length}</span>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 bg-white dark:bg-forest-900 border border-slate-150 dark:border-forest-850">
          <div className="p-2 bg-purple-50 rounded-xl dark:bg-purple-950/20"><Volume2 className="w-5 h-5 text-purple-600" /></div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Acoustic Sensors</span>
            <span className="text-lg font-black font-outfit text-slate-800 dark:text-slate-100">{sensors.length}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spatial Map Display */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between bg-slate-50 dark:bg-slate-900/50 min-h-[420px] shadow-sm relative border border-slate-200 dark:border-forest-850">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-forest-850 pb-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 font-outfit">
              <LayoutGrid className="w-5 h-5 text-emerald-600" />
              Live Biological Density Grid Overlay
            </h3>
            <span className="text-[9px] text-slate-455 font-mono flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> GPS FEED ACTIVE
            </span>
          </div>
          
          <div className="w-full h-96 border rounded-2xl relative overflow-hidden bg-emerald-950/10 dark:bg-emerald-950/25 border-emerald-500/25 flex items-center justify-center shadow-inner">
            
            <div className="animate-scan" />

            {/* Topographical Vector Map Background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60 dark:opacity-30" xmlns="http://www.w3.org/2000/svg">
              <line x1="10%" y1="0" x2="10%" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
              <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
              <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
              <line x1="90%" y1="0" x2="90%" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
              <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
              <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
              <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
              <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
              <path d="M 0,220 C 80,240 120,180 180,210 S 260,310 350,280 S 480,180 600,200" fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
              <path d="M 420,150 C 440,120 490,130 510,160 S 490,220 450,210 S 400,180 420,150 Z" fill="#0284c7" opacity="0.2" />
              <text x="440" y="172" fontSize="7" className="fill-blue-700 font-mono font-bold tracking-wider">Kabini Lake</text>
              <path d="M 80,60 C 110,40 160,40 180,70 S 140,120 100,110 S 60,80 80,60 Z" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="2 4" opacity="0.35" />
              <text x="100" y="78" fontSize="7" className="fill-emerald-700 font-mono font-bold">W. Ghats Ridge</text>
              <path d="M 480,280 C 510,260 550,270 560,290 S 530,340 500,330 S 460,300 480,280 Z" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="2 4" opacity="0.35" />
              <text x="490" y="302" fontSize="7" className="fill-emerald-700 font-mono font-bold">Bandipur Hills</text>
              <text x="4%" y="97%" fontSize="8" className="fill-slate-500 font-mono tracking-widest">N 12.087° / E 76.121°</text>
              <text x="78%" y="4%" fontSize="8" className="fill-slate-500 font-mono tracking-widest">UTM ZONE 43N</text>
              <text x="160" y="365" fontSize="8" className="fill-emerald-800/40 dark:fill-emerald-400/20 font-bold tracking-widest uppercase">Nagarhole Sanctuary Zone</text>
            </svg>

            <div className="absolute inset-3 border border-dashed border-emerald-500/20 rounded pointer-events-none">
              <span className="absolute top-2 left-2 text-[8px] text-emerald-600 dark:text-emerald-500 uppercase font-mono tracking-widest bg-slate-50/90 dark:bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/10 shadow-sm">
                Protected Boundary Zone
              </span>
            </div>
            
            {/* 1. Monitoring Sites Markers (Green) */}
            {showSites && sites.map((s, idx) => (
              <div
                key={`site-${s.id}`}
                onClick={() => handleSelectSite(s)}
                className="absolute cursor-pointer group flex flex-col items-center z-10"
                style={{ left: `${20 + (idx * 22) % 65}%`, top: `${20 + (idx * 18) % 65}%` }}
              >
                <div className="pulse-halo bg-emerald-500" />
                <MapPin className="w-5 h-5 text-emerald-600 fill-emerald-150 relative z-10 hover:scale-125 transition-transform drop-shadow" />
                <div className="absolute top-5 bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  Site: {s.name}
                </div>
              </div>
            ))}

            {/* 2. Camera Traps Markers (Blue) */}
            {showCameras && cameras.map((c, idx) => (
              <div
                key={`cam-${c.id}`}
                className="absolute cursor-pointer group flex flex-col items-center z-10"
                style={{ left: `${15 + (idx * 24) % 65}%`, top: `${45 + (idx * 16) % 45}%` }}
              >
                <div className="pulse-halo bg-blue-500" />
                <Camera className="w-4.5 h-4.5 text-blue-600 p-0.5 bg-blue-50 rounded-full border border-blue-400 relative z-10 hover:scale-125 transition-transform drop-shadow" />
                <div className="absolute top-5 bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  Camera: {c.model} ({c.serial_number})
                </div>
              </div>
            ))}

            {/* 3. Audio Sensors Markers (Purple) */}
            {showSensors && sensors.map((se, idx) => (
              <div
                key={`sens-${se.id}`}
                className="absolute cursor-pointer group flex flex-col items-center z-10"
                style={{ left: `${35 + (idx * 18) % 55}%`, top: `${15 + (idx * 26) % 65}%` }}
              >
                <div className="pulse-halo bg-purple-500" />
                <Volume2 className="w-4.5 h-4.5 text-purple-650 p-0.5 bg-purple-50 rounded-full border border-purple-400 relative z-10 hover:scale-125 transition-transform drop-shadow" />
                <div className="absolute top-5 bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  Audio Sensor: {se.model} ({se.serial_number})
                </div>
              </div>
            ))}

            {/* 4. Sighting Observations Markers (Amber/Red) */}
            {showObs && observations.map((o, idx) => (
              <div
                key={`obs-${o.id}`}
                onClick={() => { setSelectedSite(null); setSelectedObs(o); }}
                className="absolute cursor-pointer group flex flex-col items-center z-20"
                style={{ left: `${25 + (idx * 16) % 65}%`, top: `${30 + (idx * 22) % 60}%` }}
              >
                <div className="pulse-halo bg-amber-500 animate-ping" />
                <MapPin className="w-5.5 h-5.5 text-amber-500 fill-amber-100 relative z-10 hover:scale-125 transition-transform drop-shadow-md" />
                <div className="absolute top-6 bg-amber-600 text-white text-[8px] font-black px-2 py-0.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-amber-400">
                  {o.species} (x{o.count})
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4 text-[10px] text-slate-455 mt-3 justify-center">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Site</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Camera</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-650" /> Sensor</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Sighting</span>
          </div>
        </Card>

        {/* Right Panel: Sighting details, Site details OR Search coordinate logs */}
        <div className="space-y-6">
          {selectedObs ? (
            /* Selected Observation Details Drawer */
            <Card className="p-5 bg-white dark:bg-forest-900 border border-emerald-500/25 shadow-lg space-y-4 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full filter blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b dark:border-forest-850 pb-2.5">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                  <Eye className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Observation Details
                </h3>
                <button 
                  onClick={() => setSelectedObs(null)}
                  className="text-[10px] bg-slate-100 dark:bg-forest-955 px-2 py-1 rounded-lg text-slate-555 font-bold border dark:border-forest-800 hover:text-slate-800"
                >
                  Close
                </button>
              </div>

              {selectedObs.media?.some(m => m.file_type === 'image') && (
                <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-905 border border-slate-100 dark:border-forest-850 relative group">
                  <img 
                    src={getMediaUrl(selectedObs.media.find(m => m.file_type === 'image').file_url)} 
                    alt="Sighting Preview" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur">
                    Captured JPEG
                  </div>
                </div>
              )}

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                  <span className="text-slate-400 font-bold">Target Species:</span>
                  <span className="font-extrabold text-slate-850 dark:text-slate-200">{selectedObs.species}</span>
                </div>
                <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                  <span className="text-slate-400 font-bold">Sighting Count:</span>
                  <span className="font-bold text-slate-850 dark:text-slate-250 bg-slate-100 dark:bg-forest-950 px-2 py-0.5 rounded font-mono">
                    {selectedObs.count} Sighted
                  </span>
                </div>
                <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                  <span className="text-slate-400 font-bold">Monitoring Site:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">
                    {selectedObs.site?.name || sites.find(s => s.id === selectedObs.site_id)?.name || 'Unknown Site'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                  <span className="text-slate-400 font-bold">Timestamp:</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-[10px]">{formatDateTime(selectedObs.observed_at)}</span>
                </div>
                <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                  <span className="text-slate-400 font-bold">GPS Coordinates:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-350">{selectedObs.latitude.toFixed(4)}, {selectedObs.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400 font-bold">AI Processing:</span>
                  {getStatusBadge(selectedObs.ai_status)}
                </div>

                {selectedObs.ai_status !== 'Completed' ? (
                  <Button
                    onClick={() => handleRunAI(selectedObs.id)}
                    disabled={analyzing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 py-2.5 mt-3 shadow-lg rounded-xl"
                  >
                    {analyzing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Running Pipeline...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Run AI Inference</>
                    )}
                  </Button>
                ) : (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                      Diagnostic Terminal Output
                    </div>
                    <div className="p-3 bg-slate-955 text-emerald-400 rounded-xl font-mono text-[10px] space-y-1.5 border border-slate-800 shadow-inner max-h-32 overflow-y-auto leading-relaxed">
                      <div>[SYS INFO] INITIALIZING YOLOV8 CENSUS...</div>
                      {selectedObs.ai_analyses && selectedObs.ai_analyses.length > 0 ? (
                        <>
                          {selectedObs.ai_analyses[selectedObs.ai_analyses.length - 1].image_json?.success && (
                            <div>[YOLOv8] SUCCESS: DETECTED {selectedObs.ai_analyses[selectedObs.ai_analyses.length - 1].image_json.total_detections} ANIMAL PROFILE(S)</div>
                          )}
                          {selectedObs.ai_analyses[selectedObs.ai_analyses.length - 1].audio_json?.success && (
                            <div>[AUDIO] BIOACOUSTIC: MATCHED {selectedObs.ai_analyses[selectedObs.ai_analyses.length - 1].audio_json.top_prediction.common_name} ({selectedObs.ai_analyses[selectedObs.ai_analyses.length - 1].audio_json.top_prediction.confidence}%)</div>
                          )}
                          <div className="text-slate-500">[SYS INFO] COMPLETED INF PIPELINE</div>
                        </>
                      ) : (
                        <div className="text-slate-500">[SYS INFO] RUN COMPLETED: 1 ANIMAL LOGGED</div>
                      )}
                    </div>
                  </div>
                )}

                <Link to={`/observations/${selectedObs.id}`} className="block mt-2">
                  <Button variant="outline" className="w-full py-2 flex items-center justify-center gap-1 rounded-xl">
                    Full Sighting Profile
                  </Button>
                </Link>
              </div>
            </Card>
          ) : selectedSite ? (
            /* Selected Site Details Drawer */
            <Card className="p-5 bg-white dark:bg-forest-900 border border-emerald-500/25 shadow-lg space-y-4 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full filter blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b dark:border-forest-850 pb-2.5">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Monitoring Site GIS Details
                </h3>
                <button 
                  onClick={() => setSelectedSite(null)}
                  className="text-[10px] bg-slate-100 dark:bg-forest-955 px-2 py-1 rounded-lg text-slate-555 font-bold border dark:border-forest-800 hover:text-slate-800"
                >
                  Close
                </button>
              </div>

              {loadingReport ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                    <span className="text-slate-400 font-bold">Site Name:</span>
                    <span className="font-extrabold text-slate-850 dark:text-slate-200">{selectedSite.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                    <span className="text-slate-400 font-bold">Habitat Type:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedSite.habitat_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                    <span className="text-slate-400 font-bold">Coordinates:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-350">{selectedSite.latitude.toFixed(4)}, {selectedSite.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                    <span className="text-slate-400 font-bold">Sighting Logs:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-300">
                      {observations.filter(o => o.site_id === selectedSite.id).length} occurrences
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                    <span className="text-slate-400 font-bold">Species Sighted:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-300">
                      {new Set(observations.filter(o => o.site_id === selectedSite.id).map(o => o.species).filter(Boolean)).size} species
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                    <span className="text-slate-400 font-bold">Habitat Suitability:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-300">
                      {selectedSiteReport?.habitat_suitability_score !== undefined ? `${selectedSiteReport.habitat_suitability_score}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1">
                    <span className="text-slate-400 font-bold">Vegetation Density:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-300">
                      {selectedSiteReport?.vegetation_density !== undefined ? `${selectedSiteReport.vegetation_density}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-slate-400 font-bold">Human Conflict:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-300">{selectedSiteReport?.human_conflict_level || 'N/A'}</span>
                  </div>

                  <Link to={`/sites/${selectedSite.id}`} className="block mt-4">
                    <Button variant="outline" className="w-full py-2 flex items-center justify-center gap-1 rounded-xl">
                      Inspect Site Profile
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            /* Coordinate search logs list */
            <Card className="p-5 space-y-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm rounded-2xl">
              <div className="border-b dark:border-forest-850 pb-2 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-850 dark:text-slate-200 flex items-center gap-1.5 font-outfit text-sm">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  Active Coordinate Logs
                </h3>
                <span className="font-mono text-[9px] text-slate-400 bg-slate-50 dark:bg-forest-950 border px-2 py-0.5 rounded-lg">
                  {coordinateLogs.length} items
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search coordinate indexes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 border rounded-lg text-xs dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <div className="space-y-2 max-h-[295px] overflow-y-auto pr-1">
                {coordinateLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">No matching records found.</p>
                ) : (
                  coordinateLogs.map((log, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        if (log.type === 'Observation') {
                          setSelectedObs(log.data);
                        } else if (log.type === 'Site') {
                          handleSelectSite(log.data);
                        }
                      }}
                      className={`p-3 border rounded-xl transition-all duration-300 flex justify-between items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-forest-955`}
                    >
                      <div className="space-y-0.5 max-w-[70%]">
                        <div className="font-extrabold text-slate-750 dark:text-slate-200 truncate group-hover:text-emerald-600 transition-colors">
                          {log.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{log.detail}</div>
                        <div className="text-[9px] text-slate-500 font-mono">Lat/Lon: {log.coords}</div>
                      </div>
                      <Badge 
                        variant={
                          log.type === 'Site' ? 'success' : 
                          log.type === 'Camera' ? 'info' : 
                          log.type === 'Sensor' ? 'secondary' : 
                          'warning'
                        }
                        className="text-[9px] font-black tracking-wider"
                      >
                        {log.type}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {toastMsg && (
        <Toast
          message={toastMsg.text}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}
    </div>
  );
};

export default MapVisualization;
