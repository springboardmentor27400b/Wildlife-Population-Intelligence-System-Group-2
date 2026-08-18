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
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  Users,
  TrendingUp,
  Activity,
  Layers,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  BarChart3,
  MapPin,
  CheckCircle2,
  PieChart
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

export default function PopulationAnalyticsSection() {
  // State for Feature 1 (Count)
  const [countData, setCountData] = useState(null);
  const [countLoading, setCountLoading] = useState(true);
  const [countError, setCountError] = useState(null);

  // State for Feature 2 (Density)
  const [densityData, setDensityData] = useState(null);
  const [densityLoading, setDensityLoading] = useState(true);
  const [densityError, setDensityError] = useState(null);
  const [speciesFilter, setSpeciesFilter] = useState('');

  // State for Feature 3 (Trends)
  const [trendData, setTrendData] = useState(null);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState(null);
  const [trendInterval, setTrendInterval] = useState('daily');

  // Fetch Population Count
  const fetchCount = async () => {
    try {
      setCountLoading(true);
      setCountError(null);
      const res = await analyticsAPI.getPopulationCount();
      setCountData(res);
    } catch (err) {
      console.error('Failed to fetch population count:', err);
      setCountError(err.response?.data?.detail || 'Failed to load population count metrics.');
    } finally {
      setCountLoading(false);
    }
  };

  // Fetch Population Density
  const fetchDensity = async (spFilter = speciesFilter) => {
    try {
      setDensityLoading(true);
      setDensityError(null);
      const res = await analyticsAPI.getPopulationDensity(null, spFilter || null);
      setDensityData(res);
    } catch (err) {
      console.error('Failed to fetch population density:', err);
      setDensityError(err.response?.data?.detail || 'Failed to calculate population density.');
    } finally {
      setDensityLoading(false);
    }
  };

  // Fetch Population Trends
  const fetchTrends = async (interval = trendInterval) => {
    try {
      setTrendLoading(true);
      setTrendError(null);
      const res = await analyticsAPI.getPopulationTrends(interval);
      setTrendData(res);
    } catch (err) {
      console.error('Failed to fetch population trends:', err);
      setTrendError(err.response?.data?.detail || 'Failed to compute population trends.');
    } finally {
      setTrendLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    fetchDensity('');
    fetchTrends('daily');
  }, []);

  const handleRefreshAll = () => {
    fetchCount();
    fetchDensity();
    fetchTrends();
  };

  // Handle Species Density Filter Submit
  const handleDensityFilterSubmit = (e) => {
    e.preventDefault();
    fetchDensity(speciesFilter);
  };

  // Handle Trend Interval Change
  const handleIntervalChange = (interval) => {
    setTrendInterval(interval);
    fetchTrends(interval);
  };

  // Prepare Species Breakdown Bar Chart Data
  const speciesChartData = useMemo(() => ({
    labels: (countData?.species_breakdown || []).map((s) => s.species),
    datasets: [
      {
        label: 'Raw Detections',
        data: (countData?.species_breakdown || []).map((s) => s.raw_count),
        backgroundColor: 'rgba(161, 161, 170, 0.4)',
        borderColor: 'rgba(161, 161, 170, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Deduplicated Population',
        data: (countData?.species_breakdown || []).map((s) => s.deduplicated_count),
        backgroundColor: 'rgba(52, 211, 153, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }), [countData]);

  // Prepare Time-Series Trend Line Chart Data
  const trendChartData = useMemo(() => ({
    labels: (trendData?.trends || []).map((t) => t.period),
    datasets: [
      {
        label: 'Deduplicated Population',
        data: (trendData?.trends || []).map((t) => t.deduplicated_count),
        borderColor: 'rgba(52, 211, 153, 1)',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
      },
      {
        label: 'Total Animals Observed',
        data: (trendData?.trends || []).map((t) => t.total_animals),
        borderColor: 'rgba(129, 140, 248, 1)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        tension: 0.3,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  }), [trendData]);

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100">Phase 4 Population Analytics Engine</h2>
            <p className="text-xs text-zinc-400">Real-time deduplicated counting, spatial density calculations, and trend analysis.</p>
          </div>
        </div>

        <button
          onClick={handleRefreshAll}
          className="mt-4 sm:mt-0 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-2"
        >
          <RefreshCw size={14} className={countLoading || densityLoading || trendLoading ? 'animate-spin' : ''} />
          Refresh Analytics
        </button>
      </div>

      {/* FEATURE 1: POPULATION COUNT */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
          <BarChart3 className="text-emerald-400" size={20} />
          Feature 1: Population Count & Time-Block Deduplication
        </h3>

        {countLoading ? (
          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
            <RefreshCw className="animate-spin text-emerald-500 mr-3" size={20} />
            Computing deduplicated population counts...
          </div>
        ) : countError ? (
          <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <span>{countError}</span>
            <button onClick={fetchCount} className="ml-auto text-xs underline hover:text-red-200">Retry</button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Raw Detections</span>
                  <Activity size={18} className="text-zinc-500" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-100">{countData?.total_raw_detections ?? 0}</div>
                <div className="text-xs text-zinc-500 mt-1">Raw camera trap / audio hits</div>
              </div>

              <div className="bg-zinc-900 border border-emerald-500/30 p-5 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex justify-between items-center text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Deduplicated Population</span>
                  <Users size={18} className="text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">{countData?.total_deduplicated_population ?? 0}</div>
                <div className="text-xs text-emerald-500/80 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  Window: {countData?.deduplication_window_minutes ?? 10} minutes
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Unique Species</span>
                  <PieChart size={18} className="text-indigo-400" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-100">
                  {countData?.species_breakdown?.length ?? 0}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Distinct taxonomic species</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Monitoring Sites</span>
                  <MapPin size={18} className="text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-100">
                  {countData?.site_breakdown?.length ?? 0}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Sites with recorded population</div>
              </div>
            </div>

            {/* Species Breakdown Chart & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <h4 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                  Raw Detections vs Deduplicated Population by Species
                </h4>
                {countData?.species_breakdown && countData.species_breakdown.length > 0 ? (
                  <div className="h-64">
                    <Bar
                      data={speciesChartData}
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
                    No species population data recorded yet.
                  </div>
                )}
              </div>

              {/* Species & Site Breakdown Tables */}
              <div className="space-y-6">
                {/* Species Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 font-semibold text-xs text-zinc-300 uppercase tracking-wider">
                    Species Population Breakdown
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 sticky top-0">
                        <tr>
                          <th className="p-3">Species</th>
                          <th className="p-3 text-right">RawHits</th>
                          <th className="p-3 text-right">Deduplicated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                        {countData?.species_breakdown && countData.species_breakdown.length > 0 ? (
                          countData.species_breakdown.map((item, idx) => (
                            <tr key={idx} className="hover:bg-zinc-800/30">
                              <td className="p-3 font-medium text-zinc-200">{item.species}</td>
                              <td className="p-3 text-right text-zinc-400">{item.raw_count}</td>
                              <td className="p-3 text-right font-bold text-emerald-400">{item.deduplicated_count}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-zinc-500">No records found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Site Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 font-semibold text-xs text-zinc-300 uppercase tracking-wider">
                    Site Population Distribution
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 sticky top-0">
                        <tr>
                          <th className="p-3">Monitoring Site ID</th>
                          <th className="p-3 text-right">Deduplicated Population</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                        {countData?.site_breakdown && countData.site_breakdown.length > 0 ? (
                          countData.site_breakdown.map((item, idx) => (
                            <tr key={idx} className="hover:bg-zinc-800/30">
                              <td className="p-3 font-medium text-zinc-200">Site #{item.site_id}</td>
                              <td className="p-3 text-right font-bold text-emerald-400">{item.deduplicated_count}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="p-4 text-center text-zinc-500">No site data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 2: POPULATION DENSITY */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
            <Layers className="text-emerald-400" size={20} />
            Feature 2: Spatial Population Density Estimation
          </h3>

          {/* Species Filter Form */}
          <form onSubmit={handleDensityFilterSubmit} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by species (e.g. Tiger)"
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-xs rounded-lg pl-8 pr-3 py-1.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <Filter size={14} className="absolute left-2.5 top-2 text-zinc-500" />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
            >
              Filter
            </button>
            {speciesFilter && (
              <button
                type="button"
                onClick={() => {
                  setSpeciesFilter('');
                  fetchDensity('');
                }}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {densityLoading ? (
          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
            <RefreshCw className="animate-spin text-emerald-500 mr-3" size={20} />
            <span className="flex items-center gap-2">
              Calculating population density formula <MathFormula math="D = \frac{N \times \text{AvgConf}}{A}" />...
            </span>
          </div>
        ) : densityError ? (
          <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <span>{densityError}</span>
            <button onClick={() => fetchDensity()} className="ml-auto text-xs underline hover:text-red-200">Retry</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/40 p-5 rounded-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                <span>Estimated Density</span>
                <MathFormula math="D = \frac{N \times \text{AvgConf}}{A}" className="text-[11px]" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-300">
                {densityData?.density_per_sq_km ?? 0}
              </div>
              <div className="text-xs text-emerald-500/80 mt-1 flex items-center gap-1">
                <span>individuals /</span>
                <MathFormula math="\text{km}^2" className="text-xs" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                <span>Deduplicated Individuals</span>
                <MathFormula math="N" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {densityData?.deduplicated_individuals_N ?? 0}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Distinct events</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                <span>Effective Monitoring Area</span>
                <MathFormula math="A" />
              </div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {densityData?.area_sq_km ?? 1.0}
              </div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <span>Total</span>
                <MathFormula math="\text{km}^2" />
                <span>surveyed</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Average Classifier Confidence
              </div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {densityData?.average_confidence ? (densityData.average_confidence * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-zinc-500 mt-1">Model certainty factor</div>
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 3: POPULATION TRENDS */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={20} />
            Feature 3: Population Trend Analysis
          </h3>

          {/* Time Interval Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            {['daily', 'weekly', 'monthly'].map((intv) => (
              <button
                key={intv}
                onClick={() => handleIntervalChange(intv)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition ${
                  trendInterval === intv
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {intv}
              </button>
            ))}
          </div>
        </div>

        {trendLoading ? (
          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
            <RefreshCw className="animate-spin text-emerald-500 mr-3" size={20} />
            Aggregating time-series population trends ({trendInterval})...
          </div>
        ) : trendError ? (
          <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <span>{trendError}</span>
            <button onClick={() => fetchTrends()} className="ml-auto text-xs underline hover:text-red-200">Retry</button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Line Chart */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <h4 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center justify-between">
                <span>Population Growth & Telemetry Events ({trendInterval})</span>
                <span className="text-xs font-normal text-zinc-400">
                  {trendData?.total_periods ?? 0} Recorded Period(s)
                </span>
              </h4>
              {trendData?.trends && trendData.trends.length > 0 ? (
                <div className="h-64">
                  <Line
                    data={trendChartData}
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
                  No population trend data available for selected interval.
                </div>
              )}
            </div>

            {/* Trends Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 font-semibold text-xs text-zinc-300 uppercase tracking-wider">
                Time-Series Trend Table ({trendInterval})
              </div>
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 sticky top-0">
                    <tr>
                      <th className="p-3">Period</th>
                      <th className="p-3 text-right">Deduplicated Population</th>
                      <th className="p-3 text-right">Total Animals</th>
                      <th className="p-3 text-right">Active Species Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                    {trendData?.trends && trendData.trends.length > 0 ? (
                      trendData.trends.map((t, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/30">
                          <td className="p-3 font-medium text-zinc-200">{t.period}</td>
                          <td className="p-3 text-right font-bold text-emerald-400">{t.deduplicated_count}</td>
                          <td className="p-3 text-right text-zinc-300">{t.total_animals}</td>
                          <td className="p-3 text-right text-indigo-400">{t.species_count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-zinc-500">No time-series data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
