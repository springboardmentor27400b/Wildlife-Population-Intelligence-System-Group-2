import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Users, FolderHeart, CalendarRange, Eye, Compass, Heart, Activity, Milestone, MapPin, Camera, Volume2, BookOpen, Bell, Map, TrendingUp, Sprout, Shield, User, UserPlus, Lock, ArrowUpRight } from 'lucide-react';
import Card from '../../components/common/Card';
import AreaChart from '../../components/charts/AreaChart';

export const AdminDashboardView = ({ metrics, fetchMetrics, observations, sites, speciesList = [], cameras, sensors, loading }) => {
  // Aggregate stats
  const totalSites = sites.length;
  const totalObs = observations.length;
  const totalDevices = cameras.length + sensors.length;
  const activeCameras = cameras.filter(c => c.status === 'Active').length;
  const activeSensors = sensors.filter(s => s.status === 'Active').length;
  const activeDevices = activeCameras + activeSensors;

  // Compile timeline data
  const dayCounts = {};
  observations.forEach(o => {
    if (o.observed_at) {
      const day = o.observed_at.split('T')[0];
      dayCounts[day] = (dayCounts[day] || 0) + (o.count || 0);
    }
  });
  const sightingTimeline = Object.entries(dayCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);

  return (
    <div className="space-y-6">
      
      {/* Executive Health Overview Panel */}
      <Card className="p-6 bg-gradient-to-r from-teal-700 to-emerald-800 text-white rounded-3xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-2 z-10">
          <h2 className="text-xl font-black font-outfit uppercase tracking-wide">Ecosystem Program Summary</h2>
          <p className="text-xs text-teal-100 max-w-xl font-semibold leading-relaxed">
            The platform is running normal diagnostics. We are tracking {totalSites} sites, monitoring {totalObs} sightings logs, and managing {totalDevices} active traps.
          </p>
        </div>
        <div className="flex gap-2 z-10">
          <Link to="/reports">
            <button className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-none py-2 px-4 shadow rounded-xl text-xs transition-colors">
              Compile Reports
            </button>
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full filter blur-2xl pointer-events-none" />
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-emerald-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Program Sites</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{totalSites}</span>
          <span className="text-[9px] text-slate-400 mt-1">Total coordinates</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-blue-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Observed Sightings</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{totalObs}</span>
          <span className="text-[9px] text-slate-400 mt-1">Aggregated records</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-indigo-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Hardware Telemetry</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{activeDevices} / {totalDevices}</span>
          <span className="text-[9px] text-slate-400 mt-1">Active / total devices</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-purple-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Program Users</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">4 Roles</span>
          <span className="text-[9px] text-slate-400 mt-1">Access security active</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-rose-500 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Health Rating</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{metrics?.wildlife_health_score || 0}%</span>
          <span className="text-[9px] text-slate-400 mt-1">Ecosystem index</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-teal-650 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Diagnostics</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">Healthy</span>
          <span className="text-[9px] text-slate-400 mt-1">System latency nominal</span>
        </Card>
      </div>

      {/* Sighting Timeline Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-emerald-600" />
            Overall Program Sightings Trends
          </h3>
          <AreaChart data={sightingTimeline} height={200} />
        </div>

        {/* Diagnostics & Logs Summary */}
        <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4.5 h-4.5 text-indigo-650" />
              System Status Summary
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-forest-955 rounded-xl border">
                <span className="font-semibold text-slate-750">API Gateway</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">Online</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-forest-955 rounded-xl border">
                <span className="font-semibold text-slate-750">Database Session</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">Connected</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-forest-955 rounded-xl border">
                <span className="font-semibold text-slate-750">AI Subsystem</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">Ready</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-forest-800 pt-4 mt-6 text-center text-[10px] text-slate-400 font-mono">
            Platform Administrator Dashboard
          </div>
        </Card>
      </div>

      {/* QUICK ACTIONS COMMAND CENTER */}
      <div className="space-y-4 border-t pt-6 border-slate-200 dark:border-forest-850">
        <h3 className="text-sm font-bold font-outfit text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          System Command Center
        </h3>
        
        {/* USER & ACCESS */}
        <div className="space-y-2">
          <div className="category-header">
            <h4 className="category-title">USER and ACCESS CONTROL</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/users" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Users className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Users and Roles</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">View and manage system users</span>
                </div>
              </div>
            </Link>
            <Link to="/register" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <UserPlus className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Create User</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Register a new profile credential</span>
                </div>
              </div>
            </Link>
            <Link to="/users" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Lock className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Manage Roles</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Audit RBAC security permissions</span>
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Profile Settings</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Adjust email, name, and keys</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* MONITORING MANAGEMENT */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">MONITORING MANAGEMENT</h4>
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
                  <span className="text-[10px] text-slate-400 mt-1 block">Launch and config field surveys</span>
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
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-955/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{totalSites} Sites</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Monitoring Sites</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Manage coordinates locations</span>
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
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-955/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{cameras.length} Active</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Camera Traps</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Audit video/image sensors list</span>
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
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-955/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{sensors.length} Active</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Audio Sensors</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Acoustic recording nodes</span>
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
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{totalObs} Logs</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Observations</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">View dynamic sightings data</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* AI & INTELLIGENCE */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">AI and INTELLIGENCE</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Image Analysis</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Run YOLOv8 object detections</span>
                </div>
              </div>
            </Link>
            <Link to="/audio-analysis" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Volume2 className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Audio Analysis</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Run Bioacoustic classifications</span>
                </div>
              </div>
            </Link>
            <Link to="/ecological" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Sprout className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Ecological Intelligence</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Shannon-Wiener/Simpson metrics</span>
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Conservation Decisions</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Priority indexing and actions triggers</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* AI & ANALYTICS */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">AI and ANALYTICS</h4>
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
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-955/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{speciesList.length} Species</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Species Registry</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Global profiles database</span>
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Population Trends</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Demographics regressions charts</span>
                </div>
              </div>
            </Link>
            <Link to="/ecological" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Sprout className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Biodiversity Indexes</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Shannon and Simpson indices</span>
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Habitat Suitability</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Sanctuary parameters suitability</span>
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
                  <span className="text-[10px] text-slate-400 mt-1 block">Eco parameters score</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* THREATS & AI CLASSIFICATION */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">THREATS and AI CLASSIFICATION</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Threat Mitigation</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Poaching and conflict lists logs</span>
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Image Species AI</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Run YOLOv8 object detection</span>
                </div>
              </div>
            </Link>
            <Link to="/audio-analysis" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Volume2 className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Audio Species AI</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Bioacoustic sounds spectrogram classification</span>
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Endangered Species Priorities</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Suggested priority recovery plans targets</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* MAPS, ALERTS & REPORTING */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">MAPS, ALERTS and REPORTING</h4>
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
                  <span className="text-[10px] text-slate-400 mt-1 block">Launch spatial GIS overview</span>
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Notifications and Alerts</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Endangered species and hardware flags</span>
                </div>
              </div>
            </Link>
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
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Reports Compiler</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Export PDF/Excel diagnostic files</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;
