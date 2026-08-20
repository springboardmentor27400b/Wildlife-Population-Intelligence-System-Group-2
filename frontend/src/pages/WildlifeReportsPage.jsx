import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, FileText, Filter, Printer, Loader2, BookOpen, Clock, BarChart2, Leaf, Target, Map, ShieldAlert, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import wildlifeReportService from '../services/wildlifeReportService';
import habitatIntelligenceService from '../services/habitatIntelligenceService';
import ecosystemHealthService from '../services/ecosystemHealthService';
import conservationRecommendationService from '../services/conservationRecommendationService';

const REPORT_TYPES = [
  "Wildlife Survey Report",
  "Species Population Report",
  "Biodiversity Report",
  "Habitat Assessment Report",
  "Ecosystem Health Report",
  "Conservation Recommendations Report",
  "AI Prediction Summary Report",
  "Observation Summary Report"
];

// Reusable Premium KPI Card
const PremiumKPICard = ({ title, value, icon: Icon, colorClass, gradientClass }) => (
  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-white group h-full">
    <CardContent className="p-6 relative">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientClass} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`} />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Exportable analytics and field reports for conservation planning.
          </p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass} shadow-inner`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'card') return <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />;
  if (type === 'chart') return <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />;
  if (type === 'preview') return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl mt-8" />
    </div>
  );
  return null;
};

