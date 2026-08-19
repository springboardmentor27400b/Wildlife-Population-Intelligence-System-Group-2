import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Volume2, MapPin, Compass, Shield, Activity, ListCollapse, Milestone, Eye, BookOpen, Bell, Map, TrendingUp, Heart, Sprout, User, ArrowUpRight } from 'lucide-react';
import Card from '../../components/common/Card';
import { formatDateTime } from '../../utils/formatters';

export const ForestOfficerDashboardView = ({ observations, sites, cameras, sensors, loading }) => {
  const [selectedLayer, setSelectedLayer] = useState('all'); // 'all', 'obs', 'site', 'camera', 'sensor'
  
  // Calculate active devices
  const activeCameras = cameras.filter(c => c.status === 'Active').length;
  const activeSensors = sensors.filter(s => s.status === 'Active').length;
  const totalDevices = cameras.length + sensors.length;
  const activeDevices = activeCameras + activeSensors;
  const offlineDevices = totalDevices - activeDevices;

  // Filter coordinate logs based on layer selection
  const showObs = selectedLayer === 'all' || selectedLayer === 'obs';
  const showSites = selectedLayer === 'all' || selectedLayer === 'site';
  const showCameras = selectedLayer === 'all' || selectedLayer === 'camera';
  const showSensors = selectedLayer === 'all' || selectedLayer === 'sensor';

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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-emerald-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Protected Areas</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{sites.length}</span>
          <span className="text-[9px] text-slate-400 mt-1">Sites in jurisdiction</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-blue-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Wildlife Sightings</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{observations.length}</span>
          <span className="text-[9px] text-slate-400 mt-1">Sighting logs count</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-indigo-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Camera Traps</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{activeCameras} / {cameras.length}</span>
          <span className="text-[9px] text-slate-400 mt-1">Active / total cameras</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-purple-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Audio Sensors</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{activeSensors} / {sensors.length}</span>
          <span className="text-[9px] text-slate-400 mt-1">Active / total sensors</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-rose-500 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Offline Hardware</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{offlineDevices}</span>
          <span className="text-[9px] text-slate-400 mt-1">Awaiting patrol check</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-teal-650 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Patrol Alerts</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{offlineDevices > 0 ? 'Urgent' : 'Nominal'}</span>
          <span className="text-[9px] text-slate-400 mt-1">Field operations status</span>
        </Card>
      </div>

      {/* Main Map + Sighting Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Panel Card */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between bg-slate-50 dark:bg-slate-900/50 min-h-[420px] shadow-sm relative border border-slate-200 dark:border-forest-850">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-2 gap-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 font-outfit">
              <Compass className="w-5 h-5 text-emerald-600" />
              GIS Tactical Map Overview
            </h3>
            {/* Layer Control selectors */}
            <div className="flex flex-wrap gap-1 text-[9px]">
              <button onClick={() => setSelectedLayer('all')} className={`px-2 py-1 rounded border font-bold ${selectedLayer === 'all' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 dark:bg-forest-900 dark:border-forest-800 dark:text-slate-300'}`}>All</button>
              <button onClick={() => setSelectedLayer('obs')} className={`px-2 py-1 rounded border font-bold ${selectedLayer === 'obs' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-600 dark:bg-forest-900 dark:border-forest-800 dark:text-slate-300'}`}>Sightings</button>
              <button onClick={() => setSelectedLayer('site')} className={`px-2 py-1 rounded border font-bold ${selectedLayer === 'site' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 dark:bg-forest-900 dark:border-forest-800 dark:text-slate-300'}`}>Sites</button>
              <button onClick={() => setSelectedLayer('camera')} className={`px-2 py-1 rounded border font-bold ${selectedLayer === 'camera' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 dark:bg-forest-900 dark:border-forest-800 dark:text-slate-300'}`}>Cameras</button>
              <button onClick={() => setSelectedLayer('sensor')} className={`px-2 py-1 rounded border font-bold ${selectedLayer === 'sensor' ? 'bg-purple-655 border-purple-655 text-white' : 'bg-white border-slate-200 text-slate-600 dark:bg-forest-900 dark:border-forest-800 dark:text-slate-300'}`}>Sensors</button>
            </div>
          </div>
          
          <div className="w-full h-80 border rounded-2xl relative overflow-hidden bg-emerald-950/10 dark:bg-emerald-950/25 border-emerald-500/25 flex items-center justify-center shadow-inner">
            <div className="animate-scan" />
            
            {/* Topographical vector map svg */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60 dark:opacity-30" xmlns="http://www.w3.org/2000/svg">
              <line x1="10%" y1="0" x2="10%" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.2" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.2" />
              <line x1="90%" y1="0" x2="90%" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.2" />
              <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.2" />
              <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.2" />
              <path d="M 0,180 C 100,200 150,150 200,190 S 280,290 400,240" fill="none" stroke="#0284c7" strokeWidth="2.5" opacity="0.3" />
              <text x="4%" y="95%" fontSize="7" className="fill-slate-500 font-mono">N 12.087° / E 76.121°</text>
            </svg>

            {/* Sites Markers */}
            {showSites && sites.map((s, idx) => (
              <div key={`site-${s.id}`} className="absolute cursor-pointer flex flex-col items-center" style={{ left: `${25 + (idx * 20) % 60}%`, top: `${25 + (idx * 15) % 60}%` }}>
                <div className="pulse-halo bg-emerald-500" />
                <MapPin className="w-4 h-4 text-emerald-600 fill-emerald-100 relative z-10 hover:scale-125 transition-transform" />
              </div>
            ))}

            {/* Cameras Markers */}
            {showCameras && cameras.map((c, idx) => (
              <div key={`cam-${c.id}`} className="absolute cursor-pointer flex flex-col items-center" style={{ left: `${20 + (idx * 25) % 60}%`, top: `${50 + (idx * 12) % 40}%` }}>
                <div className="pulse-halo bg-blue-500" />
                <Camera className="w-3.5 h-3.5 text-blue-600 bg-blue-50 p-0.5 rounded-full border border-blue-400 relative z-10 hover:scale-125 transition-transform" />
              </div>
            ))}

            {/* Sensors Markers */}
            {showSensors && sensors.map((se, idx) => (
              <div key={`sens-${se.id}`} className="absolute cursor-pointer flex flex-col items-center" style={{ left: `${40 + (idx * 15) % 50}%`, top: `${20 + (idx * 22) % 60}%` }}>
                <div className="pulse-halo bg-purple-500" />
                <Volume2 className="w-3.5 h-3.5 text-purple-650 bg-purple-50 p-0.5 rounded-full border border-purple-400 relative z-10 hover:scale-125 transition-transform" />
              </div>
            ))}

            {/* Sightings Markers */}
            {showObs && observations.map((o, idx) => (
              <div key={`obs-${o.id}`} className="absolute cursor-pointer flex flex-col items-center" style={{ left: `${30 + (idx * 15) % 60}%`, top: `${35 + (idx * 20) % 55}%` }}>
                <div className="pulse-halo bg-amber-500" />
                <MapPin className="w-4.5 h-4.5 text-amber-500 fill-amber-100 relative z-10 hover:scale-125 transition-transform" />
              </div>
            ))}
          </div>
          
          <div className="flex gap-4 text-[9px] text-slate-455 justify-center mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Sites ({sites.length})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> Cameras ({cameras.length})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600" /> Sensors ({sensors.length})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Sightings ({observations.length})</span>
          </div>
        </Card>

        {/* Telemetry Diagnostics Summary */}
        <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <Shield className="w-4.5 h-4.5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 font-outfit text-xs uppercase tracking-wider">
                Telemetry Diagnostics
              </h3>
            </div>
            
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-forest-955 rounded-xl border">
                <span className="font-semibold text-slate-750">Active Hardware</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-805">{activeDevices} / {totalDevices}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-forest-955 rounded-xl border">
                <span className="font-semibold text-slate-750">Patrol Status</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${offlineDevices > 0 ? 'bg-rose-100 text-rose-805 animate-pulse' : 'bg-emerald-100 text-emerald-805'}`}>
                  {offlineDevices > 0 ? `${offlineDevices} Inactive` : 'Nominal'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t mt-4 text-center text-[10px] text-slate-400 font-mono">
            Forest Department Jurisdiction Port
          </div>
        </Card>
      </div>

      {/* QUICK ACTIONS COMMAND CENTER */}
      <div className="space-y-4 border-t pt-6 border-slate-200 dark:border-forest-850">
        <h3 className="text-sm font-bold font-outfit text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Forest Operations Command Center
        </h3>
               {/* FIELD OPERATIONS */}
        <div className="space-y-2">
          <div className="category-header">
            <h4 className="category-title">FIELD OPERATIONS</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link to="/surveys" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Milestone className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Surveys</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Inspect territorial patrols surveys</span>
                </div>
              </div>
            </Link>
            <Link to="/monitoring-sites" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <MapPin className="premium-icon" />
                  </div>
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{sites.length} Sites</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Monitoring Sites</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Manage sanctuary coordinates</span>
                </div>
              </div>
            </Link>
            <Link to="/camera-traps" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Camera className="premium-icon" />
                  </div>
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{cameras.length} Online</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Camera Traps</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Patrol hardware equipment status</span>
                </div>
              </div>
            </Link>
            <Link to="/audio-sensors" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Volume2 className="premium-icon" />
                  </div>
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{sensors.length} Online</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Audio Sensors</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Verify dynamic sound equipment</span>
                </div>
              </div>
            </Link>
            <Link to="/observations" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Eye className="premium-icon" />
                  </div>
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{observations.length} Logs</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Observations</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">View dynamic field sightings logs</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* SPATIAL MONITORING */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">SPATIAL MONITORING</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/map" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Map className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">GIS Tactical Map</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Full territorial command mapping</span>
                </div>
              </div>
            </Link>
            <Link to="/monitoring-sites" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <MapPin className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Protected Areas</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Sanctuary parameters detail zones</span>
                </div>
              </div>
            </Link>
            <Link to="/map" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Compass className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Wildlife Movement</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">GIS trajectory maps and overlays</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* WILDLIFE INTELLIGENCE */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">WILDLIFE INTELLIGENCE</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link to="/species" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Eye className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Species Info</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Global profiles taxonomy</span>
                </div>
              </div>
            </Link>
            <Link to="/research-trends" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <TrendingUp className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Population Intelligence</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Inspect demographics stats</span>
                </div>
              </div>
            </Link>
            <Link to="/habitat" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Compass className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Habitat Intelligence</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Eco parameters analytics</span>
                </div>
              </div>
            </Link>
            <Link to="/ecosystem-health" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Heart className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Wildlife Health</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Ecosystem health parameters</span>
                </div>
              </div>
            </Link>
            <Link to="/species-recognition" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Camera className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">AI Image Analysis</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Species classification portal</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* THREATS & CONSERVATION */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">THREATS and CONSERVATION</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/conservation" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Shield className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Endangered Species</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Threat profiles details lists</span>
                </div>
              </div>
            </Link>
            <Link to="/notifications" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Bell className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Threat Alerts</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Hardware status and endangered notifications</span>
                </div>
              </div>
            </Link>
            <Link to="/conservation" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Shield className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Conservation Priorities</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Suggested recovery targets guidelines</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* REPORTING */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">REPORTING and PROFILE</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/reports" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <BookOpen className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Reports Console</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Compile biological PDF and Excel sheets</span>
                </div>
              </div>
            </Link>
            <Link to="/profile" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <User className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">My Profile</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Adjust login keys and settings details</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForestOfficerDashboardView;
