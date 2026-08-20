import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Download, Filter, Activity, Camera, Leaf, Globe, CheckCircle2,
  AlertTriangle, Loader2, Target, CalendarDays, FileText, Trees
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import biodiversityAnalyticsService from '../services/biodiversityAnalyticsService';

const COLORS = ['#0d9488', '#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#ea580c', '#4f46e5'];

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <Card className="border border-gray-150 overflow-hidden relative group shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
    <div className={`absolute right-0 top-0 w-24 h-24 -mt-8 -mr-8 rounded-full opacity-10 ${colorClass}`} />
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-gray-900">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-10 shadow-inner`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const BiodiversityAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    species: '',
    source: '',
    conservation_status: '',
    habitat: '',
    category: '',
    site_name: '',
    observer: '',
    confidence_min: '',
    confidence_max: ''
  });
  const [activeFilters, setActiveFilters] = useState({});

  const fetchAnalytics = async (currentFilters) => {
    setLoading(true);
    try {
      const response = await biodiversityAnalyticsService.getSummary(currentFilters);
      setData(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load biodiversity analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(activeFilters);
  }, [activeFilters]);

  const handleApplyFilters = () => {
    // Only pass non-empty filters
    const validFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    setActiveFilters(validFilters);
  };

  const handleClearFilters = () => {
    const cleared = {
      start_date: '', end_date: '', species: '', source: '',
      conservation_status: '', habitat: '', category: '',
      site_name: '', observer: '', confidence_min: '', confidence_max: ''
    };
    setFilters(cleared);
    setActiveFilters({});
  };

  const exportPdf = () => biodiversityAnalyticsService.exportPdf(activeFilters);
  const exportExcel = () => biodiversityAnalyticsService.exportExcel(activeFilters);
  const exportJson = () => biodiversityAnalyticsService.exportJson(activeFilters);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        <h2 className="text-xl font-bold">Compiling Biodiversity Intelligence...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trees className="w-8 h-8 text-green-600" />
            Biodiversity Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Comprehensive insights derived from field observations and multi-modal AI predictions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={exportJson} variant="outline" className="gap-2 bg-white text-green-700 border-green-200 hover:bg-green-50">
            <Download className="w-4 h-4" /> JSON
          </Button>
          <Button onClick={exportExcel} variant="outline" className="gap-2 bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50">
            <FileText className="w-4 h-4" /> Excel
          </Button>
          <Button onClick={exportPdf} className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-md">
            <Download className="w-4 h-4" /> PDF
          </Button>
          <Button onClick={() => window.location.href = `/wildlife-reports?${new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_,v])=>v!=='')))}`} className="gap-2 bg-gray-900 hover:bg-gray-800 text-white shadow-md">
            <FileText className="w-4 h-4" /> Generate Report
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
            <Filter className="w-5 h-5 text-gray-400" /> Filter Analytics
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Start Date</Label>
              <input type="date" className="w-full border text-sm h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/70 transition-all duration-300" 
                     value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Date</Label>
              <input type="date" className="w-full border text-sm h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/70 transition-all duration-300" 
                     value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Species</Label>
              <input type="text" placeholder="e.g. Tiger" className="w-full border text-sm h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/70 transition-all duration-300" 
                     value={filters.species} onChange={e => setFilters({...filters, species: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Prediction Source</Label>
              <select className="w-full border text-sm bg-white h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                      value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})}>
                <option value="">All Sources</option>
                <option value="Image">Image (Vision)</option>
                <option value="Audio">Audio (Bioacoustic)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Conservation Status</Label>
              <select className="w-full border text-sm bg-white h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                      value={filters.conservation_status} onChange={e => setFilters({...filters, conservation_status: e.target.value})}>
                <option value="">All Statuses</option>
                <option value="Endangered">Endangered</option>
                <option value="Vulnerable">Vulnerable</option>
                <option value="Least Concern">Least Concern</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Monitoring Site</Label>
              <input type="text" placeholder="e.g. Core Zone" className="w-full border text-sm h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/70 transition-all duration-300" 
                     value={filters.site_name} onChange={e => setFilters({...filters, site_name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Min Confidence (%)</Label>
              <input type="number" placeholder="0-100" className="w-full border text-sm h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/70 transition-all duration-300" 
                     value={filters.confidence_min} onChange={e => setFilters({...filters, confidence_min: e.target.value})} />
            </div>
            <div className="space-y-1 md:col-span-1 flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="w-full bg-gray-900 hover:bg-gray-800 text-white">Apply</Button>
              <Button onClick={handleClearFilters} variant="outline" className="w-full">Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Executive Summary */}
      {data && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card className="border-gray-150 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-600"/> Executive Summary</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{data.executive_summary}</p>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1 space-y-3">
            {data.alerts && data.alerts.map((alert, idx) => (
              <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200 text-red-800' : 
                alert.type === 'info' ? 'bg-green-50 border-green-200 text-green-800' :
                'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                {alert.type === 'critical' ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <Activity className="w-5 h-5 flex-shrink-0" />}
                <p className="text-sm font-semibold">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Observations" value={data.summary.total_observations} subtitle="Verified field records" icon={Globe} colorClass="bg-green-500 text-green-600" />
          <StatCard title="Total AI Predictions" value={data.summary.total_predictions} subtitle="Unified AI outputs" icon={Target} colorClass="bg-green-500 text-green-600" />
          <StatCard title="Total Species" value={data.summary.total_species} subtitle="Unique species identified" icon={Leaf} colorClass="bg-emerald-500 text-emerald-600" />
          <StatCard title="Avg AI Confidence" value={`${data.summary.average_confidence}%`} subtitle="Overall model certainty" icon={CheckCircle2} colorClass="bg-indigo-500 text-indigo-600" />
          
          <StatCard title="Endangered Detected" value={data.summary.endangered_count} subtitle="Critical conservation hits" icon={AlertTriangle} colorClass="bg-rose-500 text-rose-600" />
          <StatCard title="Biodiversity Health" value={`${data.summary.biodiversity_health_score}/100`} subtitle="Index based score" icon={Activity} colorClass="bg-cyan-500 text-cyan-600" />
          <StatCard title="Ecosystem Health" value={`${data.summary.ecosystem_health_score}/100`} subtitle="Habitat risk inverse" icon={Globe} colorClass="bg-fuchsia-500 text-fuchsia-600" />
          <StatCard title="Active Sites" value={data.summary.active_sites} subtitle="Monitoring locations" icon={Target} colorClass="bg-amber-500 text-amber-600" />
        </div>
      )}

      {/* Charts Section */}
      {data && (
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Top Detected Species (Bar Chart) */}
          <div className="lg:col-span-8">
            <Card className="border-gray-150 h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle>Top Detected Species</CardTitle>
                <CardDescription>Species distribution across all unified AI predictions.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.distributions.species.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Source Distribution (Donut Chart) */}
          <div className="lg:col-span-4">
            <Card className="border-gray-150 h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle>Prediction Source</CardTitle>
                <CardDescription>Image vs Audio.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distributions.source}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.distributions.source.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Image' ? '#0891b2' : '#8b5cf6'} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Temporal Trends & Statistical Forecasts (Area/Line Chart) */}
          <div className="lg:col-span-12">
            <Card className="border-gray-150 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle>Observation Trends & Forecasts</CardTitle>
                <CardDescription>Historical data combined with statistical forecasts (Moving Average) for future estimates.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...data.trends, ...(data.forecasts || [])]}>
                    <defs>
                      <linearGradient id="colorObs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="observations" name="Actual Observations" stroke="#10b981" fillOpacity={1} fill="url(#colorObs)" strokeWidth={3} />
                    <Area type="monotone" strokeDasharray="5 5" dataKey="forecast_observations" name="Statistical Forecast" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorFore)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Species Risk Dashboard (Pie Chart) */}
          <div className="lg:col-span-4">
            <Card className="border-gray-150 h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle>Species Risk Analysis</CardTitle>
                <CardDescription>Conservation risk levels.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distributions.risk_dashboard}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => percent > 0 ? `${name}` : ''}
                    >
                      {data.distributions.risk_dashboard.map((entry, index) => {
                         const color = entry.name === 'Critical' ? '#dc2626' : entry.name === 'High' ? '#ea580c' : entry.name === 'Medium' ? '#eab308' : '#22c55e';
                         return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Conservation Status Distribution (Pie Chart) */}
          <div className="lg:col-span-4">
            <Card className="border-gray-150 h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle>Conservation Status</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distributions.conservation_status}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => percent > 0.05 ? `${name.substring(0,6)}` : ''}
                    >
                      {data.distributions.conservation_status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Taxonomic Category Distribution (Pie Chart) */}
          <div className="lg:col-span-4">
            <Card className="border-gray-150 h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle>Taxonomic Categories</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distributions.category}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => percent > 0.05 ? `${name}` : ''}
                    >
                      {data.distributions.category.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Observation Quality & AI Performance */}
          <div className="lg:col-span-12 grid md:grid-cols-2 gap-8">
            <Card className="border-gray-150 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle>Observation Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm font-semibold text-gray-700">
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <span>Human Field Observations</span>
                     <span className="text-green-600 font-bold">{data.observation_quality.human_coverage}</span>
                   </div>
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <span>AI Model Predictions</span>
                     <span className="text-green-600 font-bold">{data.observation_quality.ai_coverage}</span>
                   </div>
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <span>Verified Observations</span>
                     <span className="text-emerald-600 font-bold">{data.observation_quality.verified}</span>
                   </div>
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <span>Pending Verification</span>
                     <span className="text-amber-600 font-bold">{data.observation_quality.pending}</span>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-150 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle>AI Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm font-semibold text-gray-700">
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <span>Overall Average Confidence</span>
                     <span className="text-indigo-600 font-bold">{data.ai_performance.average_confidence}%</span>
                   </div>
                   <div className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Highest Confidence Identification</span>
                     <div className="flex justify-between items-center">
                       <span className="text-gray-900">{data.ai_performance.highest_confidence_species.name}</span>
                       <span className="text-emerald-600 font-bold">{data.ai_performance.highest_confidence_species.score}%</span>
                     </div>
                   </div>
                   <div className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Lowest Confidence Identification</span>
                     <div className="flex justify-between items-center">
                       <span className="text-gray-900">{data.ai_performance.lowest_confidence_species.name}</span>
                       <span className="text-rose-600 font-bold">{data.ai_performance.lowest_confidence_species.score}%</span>
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default BiodiversityAnalyticsPage;
