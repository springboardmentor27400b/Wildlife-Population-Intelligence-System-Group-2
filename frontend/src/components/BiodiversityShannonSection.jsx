import React, { useEffect, useState, useMemo } from 'react';
import { analyticsAPI } from '../services/api';
import MathFormula from './MathFormula';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  Sparkles,
  Award,
  PieChart,
  Activity,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Info,
  ShieldCheck
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BiodiversityShannonSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShannonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsAPI.getShannonIndex();
      setData(res);
    } catch (err) {
      console.error('Failed to load Shannon Diversity Index:', err);
      setError(err.response?.data?.detail || 'Failed to compute Shannon Diversity Index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShannonData();
  }, []);

  // Prepare Relative Abundance Bar Chart Data
  const abundanceChartData = useMemo(() => ({
    labels: (data?.relative_abundance || []).map((s) => s.species),
    datasets: [
      {
        label: 'Species Abundance Proportion (p_i %)',
        data: (data?.relative_abundance || []).map((s) => s.percentage),
        backgroundColor: 'rgba(52, 211, 153, 0.75)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }), [data]);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <span>Phase 4 Step 2: Shannon Diversity Index</span>
                <MathFormula math="H'" />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                  Live Mathematical Model
                </span>
              </h2>
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Ecosystem species diversity computed using</span>
                <MathFormula math="H' = -\sum_{i=1}^{S} (p_i \cdot \ln p_i)" />
                <span>from real deduplicated telemetry.</span>
              </div>
            </div>
          </div>

          <button
            onClick={fetchShannonData}
            disabled={loading}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Recalculate Shannon Index
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
          <RefreshCw className="animate-spin text-emerald-500 mr-3" size={20} />
          <span className="flex items-center gap-2">
            Computing Shannon Diversity Index <MathFormula math="H' = -\sum p_i \ln p_i" />...
          </span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchShannonData} className="ml-auto text-xs underline hover:text-red-200">Retry</button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Biodiversity Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Shannon Index H' */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/40 p-5 rounded-xl relative overflow-hidden">
              <div className="flex justify-between items-center text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span>Shannon Index</span>
                  <MathFormula math="H'" />
                </span>
                <Award size={18} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-300">
                {data?.shannon_index ?? '0.000'}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck size={12} />
                {data?.diversity_status || 'Calculated'}
              </div>
            </div>

            {/* Card 2: Species Richness S */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="flex justify-between items-center text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span>Species Richness</span>
                  <MathFormula math="S" />
                </span>
                <PieChart size={18} className="text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {data?.species_richness ?? 0}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Distinct taxonomic species</div>
            </div>

            {/* Card 3: Pielou's Evenness J' */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="flex justify-between items-center text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span>Species Evenness</span>
                  <MathFormula math="J'" />
                </span>
                <BarChart3 size={18} className="text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {data?.species_evenness ?? '0.000'}
              </div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <span>Distribution uniformity</span>
                <MathFormula math="J' = \frac{H'}{\ln S}" className="text-[11px]" />
              </div>
            </div>

            {/* Card 4: Total Individuals N */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="flex justify-between items-center text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span>Total Population</span>
                  <MathFormula math="N" />
                </span>
                <Activity size={18} className="text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {data?.total_individuals_N ?? 0}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Deduplicated telemetry events</div>
            </div>
          </div>

          {/* Relative Abundances Chart & Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <h4 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-1.5">
                <span>Species Relative Abundance Proportion</span>
                <MathFormula math="p_i" />
              </h4>
              {data?.relative_abundance && data.relative_abundance.length > 0 ? (
                <div className="h-64">
                  <Bar
                    data={abundanceChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top', labels: { color: '#a1a1aa', font: { size: 11 } } },
                      },
                      scales: {
                        x: { ticks: { color: '#a1a1aa', font: { size: 10 } }, grid: { color: '#27272a' } },
                        y: { ticks: { color: '#a1a1aa' }, grid: { color: '#27272a' } },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-zinc-500 text-xs">
                  No verified species detections available for Shannon Index calculation.
                </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 font-semibold text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Species Proportion Breakdown</span>
                <MathFormula math="p_i = \frac{n_i}{N}" />
              </div>
              <div className="flex-1 overflow-y-auto max-h-64">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 sticky top-0">
                    <tr>
                      <th className="p-3">Species</th>
                      <th className="p-3 text-right">
                        <span className="inline-flex items-center gap-1">
                          Count <MathFormula math="n_i" />
                        </span>
                      </th>
                      <th className="p-3 text-right">
                        <span className="inline-flex items-center gap-1">
                          Proportion <MathFormula math="p_i" />
                        </span>
                      </th>
                      <th className="p-3 text-right">Abundance (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                    {data?.relative_abundance && data.relative_abundance.length > 0 ? (
                      data.relative_abundance.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/30">
                          <td className="p-3 font-medium text-zinc-200">{item.species}</td>
                          <td className="p-3 text-right text-zinc-400">{item.count}</td>
                          <td className="p-3 text-right font-mono text-zinc-300">{item.proportion}</td>
                          <td className="p-3 text-right font-bold text-emerald-400">{item.percentage}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-zinc-500">No species data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
