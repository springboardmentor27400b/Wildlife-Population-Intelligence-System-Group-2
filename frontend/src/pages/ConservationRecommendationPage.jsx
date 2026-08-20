import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Activity, HeartPulse, ShieldCheck, Download, 
  Search, RefreshCw, AlertTriangle, X, Leaf, Target
} from 'lucide-react';
import conservationRecommendationService from '../services/conservationRecommendationService';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

import PremiumKPICard from '../components/ui/PremiumKPICard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';

export default function ConservationRecommendationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    species: '',
    siteName: '',
    priority: '',
    threatLevel: ''
  });

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;
      if (filters.species) params.species = filters.species;
      if (filters.siteName) params.site_name = filters.siteName;
      if (filters.priority) params.priority = filters.priority;
      if (filters.threatLevel) params.threat_level = filters.threatLevel;

      const result = await conservationRecommendationService.getSummary(params);
      setData(result);
      setError(null);
    } catch (err) {
      setError("Failed to load conservation data");
      toast.error('Failed to load conservation data');
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

      if (type === 'excel') await conservationRecommendationService.exportExcel(params);
      else if (type === 'csv') await conservationRecommendationService.exportCsv(params);
      else if (type === 'pdf') await conservationRecommendationService.exportPdf(params);
      else if (type === 'json') await conservationRecommendationService.exportJson(params);
      
      toast.success('Export downloaded!', { id: 'export' });
    } catch (error) {
      toast.error('Export failed', { id: 'export' });
    }
  };

  const openSpeciesDetails = async (speciesName) => {
    try {
      toast.loading("Loading species details...", { id: "sp_detail" });
      const res = await conservationRecommendationService.getSpeciesDetail(speciesName);
      setSelectedSpecies(res);
      toast.dismiss("sp_detail");
    } catch (e) {
      toast.error("Failed to load details", { id: "sp_detail" });
    }
  };

  const generateSparkline = (base) => {
    return [];
  };

  const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
  const THREAT_COLORS = ['#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Leaf className="w-8 h-8 text-green-600" />
            Conservation Recommendation Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            AI-powered conservation insights, threat assessments, and recovery plans.
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
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Threat Level</label>
          <select 
            value={filters.threatLevel}
            onChange={e => setFilters({...filters, threatLevel: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm bg-gray-50"
          >
            <option value="">All Threats</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
          <select 
            value={filters.priority}
            onChange={e => setFilters({...filters, priority: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm bg-gray-50"
          >
            <option value="">All Priorities</option>
            <option value="90">Critical (&gt;90)</option>
            <option value="70">High (&gt;70)</option>
            <option value="40">Moderate (&gt;40)</option>
          </select>
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <PremiumKPICard 
              title="High Priority Species" 
              value={data.summary.high_priority_species} 
              icon={AlertTriangle} 
              trend={3}
              sparklineData={generateSparkline(20)}
              colorClass="text-orange-600" 
              bgClass="bg-orange-50"
              sparklineColor="#ea580c"
            />
            <PremiumKPICard 
              title="Endangered Species" 
              value={data.summary.endangered_species} 
              icon={ShieldAlert} 
              trend={1.2}
              sparklineData={generateSparkline(10)}
              colorClass="text-red-600" 
              bgClass="bg-red-50"
              sparklineColor="#dc2626"
            />
            <PremiumKPICard 
              title="Critical Habitats" 
              value={data.summary.critical_habitats} 
              icon={Activity} 
              trend={-2.1}
              sparklineData={generateSparkline(30)}
              colorClass="text-purple-600" 
              bgClass="bg-purple-50"
              sparklineColor="#9333ea"
            />
            <PremiumKPICard 
              title="Ecosystem Score" 
              value={`${data.summary.ecosystem_score}/100`} 
              icon={HeartPulse} 
              trend={0.5}
              sparklineData={generateSparkline(70)}
              colorClass="text-green-600" 
              bgClass="bg-green-50"
              sparklineColor="#16a34a"
            />
            <PremiumKPICard 
              title="Recommendations" 
              value={data.summary.total_recommendations} 
              icon={ShieldCheck} 
              trend={5.4}
              sparklineData={generateSparkline(50)}
              colorClass="text-green-600" 
              bgClass="bg-green-50"
              sparklineColor="#2563eb"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Priority Distribution Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-500" />
                Conservation Priority
              </h3>
              <div className="h-64">
                {data.priority_distribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.priority_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="priority"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.priority_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Priority Data" description="Insufficient data to map priorities." />}
              </div>
            </div>

            {/* Threat Distribution Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-red-500" />
                Primary Threat Factors
              </h3>
              <div className="h-64">
                {data.threat_distribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.threat_distribution} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis dataKey="threat" type="category" axisLine={false} tickLine={false} tick={{fill: '#374151', fontSize: 10, fontWeight: 500}} width={80} />
                      <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.threat_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={THREAT_COLORS[index % THREAT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Threats Identified" description="No major threats currently logged." />}
              </div>
            </div>

            {/* Recovery Rate Area Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <HeartPulse className="w-5 h-5 mr-2 text-green-500" />
                Projected Recovery
              </h3>
              <div className="h-64">
                {data.projected_recovery?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.projected_recovery}>
                      <defs>
                        <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Recovery Data" description="Insufficient data for recovery projections." />}
              </div>
            </div>
          </div>

          {/* Detailed Conservation List Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Species Conservation Status</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-xs font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4">Species</th>
                    <th className="px-6 py-4">Threat Level</th>
                    <th className="px-6 py-4">Priority Score</th>
                    <th className="px-6 py-4">Habitat Constraint</th>
                    <th className="px-6 py-4">Recommended Action</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.detailed_recommendations?.map((rec, index) => (
                    <tr key={index} className="hover:bg-green-50/50 transition-colors even:bg-gray-50/50 even:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-gray-900">{rec.species}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          rec.threat_level === 'Critical' ? 'bg-red-100 text-red-700' :
                          rec.threat_level === 'High' ? 'bg-orange-100 text-orange-700' :
                          rec.threat_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {rec.threat_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${rec.priority_score >= 80 ? 'text-red-600' : rec.priority_score >= 50 ? 'text-orange-600' : 'text-green-600'}`}>
                          {rec.priority_score}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={rec.habitat_constraint}>
                        {rec.habitat_constraint}
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-[300px]" title={rec.recommended_action}>
                        {rec.recommended_action}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openSpeciesDetails(rec.species)}
                          className="text-primary hover:text-primary/80 font-medium text-sm"
                        >
                          View Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!data.detailed_recommendations || data.detailed_recommendations.length === 0) && (
                    <tr>
                      <td colSpan="6" className="p-8">
                        <EmptyState title="No Recommendations" description="No species meet the current filter criteria." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Species Detail Modal (Keeping original functionality) */}
      <AnimatePresence>
        {selectedSpecies && (
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
                  <ShieldCheck className="text-primary" /> Conservation Plan: {selectedSpecies.species}
                </h2>
                <button onClick={() => setSelectedSpecies(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Threat Level</p>
                    <p className={`font-bold text-xl ${
                          selectedSpecies.threat_level === 'Critical' ? 'text-red-600' :
                          selectedSpecies.threat_level === 'High' ? 'text-orange-600' : 'text-yellow-600'
                        }`}>{selectedSpecies.threat_level}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Priority Score</p>
                    <p className="font-bold text-xl text-gray-900">{selectedSpecies.priority_score}/100</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Habitat Constraint</p>
                    <p className="font-medium text-gray-900">{selectedSpecies.habitat_constraint || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3 border-b pb-2">Recommended Actions</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700">
                    {selectedSpecies.action_plan?.map((action, i) => (
                      <li key={i} className="leading-relaxed">{action}</li>
                    )) || <li>No specific actions outlined.</li>}
                  </ul>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