const WildlifeReportsPage = () => {
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    report_type: searchParams.get('report_type') || REPORT_TYPES[0],
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
    species: searchParams.get('species') || '',
    source: searchParams.get('source') || '',
    conservation_status: searchParams.get('conservation_status') || '',
    habitat: searchParams.get('habitat') || ''
  });

  const [previewData, setPreviewData] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [previewError, setPreviewError] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await wildlifeReportService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching report history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    if (searchParams.get('report_type')) {
      handleGenerateReport();
    }
  }, []);

  const getServiceForType = (type) => {
    if (type === 'Habitat Assessment Report') return habitatIntelligenceService;
    if (type === 'Ecosystem Health Report') return ecosystemHealthService;
    if (type === 'Conservation Recommendations Report') return conservationRecommendationService;
    return wildlifeReportService;
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setPreviewError(null);
    setPreviewData(null);
    const type = filters.report_type;
    setPreviewType(type);
    
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      let data;
      
      if (type === 'Habitat Assessment Report') {
        data = await habitatIntelligenceService.getSummary(activeFilters);
      } else if (type === 'Ecosystem Health Report') {
        data = await ecosystemHealthService.getSummary(activeFilters);
      } else if (type === 'Conservation Recommendations Report') {
        data = await conservationRecommendationService.getSummary(activeFilters);
      } else {
        data = await wildlifeReportService.getPreview(activeFilters);
      }
      
      setPreviewData(data);
      fetchHistory();
    } catch (error) {
      console.error(error);
      setPreviewError('Unable to load report preview. The service might be temporarily unavailable.');
      toast.error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setDownloadingFormat(format);
    const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const service = getServiceForType(filters.report_type);
      
      if (format === 'pdf' && service.exportPdf) await service.exportPdf(activeFilters);
      else if (format === 'excel' && service.exportExcel) await service.exportExcel(activeFilters);
      else if (format === 'csv' && service.exportCsv) await service.exportCsv(activeFilters);
      else if (format === 'json' && service.exportJson) await service.exportJson(activeFilters);
      else {
        toast.error(`Format ${format.toUpperCase()} not supported for this report type.`, { id: toastId });
        setDownloadingFormat(null);
        return;
      }
      
      toast.success(`${format.toUpperCase()} export completed!`, { id: toastId });
      fetchHistory();
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()}`, { id: toastId });
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleRegenerate = (historyItem) => {
    setFilters(prev => ({
      ...prev,
      report_type: historyItem.report_type || REPORT_TYPES[0],
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Filters loaded. Click Generate Report to preview.');
  };

  const totalReports = history.length;
  const reportsByDate = history.reduce((acc, h) => {
    const date = new Date(h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const analyticsChartData = Object.entries(reportsByDate).map(([date, count]) => ({ date, count })).slice(-14);

  const habitatReportsCount = history.filter(h => h.report_type === 'Habitat Assessment Report').length;
  const conservationReportsCount = history.filter(h => h.report_type === 'Conservation Recommendations Report').length;
  const ecosystemReportsCount = history.filter(h => h.report_type === 'Ecosystem Health Report').length;

  return (
    <div className="space-y-8 pb-12 text-gray-800 print:space-y-0 print:pb-0 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-green-600" />
            Wildlife Monitoring Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Centralized hub for generating, previewing, and exporting enterprise wildlife intelligence reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
        {loadingHistory ? (
          <>{[1,2,3,4].map(i => <SkeletonLoader key={i} />)}</>
        ) : (
          <>
            <PremiumKPICard title="Total Reports" value={totalReports} icon={FileText} colorClass="text-blue-600" gradientClass="from-blue-500 to-indigo-600" />
            <PremiumKPICard title="Ecosystem Reports" value={ecosystemReportsCount} icon={Leaf} colorClass="text-green-600" gradientClass="from-green-500 to-emerald-600" />
            <PremiumKPICard title="Habitat Reports" value={habitatReportsCount} icon={Map} colorClass="text-amber-600" gradientClass="from-amber-500 to-orange-600" />
            <PremiumKPICard title="Conservation Reports" value={conservationReportsCount} icon={ShieldAlert} colorClass="text-red-600" gradientClass="from-red-500 to-rose-600" />
          </>
        )}
      </div>

      <Card className="bg-white border-0 print:hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6 border-b border-gray-100 pb-6">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Report Type</Label>
              <select className="w-full text-sm font-bold text-teal-900 bg-teal-50/50 h-11 rounded-xl px-4 border border-teal-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-300"
                      value={filters.report_type} onChange={e => setFilters({...filters, report_type: e.target.value})}>
                {REPORT_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <Button onClick={() => handleExport('csv')} disabled={downloadingFormat !== null} variant="outline" className="h-11 rounded-xl gap-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
                {downloadingFormat === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} CSV
              </Button>
              <Button onClick={() => handleExport('json')} disabled={downloadingFormat !== null} variant="outline" className="h-11 rounded-xl gap-2 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100">
                {downloadingFormat === 'json' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} JSON
              </Button>
              <Button onClick={() => handleExport('excel')} disabled={downloadingFormat !== null} variant="outline" className="h-11 rounded-xl gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                {downloadingFormat === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Excel
              </Button>
              <Button onClick={() => handleExport('pdf')} disabled={downloadingFormat !== null} variant="outline" className="h-11 rounded-xl gap-2 border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100">
                {downloadingFormat === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF
              </Button>
              <Button onClick={() => window.print()} className="h-11 rounded-xl gap-2 bg-gray-900 text-white hover:bg-gray-800">
                <Printer className="w-4 h-4" /> Print
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
            <Filter className="w-4 h-4 text-gray-400" /> Configuration Filters
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Start Date</Label>
              <input type="date" className="w-full border text-sm h-11 rounded-xl px-4 border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-300" 
                     value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">End Date</Label>
              <input type="date" className="w-full border text-sm h-11 rounded-xl px-4 border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-300" 
                     value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
            </div>
            <div className="space-y-1 lg:col-span-2">
              <Label className="text-xs text-gray-500">Species</Label>
              <input type="text" placeholder="e.g. Bengal Tiger" className="w-full border text-sm h-11 rounded-xl px-4 border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-300" 
                     value={filters.species} onChange={e => setFilters({...filters, species: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Prediction Source</Label>
              <select className="w-full border text-sm bg-white h-11 rounded-xl px-4 border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-300"
                      value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})}>
                <option value="">All</option>
                <option value="Image">Image</option>
                <option value="Audio">Audio</option>
              </select>
            </div>
            <div className="space-y-1 lg:col-span-2 flex items-end gap-3">
              <Button onClick={handleGenerateReport} disabled={loading} className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BarChart2 className="w-4 h-4 mr-2" />}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 min-h-[400px] print:border-none print:shadow-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-8 md:p-12 print:p-0">
          {loading ? (
            <SkeletonLoader type="preview" />
          ) : previewError ? (
            <div className="text-center py-20 flex flex-col items-center">
               <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
               <p className="text-red-600 font-semibold text-lg">{previewError}</p>
               <Button variant="outline" className="mt-4 gap-2" onClick={handleGenerateReport}><RotateCcw className="w-4 h-4"/> Retry</Button>
            </div>
          ) : previewData ? (
            <div className="space-y-10 max-w-5xl mx-auto print:max-w-full">
              
              <div className="text-center border-b border-gray-200 pb-8">
                <BookOpen className="w-12 h-12 mx-auto text-teal-600 mb-4 opacity-80" />
                <h1 className="text-3xl font-black text-gray-900 mb-2">{previewType}</h1>
                <p className="text-gray-500 font-medium">Wildlife Population Intelligence System</p>
                <p className="text-gray-400 text-sm mt-4">Generated: {new Date().toLocaleString()}</p>
              </div>

              {previewType === 'Ecosystem Health Report' && previewData.data && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">1. Ecosystem Metrics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['health_score', 'biodiversity_index', 'water_quality', 'vegetation_density'].map(key => (
                         <div key={key} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                           <p className="text-2xl font-black text-teal-700">{previewData.data.overall_metrics?.[key] ?? 'N/A'}</p>
                           <p className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider">{key.replace('_', ' ')}</p>
                         </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">2. Top Findings</h2>
                    <ul className="space-y-3">
                      {previewData.data.findings?.map((f, i) => (
                        <li key={i} className="flex gap-3 bg-teal-50/50 p-4 rounded-lg border border-teal-100">
                          <Leaf className="w-5 h-5 text-teal-600 shrink-0" />
                          <span className="text-gray-700">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {previewType === 'Habitat Assessment Report' && previewData.data && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">1. Habitat Condition Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl text-center border">
                        <p className="text-2xl font-black text-amber-600">{previewData.data.total_habitats ?? 'N/A'}</p>
                        <p className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider">Total Habitats</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl text-center border">
                        <p className="text-2xl font-black text-amber-600">{previewData.data.avg_quality_score ?? 'N/A'}</p>
                        <p className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider">Avg Quality Score</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl text-center border">
                        <p className="text-2xl font-black text-amber-600">{previewData.data.critical_habitats ?? 'N/A'}</p>
                        <p className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider">Critical Areas</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {previewType === 'Conservation Recommendations Report' && previewData.data && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">1. Priority Threats</h2>
                    <div className="space-y-3">
                      {previewData.data.threats?.map((threat, i) => (
                        <div key={i} className="flex gap-3 bg-red-50/50 p-4 rounded-lg border border-red-100">
                          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                          <div>
                            <p className="font-bold text-red-900 capitalize">{threat.level} Risk: {threat.name}</p>
                            <p className="text-gray-700 text-sm">{threat.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">2. Proposed Interventions</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {previewData.data.interventions?.map((inv, i) => (
                        <li key={i}>{inv}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!['Habitat Assessment Report', 'Ecosystem Health Report', 'Conservation Recommendations Report'].includes(previewType) && previewData.executive_summary && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">1. Executive Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(previewData.executive_summary).filter(([k]) => k !== 'date_generated').map(([key, val]) => (
                        <div key={key} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                          <p className="text-2xl font-black text-teal-700">{val}</p>
                          <p className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider">{key.replace(/_/g, ' ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {previewData.species_statistics?.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">2. Species Detected</h2>
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="p-3 font-semibold">Species</th>
                              <th className="p-3 font-semibold">Status</th>
                              <th className="p-3 font-semibold text-right">Count</th>
                              <th className="p-3 font-semibold text-right">Avg Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.species_statistics.map((sp, i) => (
                              <tr key={sp.name} className="border-b last:border-0 hover:bg-gray-50/50">
                                <td className="p-3 font-medium">{sp.name} <span className="text-gray-400 italic font-normal text-xs ml-1">({sp.scientific_name})</span></td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    sp.conservation_status?.includes('Endangered') ? 'bg-red-100 text-red-700' :
                                    sp.conservation_status?.includes('Vulnerable') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                  }`}>{sp.conservation_status}</span>
                                </td>
                                <td className="p-3 text-right font-medium">{sp.count}</td>
                                <td className="p-3 text-right">{sp.average_confidence}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {previewData.biodiversity_summary && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">3. Biodiversity Index</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(previewData.biodiversity_summary).map(([k, v]) => (
                          <div key={k} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl">
                            <span className="font-semibold text-gray-600 capitalize text-sm">{k.replace(/_/g, ' ')}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-sm font-bold text-gray-900">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="text-center text-gray-400 py-32 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Report Selected</h3>
              <p className="max-w-md mx-auto">Configure your filters and click "Generate Report" to view a detailed preview before exporting.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        
        <Card className="border-0 bg-white shadow-sm rounded-2xl col-span-1 h-[420px] flex flex-col">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base flex items-center gap-2"><BarChart2 className="w-5 h-5 text-teal-600" /> Report Activity (14 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            {loadingHistory ? <SkeletonLoader type="chart" /> : analyticsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No activity data</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm rounded-2xl col-span-1 lg:col-span-2 h-[420px] flex flex-col overflow-hidden">
          <CardHeader className="border-b border-gray-50 pb-4 shrink-0">
            <CardTitle className="text-base flex items-center gap-2"><Clock className="w-5 h-5 text-teal-600" /> Recent Report History</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto flex-1">
            {loadingHistory ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
                <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                <p>No historical reports found.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 bg-white/95 backdrop-blur z-10 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Report Type</th>
                    <th className="px-6 py-4">Generated Date</th>
                    <th className="px-6 py-4">By User</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.slice(0, 50).map((h, i) => (
                    <tr key={h._id || i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{h.report_type}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(h.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-600">{h.user_name}</td>
                      <td className="px-6 py-4 text-right">
                         <Button variant="ghost" size="sm" onClick={() => handleRegenerate(h)} className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                            Regenerate
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default WildlifeReportsPage;
