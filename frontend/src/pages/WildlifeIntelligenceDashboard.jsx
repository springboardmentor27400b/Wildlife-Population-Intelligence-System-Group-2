import React, { useState, useEffect, useContext } from 'react';
import wildlifeDashboardService from '../services/wildlifeDashboardService';
import { AuthContext } from '../context/AuthContext';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Heart, Globe, Leaf, Activity, TrendingUp, AlertCircle, Clock, CheckCircle, CheckCircle2, 
  Map, Users, Zap, Shield, Eye, Settings, Download, LayoutDashboard,
  PawPrint, MapPin, AlertTriangle, Database, Info, Target, Trees, Microscope
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../index.css';

import PremiumKPICard from '../components/ui/PremiumKPICard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const WildlifeIntelligenceDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [observationData, setObservationData] = useState(null);
  const [populationData, setPopulationData] = useState(null);
  const [biodiversityData, setBiodiversityData] = useState(null);
  const [habitatData, setHabitatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [observationLoading, setObservationLoading] = useState(true);
  const [populationLoading, setPopulationLoading] = useState(true);
  const [biodiversityLoading, setBiodiversityLoading] = useState(true);
  const [habitatLoading, setHabitatLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchData = async () => {
    try {
      const summary = await wildlifeDashboardService.getExecutiveSummary();
      setData(summary);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }

    try {
      const obsIntel = await wildlifeDashboardService.getObservationIntelligence();
      setObservationData(obsIntel);
    } catch (err) {
      console.error("Error fetching observation intelligence", err);
    } finally {
      setObservationLoading(false);
    }

    try {
      const popIntel = await wildlifeDashboardService.getPopulationIntelligence();
      setPopulationData(popIntel);
    } catch (err) {
      console.error("Error fetching population intelligence", err);
    } finally {
      setPopulationLoading(false);
    }

    try {
      const bioIntel = await wildlifeDashboardService.getBiodiversityIntelligence();
      setBiodiversityData(bioIntel);
    } catch (err) {
      console.error("Error fetching biodiversity intelligence", err);
    } finally {
      setBiodiversityLoading(false);
    }

    try {
      const habIntel = await wildlifeDashboardService.getHabitatIntelligence();
      setHabitatData(habIntel);
    } catch (err) {
      console.error("Error fetching habitat intelligence", err);
    } finally {
      setHabitatLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30-second polling
    return () => clearInterval(interval);
  }, []);

  const handleExport = async (format) => {
    try {
      await wildlifeDashboardService.exportReport(format);
    } catch (err) {
      console.error(`Error exporting ${format}`, err);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <SkeletonLoader type="card" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader type="kpi" />
          <SkeletonLoader type="kpi" />
          <SkeletonLoader type="kpi" />
          <SkeletonLoader type="kpi" />
        </div>
        <SkeletonLoader type="chart" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <EmptyState 
          icon={AlertCircle}
          title="Data Unavailable"
          description={error}
          primaryAction={() => fetchData()}
          primaryActionText="Retry"
        />
      </div>
    );
  }

  // Formatting sparkline data from trend if available, else mock
  const generateSparkline = (trend) => {
    return [];
  };

  const healthData = [
    { name: 'Health', value: data?.overall_wildlife_health_score || 0 },
    { name: 'Remainder', value: 100 - (data?.overall_wildlife_health_score || 0) }
  ];

  const formatKPI = (val, isScore = false) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === 'number') {
      const formatted = new Intl.NumberFormat('en-US').format(val);
      return isScore ? `${formatted}/100` : formatted;
    }
    return val;
  };

  return (
    <div className="">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-green-600" />
            Wildlife Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Executive intelligence command center aggregating metrics across population, biodiversity, and ecosystem health.
          </p>
        </div>
        
        {/* Header Controls */}
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => handleExport('pdf')} className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" /> PDF
        </button>
        <button onClick={() => handleExport('excel')} className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Excel
        </button>
      </div>
    </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PremiumKPICard 
          title="Total Observations" 
          value={formatKPI(data?.total_observations)}
          icon={Eye}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50"
        />
        <PremiumKPICard 
          title="Species Monitored" 
          value={formatKPI(data?.species_monitored)}
          icon={PawPrint}
          colorClass="text-teal-500"
          bgClass="bg-teal-50"
        />
        <PremiumKPICard 
          title="Active Monitoring Sites" 
          value={formatKPI(data?.active_monitoring_sites)}
          icon={MapPin}
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
        />
        <PremiumKPICard 
          title="Species at Risk" 
          value={formatKPI(data?.species_at_risk)}
          icon={AlertTriangle}
          colorClass="text-red-500"
          bgClass="bg-red-50"
        />
        <PremiumKPICard 
          title="Population Records" 
          value={formatKPI(data?.population_records)}
          icon={Users}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-50"
        />
        <PremiumKPICard 
          title="Biodiversity Index" 
          value={formatKPI(data?.biodiversity_score, true)}
          icon={Activity}
          colorClass="text-purple-500"
          bgClass="bg-purple-50"
        />
        <PremiumKPICard 
          title="Habitat Health" 
          value={formatKPI(data?.habitat_health, true)}
          icon={Leaf}
          colorClass="text-green-500"
          bgClass="bg-green-50"
        />
        <PremiumKPICard 
          title="Ecosystem Health" 
          value={formatKPI(data?.ecosystem_health, true)}
          icon={Globe}
          colorClass="text-cyan-500"
          bgClass="bg-cyan-50"
        />
      </div>

      {/* SECTION C: OBSERVATION INTELLIGENCE */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Eye className="w-6 h-6 mr-2 text-green-600" />
          Observation Intelligence
        </h2>
        
        {observationLoading ? (
          <SkeletonLoader type="card" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Observation Intelligence Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-indigo-500" />
                  Observation Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Total Observations</span>
                    <span className="font-bold text-gray-900">{observationData?.total_observations || 0}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Unique Species</span>
                    <span className="font-bold text-gray-900">{observationData?.unique_species || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-gray-600">Latest Record</span>
                    <span className="font-bold text-gray-900">
                      {observationData?.latest_observation 
                        ? new Date(observationData.latest_observation).toLocaleDateString() 
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observation Trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Observation Trend
              </h3>
              <div className="flex-1 min-h-[250px]">
                {observationData?.observation_trend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={observationData.observation_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No Trend Data" description="Not enough data points to generate an observation trend." icon={TrendingUp} />
                )}
              </div>
            </div>

            {/* Species Occurrence */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <PawPrint className="w-5 h-5 mr-2 text-amber-500" />
                Species Occurrence (Top 10)
              </h3>
              <div className="flex-1 min-h-[300px]">
                {observationData?.species_occurrence?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={observationData.species_occurrence} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <YAxis type="category" dataKey="species_name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} width={120} />
                      <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                        {
                          observationData.species_occurrence.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No Species Data" description="No species occurrence data available." icon={PawPrint} />
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-teal-500" />
                Recent Activity
              </h3>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {observationData?.recent_activity?.length > 0 ? (
                  observationData.recent_activity.map((activity, index) => (
                    <div key={index} className="p-3 rounded-xl border bg-gray-50 flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-gray-800 text-sm truncate pr-2">{activity.species}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(activity.observation_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{activity.monitoring_site}</span>
                        </div>
                        <span className="truncate font-medium">{activity.verification_status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No Recent Activity" description="No recent observations recorded." icon={Clock} />
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* SECTION D: SPECIES & POPULATION INTELLIGENCE */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Users className="w-6 h-6 mr-2 text-indigo-600" />
          Species & Population Intelligence
        </h2>
        
        {populationLoading ? (
          <SkeletonLoader type="card" />
        ) : !populationData ? (
          <EmptyState title="Data Unavailable" description="Population intelligence data unavailable" icon={AlertCircle} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <PremiumKPICard 
                title="Species Monitored" 
                value={formatKPI(populationData.species_monitored)}
                icon={PawPrint}
                colorClass="text-indigo-500"
                bgClass="bg-indigo-50"
              />
              <PremiumKPICard 
                title="Total Population" 
                value={formatKPI(populationData.total_estimated_population)}
                icon={Users}
                colorClass="text-blue-500"
                bgClass="bg-blue-50"
              />
              <PremiumKPICard 
                title="Latest Estimate" 
                value={populationData.latest_estimate_date ? new Date(populationData.latest_estimate_date).toLocaleDateString() : "N/A"}
                icon={Clock}
                colorClass="text-teal-500"
                bgClass="bg-teal-50"
              />
              <PremiumKPICard 
                title="Species at Risk" 
                value={populationData.species_at_risk?.length || 0}
                icon={AlertTriangle}
                colorClass="text-red-500"
                bgClass="bg-red-50"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Population by Species */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <PawPrint className="w-5 h-5 mr-2 text-indigo-500" />
                  Population by Species (Top 10)
                </h3>
                <div className="flex-1 min-h-[300px]">
                  {populationData.population_by_species?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={populationData.population_by_species} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                        <YAxis type="category" dataKey="species_name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} width={120} />
                        <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="estimated_population" fill="#6366f1" radius={[0, 4, 4, 0]}>
                          {populationData.population_by_species.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState title="No Population Data" description="No population data available." icon={PawPrint} />
                  )}
                </div>
              </div>
              
              {/* Species at Risk */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Species at Risk
                </h3>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  {populationData.species_at_risk?.length > 0 ? (
                    populationData.species_at_risk.map((risk, index) => (
                      <div key={index} className="p-3 rounded-xl border bg-red-50 border-red-100 flex flex-col gap-1">
                        <span className="font-semibold text-gray-800 text-sm truncate">{risk.species_name}</span>
                        <span className="text-xs font-medium text-red-600 uppercase tracking-wider">{risk.conservation_status}</span>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No Risk Data" description="No species at risk data available." icon={Shield} />
                  )}
                </div>
              </div>
            </div>
            
            {/* Population Trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Population Trend
              </h3>
              <div className="flex-1 min-h-[300px]">
                {populationData.population_trend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={populationData.population_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="estimated_population" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPop)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No Trend Data" description="No population trend data available." icon={TrendingUp} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION E: BIODIVERSITY INTELLIGENCE */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-green-600" />
          Biodiversity Intelligence
        </h2>
        
        {biodiversityLoading ? (
          <SkeletonLoader type="card" />
        ) : !biodiversityData ? (
          <EmptyState title="Data Unavailable" description="Biodiversity intelligence data unavailable" icon={AlertCircle} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <PremiumKPICard 
                title="Biodiversity Score" 
                value={biodiversityData.biodiversity_score ?? "N/A"}
                icon={Activity}
                colorClass="text-green-500"
                bgClass="bg-green-50"
              />
              <PremiumKPICard 
                title="Species Diversity" 
                value={biodiversityData.species_diversity ?? "N/A"}
                icon={PawPrint}
                colorClass="text-indigo-500"
                bgClass="bg-indigo-50"
              />
              <PremiumKPICard 
                title="Habitat Health" 
                value={biodiversityData.habitat_health ?? "N/A"}
                icon={Trees}
                colorClass="text-emerald-500"
                bgClass="bg-emerald-50"
              />
              <PremiumKPICard 
                title="Species Conservation" 
                value={biodiversityData.species_conservation ?? "N/A"}
                icon={Shield}
                colorClass="text-amber-500"
                bgClass="bg-amber-50"
              />
              <PremiumKPICard 
                title="Population Stability" 
                value={biodiversityData.population_stability ?? "N/A"}
                icon={TrendingUp}
                colorClass="text-blue-500"
                bgClass="bg-blue-50"
              />
              <PremiumKPICard 
                title="Overall Ecosystem" 
                value={biodiversityData.overall_ecosystem_health ?? "N/A"}
                icon={HeartPulse}
                colorClass="text-red-500"
                bgClass="bg-red-50"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Biodiversity Trend */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Biodiversity Trend
                </h3>
                <div className="flex-1 min-h-[300px]">
                  {biodiversityData.biodiversity_trend?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={biodiversityData.biodiversity_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorBio)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState title="No Trend Data" description="No biodiversity trend data available." icon={TrendingUp} />
                  )}
                </div>
              </div>
              
              {/* Conservation Priorities */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                  Conservation Priorities
                </h3>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[300px]">
                  {biodiversityData.conservation_priorities?.length > 0 ? (
                    biodiversityData.conservation_priorities.map((priority, index) => (
                      <div key={index} className="p-3 rounded-xl border bg-orange-50 border-orange-100 flex flex-col gap-1">
                        <span className="font-semibold text-gray-800 text-sm truncate">{priority.species_name}</span>
                        <span className="text-xs font-medium text-orange-600 uppercase tracking-wider">{priority.conservation_status}</span>
                        <span className="text-xs text-gray-600 truncate">{priority.recommended_action}</span>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No Priority Data" description="No conservation priority data available." icon={Shield} />
                  )}
                </div>
              </div>
            </div>
            
            {/* Weighted Ecosystem Health Model */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <HeartPulse className="w-5 h-5 mr-2 text-red-500" />
                Weighted Ecosystem Health Model
              </h3>
              <div className="space-y-4">
                {biodiversityData.overall_ecosystem_health !== null ? (
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Species Diversity</div>
                      <div className="text-lg font-bold text-gray-800">{biodiversityData.species_diversity ?? "N/A"}</div>
                      <div className="text-xs font-medium text-indigo-500 mt-1">Weight: 30%</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pop. Stability</div>
                      <div className="text-lg font-bold text-gray-800">{biodiversityData.population_stability ?? "N/A"}</div>
                      <div className="text-xs font-medium text-blue-500 mt-1">Weight: 25%</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Habitat Quality</div>
                      <div className="text-lg font-bold text-gray-800">{biodiversityData.habitat_health ?? "N/A"}</div>
                      <div className="text-xs font-medium text-emerald-500 mt-1">Weight: 20%</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Endangered Status</div>
                      <div className="text-lg font-bold text-gray-800">{biodiversityData.species_conservation ?? "N/A"}</div>
                      <div className="text-xs font-medium text-amber-500 mt-1">Weight: 15%</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Env. Conditions</div>
                      <div className="text-lg font-bold text-gray-800">N/A</div>
                      <div className="text-xs font-medium text-gray-500 mt-1">Weight: 10%</div>
                    </div>
                  </div>
                ) : (
                  <EmptyState title="Model Unavailable" description="Insufficient data to calculate weighted ecosystem health." icon={HeartPulse} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION F: HABITAT INTELLIGENCE */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Trees className="w-6 h-6 mr-2 text-emerald-600" />
          Habitat Intelligence
        </h2>
        
        {habitatLoading ? (
          <SkeletonLoader type="card" />
        ) : !habitatData ? (
          <EmptyState title="Data Unavailable" description="Habitat intelligence data unavailable" icon={AlertCircle} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <PremiumKPICard 
                title="Habitat Health" 
                value={habitatData.habitat_health ?? "N/A"}
                icon={Heart}
                colorClass="text-red-500"
                bgClass="bg-red-50"
              />
              <PremiumKPICard 
                title="Habitat Quality" 
                value={habitatData.habitat_quality ?? "N/A"}
                icon={Trees}
                colorClass="text-emerald-500"
                bgClass="bg-emerald-50"
              />
              <PremiumKPICard 
                title="Habitat Types" 
                value={habitatData.habitat_types?.length || "0"}
                icon={Map}
                colorClass="text-blue-500"
                bgClass="bg-blue-50"
              />
              <PremiumKPICard 
                title="Habitat Suitability" 
                value={habitatData.habitat_suitability?.length ? (habitatData.habitat_suitability.reduce((acc, curr) => acc + curr.suitability_score, 0) / habitatData.habitat_suitability.length).toFixed(1) : "N/A"}
                icon={Target}
                colorClass="text-indigo-500"
                bgClass="bg-indigo-50"
              />
              <PremiumKPICard 
                title="Habitat Degradation" 
                value={habitatData.degradation_analysis?.length || "0"}
                icon={AlertTriangle}
                colorClass="text-amber-500"
                bgClass="bg-amber-50"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Habitat Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-emerald-500" />
                  Habitat Distribution
                </h3>
                <div className="flex-1 min-h-[300px]">
                  {habitatData.habitat_distribution?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={habitatData.habitat_distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="habitat_type"
                        >
                          {habitatData.habitat_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState title="No Distribution Data" description="No habitat distribution data available." icon={Map} />
                  )}
                </div>
              </div>

              {/* Map View */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-500" />
                  Habitat Map
                </h3>
                <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden border border-gray-100 relative z-0">
                  {habitatData.monitoring_sites?.length > 0 ? (
                    <MapContainer center={[habitatData.monitoring_sites[0].latitude || 0, habitatData.monitoring_sites[0].longitude || 0]} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                      {habitatData.monitoring_sites.map((site, index) => (
                        site.latitude && site.longitude && (
                          <Marker key={index} position={[site.latitude, site.longitude]}>
                            <Popup>
                              <div className="text-sm">
                                <p className="font-bold text-gray-800">{site.site_name}</p>
                                <p className="text-gray-600">Type: {site.habitat_type}</p>
                                <p className="text-gray-600">Status: {site.status}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )
                      ))}
                    </MapContainer>
                  ) : (
                    <EmptyState title="No Map Data" description="No habitat location data available." icon={MapPin} />
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Habitat Suitability Panel */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-indigo-500" />
                  Habitat Suitability
                </h3>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[300px]">
                  {habitatData.habitat_suitability?.length > 0 ? (
                    habitatData.habitat_suitability.map((suitability, index) => (
                      <div key={index} className="p-3 rounded-xl border bg-indigo-50 border-indigo-100 flex flex-col gap-1">
                        <span className="font-semibold text-gray-800 text-sm truncate">{suitability.location}</span>
                        <span className="text-xs font-medium text-indigo-600 tracking-wider">Habitat: {suitability.habitat}</span>
                        <span className="text-xs text-gray-600 truncate">Score: {suitability.suitability_score}</span>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No Suitability Data" description="No habitat suitability data available." icon={Target} />
                  )}
                </div>
              </div>

              {/* Degradation Panel */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                  Habitat Degradation
                </h3>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[300px]">
                  {habitatData.degradation_analysis?.length > 0 ? (
                    habitatData.degradation_analysis.map((deg, index) => (
                      <div key={index} className="p-3 rounded-xl border bg-amber-50 border-amber-100 flex flex-col gap-1">
                        <span className="font-semibold text-gray-800 text-sm truncate">{deg.habitat}</span>
                        <span className="text-xs font-medium text-amber-600 tracking-wider">Severity: {deg.severity}</span>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No Degradation Data" description="No habitat degradation data available." icon={Trees} />
                  )}
                </div>
              </div>
            </div>

            {/* Environmental Conditions */}
            {habitatData.environmental_conditions !== null && (
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Microscope className="w-5 h-5 mr-2 text-teal-500" />
                    Environmental Conditions
                  </h3>
                  <div className="space-y-4">
                      {/* Render conditions if they exist */}
                  </div>
               </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
        {/* Monthly Trend Area Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col h-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Population Trend Analysis
          </h3>
          <div className="flex-1 min-h-[300px]">
            {data?.monthly_intelligence_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly_intelligence_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} domain={['dataMin - 5', 'dataMax + 5']} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No Trend Data" description="Not enough data points to generate trend analysis." icon={TrendingUp} />
            )}
          </div>
        </div>

        {/* Overall Health Gauge */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Overall Health Gauge
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
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
            <div className="absolute bottom-4 flex flex-col items-center">
              <span className="text-4xl font-extrabold text-gray-900">{data?.overall_wildlife_health_score || 0}</span>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Index Score</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
        {/* Intelligence Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Intelligence Alerts
          </h3>
          <div className="space-y-4">
            {data?.intelligence_alerts?.length > 0 ? data.intelligence_alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-xl border flex items-start ${alert.type === 'Warning' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                {alert.type === 'Warning' ? <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" /> : <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp || Date.now()).toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <EmptyState title="No Alerts" description="All systems and populations are currently operating within normal parameters." icon={Shield} />
            )}
          </div>
        </div>

        {/* Executive Recommendations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-500" />
            Executive Recommendations
          </h3>
          <div className="space-y-4">
            {data?.executive_recommendations?.length > 0 ? data.executive_recommendations.map((rec, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-indigo-100 p-1.5 rounded-full mr-3 flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
              </div>
            )) : (
              <EmptyState title="No Pending Recommendations" description="There are no immediate actions required by executive officers." icon={CheckCircle} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WildlifeIntelligenceDashboard;

