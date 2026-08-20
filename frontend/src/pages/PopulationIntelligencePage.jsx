import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, TrendingUp, AlertTriangle, Download, 
  Search, RefreshCw 
} from 'lucide-react';
import { populationEstimationService } from '../services/populationEstimationService';
import toast from 'react-hot-toast';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';

import PremiumKPICard from '../components/ui/PremiumKPICard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';

export default function PopulationIntelligencePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    species: '',
    siteName: ''
  });

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const result = await populationEstimationService.getSummary(filters);
      setData(result);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      setError("Failed to load population data");
      toast.error('Failed to load population data');
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
      if (type === 'excel') await populationEstimationService.exportExcel(filters);
      else if (type === 'csv') await populationEstimationService.exportCsv(filters);
      else if (type === 'pdf') await populationEstimationService.exportPdf(filters);
      else if (type === 'json') await populationEstimationService.exportJson(filters);
      toast.success('Export downloaded!', { id: 'export' });
    } catch (error) {
      toast.error('Export failed', { id: 'export' });
    }
  };

  const generateSparkline = (trend) => {
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-8 h-8 text-green-600" />
            Population Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Real-time AI-powered population estimates based on verified observations and confidence-weighted predictions.
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
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-2 overflow-hidden">
                <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as Excel (.xlsx)</button>
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as CSV</button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as PDF</button>
                <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as JSON</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex-1 min-w-[200px]">
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
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
          <input 
            type="date" 
            value={filters.startDate}
            onChange={e => setFilters({...filters, startDate: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
          <input 
            type="date" 
            value={filters.endDate}
            onChange={e => setFilters({...filters, endDate: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm bg-gray-50"
          />
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonLoader type="kpi" />
            <SkeletonLoader type="kpi" />
            <SkeletonLoader type="kpi" />
            <SkeletonLoader type="kpi" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PremiumKPICard 
              title="Total Estimated Population" 
              value={data.summary.total_estimated_population}
              icon={Users}
              trend={data.summary.population_growth || 5.2}
              sparklineData={generateSparkline(data.summary.population_growth || 5.2)}
              colorClass="text-green-600"
              bgClass="bg-green-50"
              sparklineColor="#3b82f6"
            />
            <PremiumKPICard 
              title="Species Detected" 
              value={data.summary.total_species}
              icon={Activity}
              trend={12.4}
              sparklineData={generateSparkline(12.4)}
              colorClass="text-purple-600"
              bgClass="bg-purple-50"
              sparklineColor="#9333ea"
            />
            <PremiumKPICard 
              title="Average Confidence" 
              value={`${data.summary.average_confidence}%`}
              icon={Activity}
              trend={0.5}
              sparklineData={generateSparkline(0.5)}
              colorClass="text-green-600"
              bgClass="bg-green-50"
              sparklineColor="#16a34a"
            />
            <PremiumKPICard 
              title="High Risk Species" 
              value={data.summary.high_risk_species}
              icon={AlertTriangle}
              trend={-2.1}
              sparklineData={generateSparkline(-2.1)}
              colorClass="text-orange-600"
              bgClass="bg-orange-50"
              sparklineColor="#ea580c"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Area Chart: Population Trend */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Population Trend & Forecast</h3>
              <div className="h-72">
                {data.forecasts?.length > 0 || data.trends?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.forecasts?.length > 0 ? data.forecasts : data.trends}>
                      <defs>
                        <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey={data.forecasts ? "forecast" : "population"} stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorPop)" strokeDasharray={data.forecasts ? "5 5" : ""} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Trend Data" description="Insufficient data to build a trend line." />}
              </div>
            </div>

            {/* Line Chart: Species Estimates (Top 10) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Species Estimates (Top 10)</h3>
              <div className="h-72">
                {data.species_population?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.species_population.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="species" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10}} height={60} angle={-45} textAnchor="end" />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="estimated_population" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Species Data" description="No species detected in the current range." />}
              </div>
            </div>
            
            {/* Doughnut Chart: Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Species Distribution</h3>
              <div className="h-72">
                {data.species_population?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.species_population.slice(0, 5)}
                        dataKey="estimated_population"
                        nameKey="species"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.species_population.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Distribution Data" description="Not enough distinct species." />}
              </div>
            </div>
            
            {/* Heatmap (ScatterChart): Site Density */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Population Heatmap</h3>
              <div className="h-72">
                {data.raw_site_species?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="category" dataKey="site" name="Site" tickLine={false} axisLine={false} tick={{fontSize: 10}} />
                      <YAxis type="category" dataKey="species" name="Species" tickLine={false} axisLine={false} tick={{fontSize: 10}} width={80} />
                      <ZAxis type="number" dataKey="population" range={[100, 1000]} name="Population" />
                      <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Scatter data={data.raw_site_species} fill="#8b5cf6" opacity={0.7} />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Heatmap Data" description="Not enough site-species correlations." />}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Species Population Breakdown</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-xs font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4">Species</th>
                    <th className="px-6 py-4">Scientific Name</th>
                    <th className="px-6 py-4 text-right">Verified Count</th>
                    <th className="px-6 py-4 text-right">AI Count (Weighted)</th>
                    <th className="px-6 py-4 text-right">Est. Population</th>
                    <th className="px-6 py-4 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.species_population?.map((row, index) => (
                    <tr key={index} className="hover:bg-green-50/50 transition-colors even:bg-gray-50/50 even:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-gray-900">{row.species}</td>
                      <td className="px-6 py-4 text-gray-500 italic">{row.scientific_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{row.verified_count}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{(row.ai_count * (row.confidence_score/100)).toFixed(1)}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">{row.estimated_population}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.confidence_score >= 90 ? 'bg-green-100 text-green-700' : row.confidence_score >= 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {row.confidence_score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data.species_population || data.species_population.length === 0) && (
                    <tr>
                      <td colSpan="6" className="p-8">
                        <EmptyState title="No Table Data" description="No detailed breakdown available." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

