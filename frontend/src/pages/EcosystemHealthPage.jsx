import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, HeartPulse, ShieldCheck, Download, Map, TreePine, 
  Search, RefreshCw, X, Sparkles, TrendingUp, AlertTriangle
} from 'lucide-react';
import ecosystemHealthService from '../services/ecosystemHealthService';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

import PremiumKPICard from '../components/ui/PremiumKPICard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';

export default function EcosystemHealthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    siteName: '',
    species: ''
  });

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;
      if (filters.siteName) params.site_name = filters.siteName;
      if (filters.species) params.species = filters.species;

      const result = await ecosystemHealthService.getSummary(params);
      setData(result);
      setError(null);
    } catch (err) {
      setError("Failed to load ecosystem health data");
      toast.error('Failed to load ecosystem health data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000); // 30s background polling
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleExport = async (type) => {
    setExportMenuOpen(false);
    try {
      toast.loading(`Preparing ${type.toUpperCase()} Export...`, { id: 'export' });
      const params = {};
      Object.keys(filters).forEach(k => { if(filters[k]) params[k] = filters[k]; });

      if (type === 'excel') await ecosystemHealthService.exportExcel(params);
      else if (type === 'csv') await ecosystemHealthService.exportCsv(params);
      else if (type === 'pdf') await ecosystemHealthService.exportPdf(params);
      else if (type === 'json') await ecosystemHealthService.exportJson(params);
      
      toast.success('Export downloaded!', { id: 'export' });
    } catch (error) {
      toast.error('Export failed', { id: 'export' });
    }
  };

  const openSiteDetails = async (siteName) => {
    try {
      toast.loading("Loading site details...", { id: "site_detail" });
      const res = await ecosystemHealthService.getSiteDetail(siteName);
      setSelectedSite(res);
      toast.dismiss("site_detail");
    } catch (e) {
      toast.error("Failed to load details", { id: "site_detail" });
    }
  };

  const generateSparkline = (base) => {
    return [];
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-green-600" />
            Ecosystem Health Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Global ecosystem analytics aggregating Population, Habitat, Biodiversity, and Conservation engines.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchData(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative">
            <button 
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-2">
                <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as Excel</button>
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as CSV</button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as PDF</button>
                <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as JSON</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Site Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search sites..."
              value={filters.siteName}
              onChange={e => setFilters({...filters, siteName: e.target.value})}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm bg-gray-50"
            />
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-6">
          <SkeletonLoader type="card" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <SkeletonLoader type="kpi" />
            <SkeletonLoader type="kpi" />
            <SkeletonLoader type="kpi" />
            <SkeletonLoader type="kpi" />
            <SkeletonLoader type="kpi" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="chart" />
            <SkeletonLoader type="chart" />
            <SkeletonLoader type="chart" />
          </div>
          <SkeletonLoader type="table" />
        </div>
      ) : error && !data ? (
        <EmptyState 
          title="Data Unavailable" 
          description={error} 
          icon={AlertTriangle} 
          primaryAction={() => fetchData(true)}
          primaryActionText="Retry"
        />
      ) : data ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Main Ecosystem KPI */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
             <div>
                <h2 className="text-xl font-medium opacity-90 mb-2">Global Ecosystem Health Score</h2>
                <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold tracking-tight">{data.summary.ecosystem_health}</span>
                    <span className="text-2xl font-medium opacity-80">/ 100</span>
                </div>
                <div className="mt-4 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full w-fit backdrop-blur-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Recovery Progress: {data.summary.recovery_progress}%</span>
                </div>
             </div>
             <div className="w-full md:w-1/2 h-40">
                {data.trends?.health_trends?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.trends.health_trends}>
                          <defs>
                              <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', color: '#333' }} />
                          <Area type="monotone" dataKey="score" stroke="#ffffff" fillOpacity={1} fill="url(#colorHealth)" />
                      </AreaChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center opacity-70">No trend data available</div>}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <PremiumKPICard 
              title="Stability Index" 
              value={`${data.summary.stability_index}`} 
              icon={Activity} 
              trend={1.2}
              sparklineData={generateSparkline(70)}
              colorClass="text-green-600" 
              bgClass="bg-green-50"
              sparklineColor="#2563eb"
            />
            <PremiumKPICard 
              title="Sustainability" 
              value={`${data.summary.sustainability_score}`} 
              icon={TreePine} 
              trend={0.8}
              sparklineData={generateSparkline(80)}
              colorClass="text-green-600" 
              bgClass="bg-green-50"
              sparklineColor="#16a34a"
            />
            <PremiumKPICard 
              title="Biodiversity" 
              value={`${data.summary.biodiversity_score}`} 
              icon={HeartPulse} 
              trend={2.4}
              sparklineData={generateSparkline(60)}
              colorClass="text-purple-600" 
              bgClass="bg-purple-50"
              sparklineColor="#9333ea"
            />
            <PremiumKPICard 
              title="Population Health" 
              value={`${data.summary.population_health}`} 
              icon={Map} 
              trend={-0.5}
              sparklineData={generateSparkline(50)}
              colorClass="text-orange-600" 
              bgClass="bg-orange-50"
              sparklineColor="#ea580c"
            />
            <PremiumKPICard 
              title="Conservation" 
              value={`${data.summary.conservation_effectiveness}`} 
              icon={ShieldCheck} 
              trend={1.8}
              sparklineData={generateSparkline(90)}
              colorClass="text-green-600" 
              bgClass="bg-green-50"
              sparklineColor="#0d9488"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Site Comparison Radar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                Site Ecosystem Comparison
              </h3>
              <div className="h-64">
                {data.distributions?.site_comparison?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.distributions.site_comparison}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="site" tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Ecosystem Health" dataKey="health" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      <Radar name="Biodiversity" dataKey="biodiversity_index" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Comparison Data" description="Insufficient site data." />}
              </div>
            </div>

            {/* Health Components Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Health Components
              </h3>
              <div className="h-64">
                {data.trends?.health_trends?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.trends.health_trends.slice(-5)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Component Data" description="Insufficient data to map components." />}
              </div>
            </div>

            {/* Ecosystem Quality Scatter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Map className="w-5 h-5 mr-2 text-purple-500" />
                Regional Stability
              </h3>
              <div className="h-64">
                {data.detailed_sites?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="category" dataKey="site_name" name="Site" tickLine={false} axisLine={false} tick={{fontSize: 10}} />
                      <YAxis type="number" dataKey="ecosystem_score" name="Score" domain={[0, 100]} tickLine={false} axisLine={false} tick={{fontSize: 10}} />
                      <ZAxis type="number" dataKey="sustainability_rating" range={[100, 500]} name="Sustainability" />
                      <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Scatter data={data.detailed_sites} fill="#8b5cf6" opacity={0.7} />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Regional Data" description="Insufficient site data for regional mapping." />}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Site Ecosystem Status</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-xs font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4">Site Name</th>
                    <th className="px-6 py-4">Primary Biome</th>
                    <th className="px-6 py-4 text-center">Ecosystem Score</th>
                    <th className="px-6 py-4 text-center">Biodiversity Index</th>
                    <th className="px-6 py-4 text-center">Sustainability</th>
                    <th className="px-6 py-4">Stability Level</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.detailed_sites?.map((site, index) => (
                    <tr key={index} className="hover:bg-green-50/50 transition-colors even:bg-gray-50/50 even:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-gray-900">{site.site_name}</td>
                      <td className="px-6 py-4 text-gray-600">{site.primary_biome}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${site.ecosystem_score >= 80 ? 'text-green-600' : site.ecosystem_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {site.ecosystem_score}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">{site.biodiversity_index}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{site.sustainability_rating}/100</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          site.stability_level === 'High' ? 'bg-green-100 text-green-700' :
                          site.stability_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {site.stability_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openSiteDetails(site.site_name)}
                          className="text-primary hover:text-primary/80 font-medium text-sm"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!data.detailed_sites || data.detailed_sites.length === 0) && (
                    <tr>
                      <td colSpan="7" className="p-8">
                        <EmptyState title="No Sites Found" description="No ecosystem data matching your criteria." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Site Detail Modal (keeping original functionality) */}
      <AnimatePresence>
        {selectedSite && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Map className="text-primary" /> {selectedSite.site_name} Ecosystem Profile
                </h2>
                <button onClick={() => setSelectedSite(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Ecosystem Score</p>
                    <p className="font-bold text-2xl text-gray-900">{selectedSite.ecosystem_score}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Biodiversity</p>
                    <p className="font-bold text-2xl text-gray-900">{selectedSite.biodiversity_index}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Stability</p>
                    <p className="font-bold text-lg text-gray-900">{selectedSite.stability_level}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Primary Biome</p>
                    <p className="font-bold text-lg text-gray-900">{selectedSite.primary_biome}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3 border-b pb-2">Key Drivers & Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedSite.key_drivers?.map((driver, i) => (
                      <div key={i} className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-center justify-between">
                         <span className="text-sm font-medium text-gray-800">{driver.driver}</span>
                         <span className="text-sm font-bold text-green-700">{driver.impact}</span>
                      </div>
                    )) || <p className="text-gray-500 text-sm">No specific drivers documented.</p>}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

