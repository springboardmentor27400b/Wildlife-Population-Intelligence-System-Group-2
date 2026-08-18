import React, { useEffect, useState } from 'react';
import { analyticsAPI, reportsAPI } from '../services/api';
import MathFormula from '../components/MathFormula';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  ShieldCheck,
  Clock,
  RefreshCw,
  AlertCircle,
  Shield,
  Trees,
  Eye,
  DollarSign,
  Award,
  CheckCircle2,
  HelpCircle,
  Download,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

export default function ConservationRecommendations() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await reportsAPI.exportPDF({
        report_type: 'conservation',
        filename: 'conservation_recommendations_report',
        result: data || {}
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Conservation_Recommendations_Report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const userInfo = {
        full_name: user?.full_name || user?.name || user?.email || 'Authenticated User',
        email: user?.email || 'N/A',
        role: user?.role || 'Researcher'
      };

      const blob = await reportsAPI.exportExcel({
        report_type: 'conservation',
        filename: 'conservation_recommendations_report',
        user_info: userInfo,
        result: data || {}
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Conservation_Recommendations_Export_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Failed to export Excel report.');
    } finally {
      setExportingExcel(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsAPI.getConservationRecommendations();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch conservation recommendations:', err);
      setError(err.response?.data?.detail || 'Failed to generate conservation recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-950/60 border border-purple-800/60 text-purple-400 flex items-center gap-1">
              <ShieldCheck size={12} />
              PDF Module 9
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1">
              <Clock size={12} />
              6-Month Filtered Analytics
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mt-1 flex items-center gap-2">
            <span>Conservation Recommendation Engine</span>
            <Compass size={24} className="text-purple-400" />
          </h1>
          <div className="text-xs md:text-sm text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>Data-driven priorities using formula:</span>
            <MathFormula math="\text{Priority Score} = w_1 \cdot \text{IUCN Rarity} + w_2 \cdot (1 - p_i) + w_3 \cdot \text{Threats}" className="text-purple-300 font-semibold text-xs" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-purple-400' : ''} />
            <span>Sync Engine</span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex items-center space-x-2 px-4 py-2.5 bg-purple-800 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {exportingExcel ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            <span>{exportingExcel ? 'Exporting Excel...' : 'Export Excel'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-zinc-400 font-medium text-sm">
            Generating conservation recommendation models...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/30 border border-red-800/50 rounded-2xl text-center space-y-3">
          <div className="p-3 bg-red-900/40 rounded-full inline-block text-red-400">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-zinc-100">Recommendation Engine Warning</h3>
          <p className="text-zinc-400 text-xs max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Retry Recommendation Sync
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Data Window Badge Banner */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-950/60 border border-purple-800/60 rounded-xl text-purple-400">
                <Clock size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-200">
                  Analytical Window: {data?.using_6month_window ? 'Last 6 Months (180 Days)' : 'All Available Historical Data (Automatic Fallback)'}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Analyzed {data?.total_observations_analyzed || 0} active telemetry observations.
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 border border-purple-800/60 text-purple-300">
              Module 9 Active
            </span>
          </div>

          {/* 1. Conservation Priority Rankings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
              <Award size={18} className="text-purple-400" />
              Conservation Priority Rankings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data?.priority_rankings || []).map((rank, idx) => (
                <div key={idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-zinc-100">{rank.species}</span>
                    <span className="font-mono text-purple-400 font-bold">{rank.relative_abundance_pct}%</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Count: <span className="text-zinc-200 font-semibold">{rank.count}</span> individuals
                  </div>
                  <div className="pt-2 border-t border-zinc-800 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {rank.priority_level}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Habitat Restoration Actions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
              <Trees size={18} className="text-emerald-400" />
              Habitat Restoration Actions
            </h3>

            <div className="space-y-3">
              {(data?.restoration_actions || []).map((act, idx) => (
                <div key={idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400">{act.action}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{act.description}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs shrink-0">
                    <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg">
                      Target NDVI: {act.target_ndvi}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-lg font-mono">
                      Current: {act.current_ndvi}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Wildlife Protection & Patrol Strategies */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
              <Shield size={18} className="text-blue-400" />
              Wildlife Protection & Anti-Poaching Strategies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data?.protection_strategies || []).map((strat, idx) => (
                <div key={idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-blue-400">{strat.strategy}</div>
                  <div className="text-xs text-zinc-300">{strat.recommended_frequency}</div>
                  <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                    Focus Area: <span className="text-zinc-400">{strat.focus_area}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Monitoring Optimization & Resource Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monitoring Optimization */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                <Eye size={18} className="text-amber-400" />
                Monitoring Optimization
              </h3>

              <div className="space-y-3">
                {(data?.monitoring_optimization || []).map((opt, idx) => {
                  const cnt = opt.deduplicated_count ?? 0;
                  let dynamicRec = opt.recommendation;
                  
                  // Dynamic suggestion builder based on the event count numbers
                  if (!dynamicRec || dynamicRec.includes("Deploy +2 camera sensors to capture high animal movement")) {
                    if (cnt >= 50) {
                      dynamicRec = `High-density wildlife corridor (${cnt} events). Deploy +3 camera traps & bio-acoustic sensors to capture heavy animal movement.`;
                    } else if (cnt >= 10) {
                      dynamicRec = `Moderate animal movement (${cnt} events). Maintain active sensor grid and schedule routine monthly battery check.`;
                    } else if (cnt >= 2) {
                      dynamicRec = `Low movement recorded (${cnt} events). Consider repositioning +1 camera sensor toward high-traffic perimeter trails.`;
                    } else if (cnt === 1) {
                      dynamicRec = `Sparse detection recorded (${cnt} event). Calibrate AI trigger sensitivity and verify sensor lens orientation.`;
                    } else {
                      dynamicRec = `No active detections logged. Relocate sensor grid to active waterhole or feeding corridor.`;
                    }
                  }

                  return (
                    <div key={idx} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-zinc-200">
                        <span>{opt.site_id}</span>
                        <span className="text-amber-400 font-mono">{cnt} events</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">{dynamicRec}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resource Allocation */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-400" />
                Resource & Budget Allocation
              </h3>

              <div className="space-y-3">
                {(data?.resource_allocations || []).map((res, idx) => (
                  <div key={idx} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-zinc-200">
                      <span>{res.site_id}</span>
                      <span className="text-emerald-400 font-mono font-extrabold">{res.allocated_budget_percentage}% Budget</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">{res.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
