import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, FileText, Filter, Printer, Loader2, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import wildlifeReportService from '../services/wildlifeReportService';

const REPORT_TYPES = [
  "Wildlife Survey Report",
  "Species Population Report",
  "Biodiversity Report",
  "Habitat Assessment Report",
  "AI Prediction Summary Report",
  "Observation Summary Report"
];

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
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const data = await wildlifeReportService.getPreview(activeFilters);
      setPreviewData(data);
      fetchHistory(); // Refresh history after generating a preview (since it might log it)
    } catch (error) {
      console.error(error);
      toast.error('Failed to load report preview.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await wildlifeReportService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPreview();
    fetchHistory();
  }, [filters.report_type]);

  const handleApplyFilters = () => fetchPreview();

  const doDownload = async (action, setDownloading, name) => {
    setDownloading(true);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      await action(activeFilters);
      toast.success(`${name} exported successfully`);
      fetchHistory();
    } catch (error) {
      toast.error(`Failed to export ${name}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPdf = () => doDownload(wildlifeReportService.exportPdf, setDownloadingPdf, 'PDF');
  const handleExportExcel = () => doDownload(wildlifeReportService.exportExcel, setDownloadingExcel, 'Excel');
  const handleExportJson = () => doDownload(wildlifeReportService.exportJson, setDownloadingJson, 'JSON');
  const handleExportCsv = () => doDownload(wildlifeReportService.exportCsv, setDownloadingCsv, 'CSV');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 text-gray-800 print:space-y-0 print:pb-0">
      
      {/* Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Wildlife Monitoring Reports</h1>
          <p className="text-gray-500 mt-1">
            Generate and export comprehensive reports encompassing field observations and unified AI intelligence.
          </p>
        </div>
      </div>

      {/* Control Panel (Hidden on Print) */}
      <Card className="bg-white shadow-sm border border-gray-200 print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4 border-b pb-4">
            <div className="flex-1 space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Select Report Type</Label>
              <select className="w-full border-2 border-teal-500 rounded-lg px-3 py-2 text-sm font-bold text-teal-900 bg-teal-50"
                      value={filters.report_type} onChange={e => setFilters({...filters, report_type: e.target.value})}>
                {REPORT_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2 flex-wrap">
              <Button onClick={handleExportCsv} disabled={downloadingCsv} variant="outline" className="gap-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
                {downloadingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} CSV
              </Button>
              <Button onClick={handleExportJson} disabled={downloadingJson} variant="outline" className="gap-2 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100">
                {downloadingJson ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} JSON
              </Button>
              <Button onClick={handleExportExcel} disabled={downloadingExcel} variant="outline" className="gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                {downloadingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Excel
              </Button>
              <Button onClick={handleExportPdf} disabled={downloadingPdf} variant="outline" className="gap-2 border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100">
                {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF
              </Button>
              <Button onClick={handlePrint} className="gap-2 bg-gray-900 text-white hover:bg-gray-800">
                <Printer className="w-4 h-4" /> Print
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold">
            <Filter className="w-4 h-4 text-gray-400" /> Report Filters
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Start Date</Label>
              <input type="date" className="w-full border rounded-lg px-3 py-1.5 text-sm" 
                     value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Date</Label>
              <input type="date" className="w-full border rounded-lg px-3 py-1.5 text-sm" 
                     value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Species</Label>
              <input type="text" placeholder="e.g. Tiger" className="w-full border rounded-lg px-3 py-1.5 text-sm" 
                     value={filters.species} onChange={e => setFilters({...filters, species: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Prediction Source</Label>
              <select className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white"
                      value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})}>
                <option value="">All</option>
                <option value="Image">Image</option>
                <option value="Audio">Audio</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Conservation Status</Label>
              <select className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white"
                      value={filters.conservation_status} onChange={e => setFilters({...filters, conservation_status: e.target.value})}>
                <option value="">All</option>
                <option value="Endangered">Endangered</option>
                <option value="Vulnerable">Vulnerable</option>
                <option value="Least Concern">Least Concern</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2 flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card className="bg-white shadow-lg border border-gray-200 min-h-[600px] print:shadow-none print:border-none print:m-0 print:p-0">
        <CardContent className="p-8 md:p-12 print:p-0">
          {loading && !previewData ? (
            <div className="flex flex-col items-center justify-center h-full py-32 text-teal-600">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">Compiling Report Data...</p>
            </div>
          ) : previewData ? (
            <div className="space-y-8 max-w-4xl mx-auto font-serif print:max-w-full">
              
              {/* Report Header */}
              <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
                <BookOpen className="w-12 h-12 mx-auto text-teal-700 mb-4" />
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{previewData.metadata.report_title}</h1>
                <p className="text-gray-500 italic">{previewData.metadata.project_name} | {previewData.metadata.milestone}</p>
                <p className="text-gray-500 text-sm mt-4">Report ID: {previewData.metadata.report_id}</p>
                <p className="text-gray-500 text-sm">Generated on {new Date(previewData.metadata.generated_at).toLocaleString()} by {previewData.metadata.generated_by}</p>
              </div>

              {/* Active Filters */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-150 text-sm print:border-gray-300">
                <h3 className="font-bold text-gray-800 mb-2 uppercase">Active Filters</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                  {Object.entries(previewData.metadata.filters).map(([k, v]) => (
                    <div key={k}><span className="font-semibold capitalize">{k.replace('_', ' ')}:</span> {v}</div>
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">1. Executive Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-center print:border-gray-300">
                    <p className="text-xl font-bold text-teal-900">{previewData.executive_summary.total_observations}</p>
                    <p className="text-xs text-teal-700 uppercase tracking-wide mt-1">Total Obs</p>
                  </div>
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-center print:border-gray-300">
                    <p className="text-xl font-bold text-teal-900">{previewData.executive_summary.verified_observations}</p>
                    <p className="text-xs text-teal-700 uppercase tracking-wide mt-1">Verified Obs</p>
                  </div>
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-center print:border-gray-300">
                    <p className="text-xl font-bold text-teal-900">{previewData.executive_summary.pending_observations}</p>
                    <p className="text-xs text-teal-700 uppercase tracking-wide mt-1">Pending Obs</p>
                  </div>
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-center print:border-gray-300">
                    <p className="text-xl font-bold text-teal-900">{previewData.executive_summary.total_ai_predictions}</p>
                    <p className="text-xs text-teal-700 uppercase tracking-wide mt-1">Total Predictions</p>
                  </div>
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-center print:border-gray-300">
                    <p className="text-xl font-bold text-teal-900">{previewData.executive_summary.total_species}</p>
                    <p className="text-xs text-teal-700 uppercase tracking-wide mt-1">Unique Species</p>
                  </div>
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-center print:border-gray-300">
                    <p className="text-xl font-bold text-teal-900">{previewData.executive_summary.monitoring_sites}</p>
                    <p className="text-xs text-teal-700 uppercase tracking-wide mt-1">Monitoring Sites</p>
                  </div>
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-center print:border-gray-300">
                    <p className="text-xl font-bold text-teal-900">{previewData.executive_summary.average_confidence}%</p>
                    <p className="text-xs text-teal-700 uppercase tracking-wide mt-1">Avg Confidence</p>
                  </div>
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-center print:border-gray-300">
                    <p className="text-xl font-bold text-teal-900">{new Date(previewData.executive_summary.date_generated).toLocaleDateString()}</p>
                    <p className="text-xs text-teal-700 uppercase tracking-wide mt-1">Date</p>
                  </div>
                </div>
              </div>

              {/* Species Conservation Summary */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">2. Species Conservation Summary</h2>
                {previewData.species_statistics.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-8">No species detections found in this period.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-300 print:bg-gray-200">
                          <th className="p-2 font-bold text-gray-800">Species Name</th>
                          <th className="p-2 font-bold text-gray-800">Scientific Name</th>
                          <th className="p-2 font-bold text-gray-800">Source</th>
                          <th className="p-2 font-bold text-gray-800">Conservation Status</th>
                          <th className="p-2 font-bold text-gray-800 text-right">Avg Confidence</th>
                          <th className="p-2 font-bold text-gray-800 text-right">Total Detections</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.species_statistics.map((sp, i) => (
                          <tr key={sp.name} className={`border-b border-gray-100 ${i%2===0?'bg-white':'bg-gray-50'}`}>
                            <td className="p-2 text-gray-800 font-medium">{sp.name}</td>
                            <td className="p-2 text-gray-500 italic">{sp.scientific_name}</td>
                            <td className="p-2 text-gray-800">{sp.prediction_source}</td>
                            <td className="p-2 text-gray-800">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                sp.conservation_status?.toLowerCase().includes('endangered') ? 'bg-red-100 text-red-800' :
                                sp.conservation_status?.toLowerCase().includes('vulnerable') ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}>{sp.conservation_status}</span>
                            </td>
                            <td className="p-2 text-gray-800 text-right">{sp.average_confidence}%</td>
                            <td className="p-2 text-gray-800 text-right font-medium">{sp.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Biodiversity Summary */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">3. Biodiversity Summary</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg print:border-gray-300">
                    <span className="font-semibold text-gray-700">Biodiversity Score</span>
                    <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-900">{previewData.biodiversity_summary.biodiversity_score}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg print:border-gray-300">
                    <span className="font-semibold text-gray-700">Ecosystem Health</span>
                    <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-900">{previewData.biodiversity_summary.ecosystem_health}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg print:border-gray-300">
                    <span className="font-semibold text-gray-700">Species Richness</span>
                    <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-900">{previewData.biodiversity_summary.species_richness}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg print:border-gray-300">
                    <span className="font-semibold text-gray-700">Most Detected</span>
                    <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-900 truncate max-w-[120px]">{previewData.biodiversity_summary.most_detected_species}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg print:border-gray-300">
                    <span className="font-semibold text-gray-700">Least Detected</span>
                    <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-900 truncate max-w-[120px]">{previewData.biodiversity_summary.least_detected_species}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg print:border-gray-300">
                    <span className="font-semibold text-gray-700">Endangered Count</span>
                    <span className="bg-red-50 text-red-700 px-2 py-1 rounded font-bold">{previewData.biodiversity_summary.endangered_species_count}</span>
                  </div>
                </div>
              </div>

              {/* Observation Statistics */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">4. Observation Statistics</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Observations</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-600">Verified</span><span className="font-medium">{previewData.observation_statistics.verified}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Pending</span><span className="font-medium">{previewData.observation_statistics.pending}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">AI Predictions</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-600">Image Predictions</span><span className="font-medium">{previewData.observation_statistics.image_predictions}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Audio Predictions</span><span className="font-medium">{previewData.observation_statistics.audio_predictions}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Quality & Insights */}
              {previewData.insights && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2 mt-8">5. Report Quality & Insights</h2>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="font-bold text-gray-800">Report Completeness Score: <span className="text-teal-600">{previewData.insights.report_quality.completeness_score}%</span></p>
                    <p className="text-sm text-gray-600 mt-1">Data Coverage: {previewData.insights.report_quality.data_coverage}</p>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(previewData.insights.recommendations).map(([category, recs]) => (
                      recs.length > 0 && (
                        <div key={category}>
                          <h4 className="font-bold text-gray-800 capitalize">{category.replace('_', ' ')} Recommendations</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                            {recs.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center text-gray-500 py-32">
              <p>Select parameters and click "Generate Report" to view.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report History */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-gray-500" /> Report History</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500 py-8 italic">No previous reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 font-semibold text-gray-600">Report Name</th>
                    <th className="p-3 font-semibold text-gray-600">Generated Date</th>
                    <th className="p-3 font-semibold text-gray-600">Generated By</th>
                    <th className="p-3 font-semibold text-gray-600">Format</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h._id || i} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{h.report_type}</td>
                      <td className="p-3 text-gray-600">{new Date(h.created_at).toLocaleString()}</td>
                      <td className="p-3 text-gray-600">{h.user_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border">{h.export_format}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WildlifeReportsPage;
