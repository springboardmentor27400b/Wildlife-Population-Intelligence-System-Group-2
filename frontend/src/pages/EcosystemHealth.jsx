import React, { useEffect, useState } from 'react';
import { ecosystemHealthAPI, reportsAPI } from '../services/api';
import MathFormula from '../components/MathFormula';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Heart,
  PieChart,
  TrendingUp,
  Layers,
  ShieldAlert,
  Sun,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Scale,
  Download,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

export default function EcosystemHealth() {
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
        report_type: 'ecosystem_health',
        filename: 'ecosystem_health_report',
        result: data || {}
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Ecosystem_Health_Report_${Date.now()}.pdf`;
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
        report_type: 'ecosystem_health',
        filename: 'ecosystem_health_report',
        user_info: userInfo,
        result: data || {}
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Ecosystem_Health_Export_${Date.now()}.xlsx`;
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

  const fetchHealthScore = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ecosystemHealthAPI.getHealthScore();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch ecosystem health score:', err);
      setError(err.response?.data?.detail || 'Failed to compute ecosystem health score.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthScore();
  }, []);

  const getComponentIcon = (key) => {
    switch (key) {
      case 'species_diversity': return PieChart;
      case 'population_stability': return TrendingUp;
      case 'habitat_quality': return Layers;
      case 'species_conservation': return ShieldAlert;
      case 'environmental_conditions': return Sun;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center gap-1">
              <Heart size={12} />
              Phase 5 Step 1 Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mt-1 flex items-center gap-2">
            <span>Ecosystem Health Scoring Engine</span>
            <Activity size={24} className="text-rose-400" />
          </h1>
          <div className="text-xs md:text-sm text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>Independent ecosystem health scoring driven by PDF weighted formula:</span>
            <MathFormula math="\text{Score} = 0.30(S_d) + 0.25(P_s) + 0.20(H_q) + 0.15(E_s) + 0.10(E_c)" className="text-rose-300 font-semibold" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchHealthScore}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-rose-400' : ''} />
            <span>Sync Health Engine</span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex items-center space-x-2 px-4 py-2.5 bg-rose-800 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {exportingExcel ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            <span>{exportingExcel ? 'Exporting Excel...' : 'Export Excel'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          <p className="text-zinc-400 font-medium text-sm">
            Calculating weighted ecosystem health score components...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/30 border border-red-800/50 rounded-2xl text-center space-y-3">
          <div className="p-3 bg-red-900/40 rounded-full inline-block text-red-400">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-zinc-100">Health Engine Calculation Warning</h3>
          <p className="text-zinc-400 text-xs max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchHealthScore}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Retry Health Computation
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overall Health Score Card */}
          <div className="bg-gradient-to-br from-rose-950/40 via-zinc-900 to-zinc-900 border border-rose-500/40 p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Overall Ecosystem Health Score
                </span>
                <div className="text-4xl md:text-5xl font-black text-rose-300 mt-2">
                  {data?.display_overall_score || 'Not enough data'}
                </div>
                <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
                  <Scale size={14} className="text-rose-400 shrink-0" />
                  <span>Model: {data?.model}</span>
                </p>
              </div>

              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-right">
                <div className="text-xs text-zinc-400 font-medium">Data Health Status</div>
                <div className="text-sm font-bold text-zinc-200 mt-1 flex items-center gap-1.5 justify-end">
                  {data?.has_enough_data ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span className="text-emerald-400">Telemetry Active</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle size={16} className="text-amber-400" />
                      <span className="text-amber-400">Not enough data</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5 Component Scores Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
              <Activity className="text-rose-400" size={18} />
              Weighted Component Health Scores
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {(data?.score_breakdown || []).map((comp) => {
                const IconComponent = getComponentIcon(comp.key);
                return (
                  <div
                    key={comp.key}
                    className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        {comp.name}
                      </span>
                      <div className="p-2 bg-zinc-800 border border-zinc-700 text-rose-400 rounded-xl">
                        <IconComponent size={16} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-2xl font-extrabold text-zinc-100">
                        {comp.display_value}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 pt-2 border-t border-zinc-800/80">
                        <span>Weight: {comp.weight_percentage}%</span>
                        <span className="font-mono text-zinc-400">
                          {comp.weighted_contribution !== null && comp.weighted_contribution !== undefined
                            ? `+${comp.weighted_contribution} pts`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weighted Contribution Breakdown Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 font-semibold text-xs text-zinc-300 uppercase tracking-wider flex justify-between items-center">
              <span>PDF Weighted Ecosystem Scoring Breakdown</span>
              <span className="text-zinc-500 font-mono text-[10px]">Total Weight: 100%</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5">Component Name</th>
                    <th className="p-3.5 text-center">PDF Weight (%)</th>
                    <th className="p-3.5 text-center">Weight Factor</th>
                    <th className="p-3.5 text-right">Raw Score (/100)</th>
                    <th className="p-3.5 text-right">Weighted Contribution</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {(data?.score_breakdown || []).map((comp) => (
                    <tr key={comp.key} className="hover:bg-zinc-800/30 transition">
                      <td className="p-3.5 font-semibold text-zinc-200 flex items-center gap-2">
                        {comp.name}
                      </td>
                      <td className="p-3.5 text-center font-bold text-rose-400">{comp.weight_percentage}%</td>
                      <td className="p-3.5 text-center font-mono text-zinc-400">{comp.weight_factor}</td>
                      <td className="p-3.5 text-right font-mono">
                        {comp.score !== null ? `${comp.score} / 100` : '—'}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-400">
                        {comp.weighted_contribution !== null ? `+${comp.weighted_contribution}` : '—'}
                      </td>
                      <td className="p-3.5 text-center">
                        {comp.available && comp.score !== null ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                            Active Data
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 border border-amber-800/60 text-amber-400">
                            Not enough data
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
