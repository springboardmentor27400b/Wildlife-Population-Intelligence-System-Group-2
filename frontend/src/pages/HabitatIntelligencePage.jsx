import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, TrendingUp, AlertTriangle, Download, 
  Search, RefreshCw, MapPin, Activity, ShieldAlert, X, Target
, Trees} from 'lucide-react';
import habitatIntelligenceService from '../services/habitatIntelligenceService';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

import PremiumKPICard from '../components/ui/PremiumKPICard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';

export default function HabitatIntelligencePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    species: '',
    siteName: '',
    minQuality: '',
    riskLevel: ''
  });

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;
      if (filters.species) params.species = filters.species;
      if (filters.siteName) params.site_name = filters.siteName;
      if (filters.minQuality) params.min_quality = filters.minQuality;
      if (filters.riskLevel) params.risk_level = filters.riskLevel;

      const result = await habitatIntelligenceService.getSummary(params);
      setData(result);
      setError(null);
    } catch (err) {
      setError("Failed to load habitat data");
      toast.error('Failed to load habitat data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleExport = async (type) => {
    setExportMenuOpen(false);
    try {
      toast.loading(`Preparing ${type.toUpperCase()} Export...`, { id: 'export' });
      const params = {};
      // mapping filters...
      Object.keys(filters).forEach(k => { if(filters[k]) params[k] = filters[k]; });
      
      if (type === 'excel') await habitatIntelligenceService.exportExcel(params);
      else if (type === 'csv') await habitatIntelligenceService.exportCsv(params);
      else if (type === 'pdf') await habitatIntelligenceService.exportPdf(params);
      else if (type === 'json') await habitatIntelligenceService.exportJson(params);
      
      toast.success('Export downloaded!', { id: 'export' });
    } catch (error) {
      toast.error('Export failed', { id: 'export' });
    }
  };

  const openSiteDetails = async (siteName) => {
    try {
      toast.loading("Loading site details...", { id: "site_detail" });
      const res = await habitatIntelligenceService.getSiteDetail(siteName);
      if (res.error) throw new Error(res.error);
      setSelectedSite(res);
      toast.dismiss("site_detail");
    } catch (e) {
      toast.error("Failed to load details", { id: "site_detail" });
    }
  };

  const generateSparkline = (base) => {
    return [];
  };

  const qualityData = [
    { name: 'Quality', value: data?.summary?.habitat_quality || 0 },
    { name: 'Remainder', value: 100 - (data?.summary?.habitat_quality || 0) }
  ];

  // Map site habitats for Radar
  const radarData = data?.site_habitats?.slice(0, 5).map(site => ({
    subject: site.site_name,
    A: site.habitat_quality,
    B: site.habitat_health,
    fullMark: 100,
  })) || [];

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Trees className="w-8 h-8 text-green-600" />
            Habitat Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            AI-driven geospatial analysis of habitat health, degradation, and conservation suitability.
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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Species</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search species..."
              value={filters.species}
              onChange={e => setFilters({...filters, species: e.target.value})}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm bg-gray-50"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Site Name</label>
          <input 
            type="text" 
            placeholder="Filter by site..."
            value={filters.siteName}
            onChange={e => setFilters({...filters, siteName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Risk Level</label>
          <select 
            value={filters.riskLevel}
            onChange={e => setFilters({...filters, riskLevel: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm bg-gray-50"
          >
            <option value="">All Risks</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <SkeletonLoader type="kpi" />
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
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <PremiumKPICard 
              title="Quality" 
              value={`${data.summary.habitat_quality}/100`} 
              icon={Leaf} 
              trend={1.2}
              sparklineData={generateSparkline(70)}
              colorClass="text-green-600"
              bgClass="bg-green-50"
              sparklineColor="#16a34a"
            />
            <PremiumKPICard 
              title="Suitability" 
              value={`${data.summary.habitat_suitability}/100`} 
              icon={Activity} 
              trend={0.8}
              sparklineData={generateSparkline(60)}
              colorClass="text-green-600"
              bgClass="bg-green-50"
              sparklineColor="#2563eb"
            />
            <PremiumKPICard 
              title="Health" 
              value={`${data.summary.habitat_health}/100`} 
              icon={TrendingUp} 
              trend={2.4}
              sparklineData={generateSparkline(80)}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
              sparklineColor="#10b981"
            />
            <PremiumKPICard 
              title="Biodiversity" 
              value={data.summary.biodiversity_index} 
              icon={MapPin} 
              trend={0.1}
              sparklineData={generateSparkline(40)}
              colorClass="text-purple-600"
              bgClass="bg-purple-50"
              sparklineColor="#9333ea"
            />
            <PremiumKPICard 
              title="Healthy" 
              value={data.summary.healthy_habitats} 
              icon={Leaf} 
              trend={1}
              sparklineData={generateSparkline(20)}
              colorClass="text-green-600"
              bgClass="bg-green-50"
              sparklineColor="#0d9488"
            />
            <PremiumKPICard 
              title="Critical" 
              value={data.summary.critical_habitats} 
              icon={ShieldAlert} 
              trend={-1}
              sparklineData={generateSparkline(10)}
              colorClass="text-red-600"
              bgClass="bg-red-50"
              sparklineColor="#dc2626"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Habitat Quality Gauge */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Habitat Quality Gauge
              </h3>
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="h-56 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={qualityData}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#22c55e" />
                        <Cell fill="#f3f4f6" />
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute bottom-6 flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-gray-900">{data?.summary?.habitat_quality || 0}</span>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Quality Score</span>
                </div>
              </div>
            </div>

            {/* Habitat Health Radar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Site Health Radar
              </h3>
              <div className="h-64 flex-1">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{fill: '#6b7280', fontSize: 10}} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Quality" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4} />
                      <Radar name="Health" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Radar Data" description="Not enough site data." />}
              </div>
            </div>

            {/* Site Comparison Bar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                Site Suitability
              </h3>
              <div className="h-64 flex-1">
                {data.site_habitats?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.site_habitats.slice(0, 5)} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis type="number" axisLine={false} tickLine={false} domain={[0, 100]} tick={{fontSize: 10}} />
                      <YAxis dataKey="site_name" type="category" axisLine={false} tickLine={false} tick={{fill: '#374151', fontSize: 10, fontWeight: 500}} width={80} />
                      <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="habitat_suitability" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Comparison Data" description="Not enough site data to compare." />}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Habitat Intelligence by Site</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-xs font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4">Site Name</th>
                    <th className="px-6 py-4">Species Monitored</th>
                    <th className="px-6 py-4 text-center">Quality Score</th>
                    <th className="px-6 py-4 text-center">Suitability</th>
                    <th className="px-6 py-4 text-center">Health</th>
                    <th className="px-6 py-4">Risk Level</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.site_habitats?.map((site, index) => (
                    <tr key={index} className="hover:bg-green-50/50 transition-colors even:bg-gray-50/50 even:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-gray-900">{site.site_name}</td>
                      <td className="px-6 py-4 text-gray-600">{site.species_monitored.join(', ') || 'None'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${site.habitat_quality >= 80 ? 'text-green-600' : site.habitat_quality >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {site.habitat_quality}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">{site.habitat_suitability}/100</td>
                      <td className="px-6 py-4 text-center text-gray-700">{site.habitat_health}/100</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          site.risk_level === 'Low' ? 'bg-green-100 text-green-700' :
                          site.risk_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {site.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openSiteDetails(site.site_name)}
                          className="text-primary hover:text-primary/80 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!data.site_habitats || data.site_habitats.length === 0) && (
                    <tr>
                      <td colSpan="7" className="p-8">
                        <EmptyState title="No Sites" description="No habitats found matching your criteria." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Site Detail Modal (keeping the original functionality intact) */}
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
                  <MapPin className="text-primary" /> {selectedSite.site_name}
                </h2>
                <button onClick={() => setSelectedSite(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Species Present</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {selectedSite.species_data?.map((sp, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="font-semibold text-gray-900">{sp.species}</p>
                      <p className="text-sm text-gray-500 mb-2">{sp.scientific_name}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sightings:</span>
                        <span className="font-medium text-gray-900">{sp.total_sightings}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Avg Confidence:</span>
                        <span className="font-medium text-green-600">{sp.average_confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

