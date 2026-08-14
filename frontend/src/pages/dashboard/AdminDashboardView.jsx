import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Users, FolderHeart, CalendarRange, Eye, Compass, Heart, Activity } from 'lucide-react';
import Card from '../../components/common/Card';
import AreaChart from '../../components/charts/AreaChart';

export const AdminDashboardView = ({ metrics, fetchMetrics, observations, sites, cameras, sensors, loading }) => {
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

        {/* Administration quick action card */}
        <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4.5 h-4.5 text-indigo-650" />
              Administrative Portals
            </h3>
            <div className="space-y-2 text-xs">
              <Link to="/surveys" className="block p-3 rounded-xl bg-slate-50 dark:bg-forest-950 border hover:border-emerald-500 hover:text-emerald-700 transition-colors">
                <span className="font-bold block">Surveys Configuration</span>
                <span className="text-[10px] text-slate-400">Launch, register, and update ecological field surveys.</span>
              </Link>
              <Link to="/reports" className="block p-3 rounded-xl bg-slate-50 dark:bg-forest-955 border hover:border-emerald-500 hover:text-emerald-700 transition-colors">
                <span className="font-bold block">Reports Compiler</span>
                <span className="text-[10px] text-slate-400">Export ecological indexes, populations lists, and PDF templates.</span>
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-forest-800 pt-4 mt-6 text-center text-[10px] text-slate-400 font-mono">
            Platform Security Administrator
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardView;
