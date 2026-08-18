import React, { useEffect, useState } from 'react';
import { analyticsAPI, observationsAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Award,
  Eye,
  Activity,
  ClipboardList,
  Compass,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Sparkles,
  Layers,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Image as ImageIcon,
  Users,
  Dna
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export default function BiodiversityAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUrls, setImageUrls] = useState({});

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const res = await analyticsAPI.getBiodiversity();
      setData(res);

      // Load media thumbnails for recent image observations safely in parallel
      if (res.recent_observations && res.recent_observations.length > 0) {
        const urlMap = {};
        await Promise.all(
          res.recent_observations.map(async (obs) => {
            if (obs.filename) {
              try {
                const blob = await observationsAPI.getMediaBlob(obs.filename);
                urlMap[obs.filename] = URL.createObjectURL(blob);
              } catch (err) {
                console.warn('Failed to load thumbnail for', obs.filename);
              }
            }
          })
        );
        setImageUrls((prev) => ({ ...prev, ...urlMap }));
      }
    } catch (err) {
      console.error('Failed to load biodiversity analytics:', err);
      setError(err.response?.data?.detail || 'Failed to compute biodiversity analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Auto-sync telemetry when returning to tab or window
    const handleFocus = () => {
      fetchAnalytics();
    };

    window.addEventListener('focus', handleFocus);

    // Dynamic real-time auto-refresh interval every 10 seconds
    const intervalId = setInterval(() => {
      fetchAnalytics();
    }, 10000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    // 1. Overview KPIs
    csvContent += '=== BIODIVERSITY ANALYTICS SUMMARY (IMAGE DATA ONLY) ===\n';
    csvContent += `User,${data.user_name}\n`;
    csvContent += `Report Generated,${new Date().toLocaleString()}\n`;
    csvContent += `Total Image Observations,${data.overview_kpis.total_observations}\n`;
    csvContent += `Total Species Identified,${data.overview_kpis.total_species_identified}\n`;
    csvContent += `Total Individual Animals Detected,${data.overview_kpis.total_animals_detected}\n`;
    csvContent += `Endangered Species Count,${data.overview_kpis.endangered_species_count}\n`;
    csvContent += `Average Confidence (%),${data.overview_kpis.avg_confidence}%\n`;
    csvContent += `Active Surveys,${data.overview_kpis.active_surveys}\n\n`;

    // 2. Species Distribution
    csvContent += '=== SPECIES DISTRIBUTION ===\n';
    csvContent += 'Species,Detection Count\n';
    data.species_distribution.forEach((sp) => {
      csvContent += `"${sp.species}",${sp.count}\n`;
    });
    csvContent += '\n';

    // 3. Top Species
    csvContent += '=== TOP SPECIES DETECTED ===\n';
    csvContent += 'Common Name,Scientific Name,Count,Avg Confidence (%),IUCN Category\n';
    data.top_species.forEach((sp) => {
      csvContent += `"${sp.common_name}","${sp.scientific_name}",${sp.count},${sp.avg_confidence}%,${sp.iucn_category}\n`;
    });
    csvContent += '\n';

    // 4. Insights
    csvContent += '=== BIODIVERSITY INSIGHTS ===\n';
    data.insights.forEach((ins, idx) => {
      csvContent += `"${idx + 1}. ${ins}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Biodiversity_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="text-zinc-400 font-medium text-sm">
          Computing dynamic image biodiversity telemetry for your workspace...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-full text-red-400">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-zinc-100">Analytics Computation Warning</h3>
        <p className="text-zinc-400 max-w-md text-sm">{error || 'No image analytics telemetry available.'}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition"
        >
          Retry Computation
        </button>
      </div>
    );
  }

  const { overview_kpis } = data;

  // Chart Styling Tokens
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#a1a1aa',
          font: { family: 'Inter', size: 11, weight: 'bold' },
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#34d399',
        bodyColor: '#e4e4e7',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: '#71717a', font: { size: 10 } },
        grid: { color: '#27272a', drawBorder: false },
      },
      y: {
        ticks: { color: '#71717a', font: { size: 10 } },
        grid: { color: '#27272a', drawBorder: false },
      },
    },
  };

  // 1. Species Distribution Bar Chart Data
  const speciesChartData = {
    labels: data.species_distribution.map((s) => s.species),
    datasets: [
      {
        label: 'Detections Count',
        data: data.species_distribution.map((s) => s.count),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // 2. Taxonomic Diversity Doughnut Chart Data
  const taxonomyChartData = {
    labels: data.taxonomic_diversity.map((t) => t.group),
    datasets: [
      {
        data: data.taxonomic_diversity.map((t) => t.count),
        backgroundColor: ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'],
        borderColor: '#18181b',
        borderWidth: 2,
      },
    ],
  };

  // 3. Conservation Status Doughnut Data
  const conservationChartData = {
    labels: data.conservation_distribution.map((c) => c.category),
    datasets: [
      {
        data: data.conservation_distribution.map((c) => c.count),
        backgroundColor: data.conservation_distribution.map((c) => {
          if (c.code === 'CR') return '#a855f7';
          if (c.code === 'EN') return '#ef4444';
          if (c.code === 'VU') return '#f59e0b';
          if (c.code === 'NT') return '#eab308';
          if (c.code === 'LC') return '#10b981';
          return '#71717a';
        }),
        borderColor: '#18181b',
        borderWidth: 2,
      },
    ],
  };

  // 4. Observation Timeline Chart Data
  const timelineChartData = {
    labels: data.observation_timeline.map((t) => t.date),
    datasets: [
      {
        label: 'Image Detection Events',
        data: data.observation_timeline.map((t) => t.detections),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Individual Animals',
        data: data.observation_timeline.map((t) => t.animals),
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#14b8a6',
      },
    ],
  };

  // 5. Confidence Brackets Bar Chart Data
  const confidenceChartData = {
    labels: data.confidence_analysis.brackets.map((b) => b.bracket),
    datasets: [
      {
        label: 'Image Predictions Count',
        data: data.confidence_analysis.brackets.map((b) => b.count),
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div>
      {/* ========================================================================= */}
      {/* 1. SCREEN-ONLY INTERACTIVE DASHBOARD VIEW (Hidden during PDF print)       */}
      {/* ========================================================================= */}
      <div className="space-y-8 pb-12 print:hidden">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center gap-1">
                <ImageIcon size={12} />
                Image Analysis Telemetry Only
              </span>
              <span className="text-xs text-zinc-500 font-mono">User ID: {data.user_id}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mt-1 flex items-center gap-2">
              <span>Biodiversity Intelligence Analytics</span>
              <Sparkles size={22} className="text-emerald-400" />
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-1">
              Real-time image analysis telemetry computed strictly from authenticated observation uploads for{' '}
              <strong className="text-zinc-200">{data.user_name}</strong>.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-emerald-400' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-300 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <FileSpreadsheet size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <Printer size={14} />
              <span>Print Text PDF Report</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODULES 6-10 INTELLIGENCE ENGINE NAVIGATION CARDS                        */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            Intelligence Engine Modules (PDF Modules 6–10)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link
              to="/population-intelligence"
              className="p-4 bg-gradient-to-br from-blue-950/40 via-zinc-900 to-zinc-900 border border-blue-800/40 hover:border-blue-500/80 rounded-2xl transition shadow-sm group"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">Module 6</span>
                <Users size={16} className="text-blue-400 group-hover:scale-110 transition" />
              </div>
              <div className="mt-2 font-bold text-sm text-zinc-100 group-hover:text-blue-300">Population Intelligence</div>
              <div className="text-[10px] text-zinc-400 mt-1">Deduplicated Count, Density & Trends</div>
            </Link>

            <Link
              to="/biodiversity-intelligence"
              className="p-4 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-800/40 hover:border-emerald-500/80 rounded-2xl transition shadow-sm group"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Module 7</span>
                <Dna size={16} className="text-emerald-400 group-hover:scale-110 transition" />
              </div>
              <div className="mt-2 font-bold text-sm text-zinc-100 group-hover:text-emerald-300">Biodiversity Intelligence</div>
              <div className="text-[10px] text-zinc-400 mt-1">Shannon Index H', Richness & Evenness</div>
            </Link>

            <Link
              to="/habitat-intelligence"
              className="p-4 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-800/40 hover:border-amber-500/80 rounded-2xl transition shadow-sm group"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Module 8</span>
                <Layers size={16} className="text-amber-400 group-hover:scale-110 transition" />
              </div>
              <div className="mt-2 font-bold text-sm text-zinc-100 group-hover:text-amber-300">Habitat Intelligence</div>
              <div className="text-[10px] text-zinc-400 mt-1">Sentinel-2 NDVI & GIS Suitability</div>
            </Link>

            <Link
              to="/conservation-recommendations"
              className="p-4 bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-800/40 hover:border-purple-500/80 rounded-2xl transition shadow-sm group"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Module 9</span>
                <Compass size={16} className="text-purple-400 group-hover:scale-110 transition" />
              </div>
              <div className="mt-2 font-bold text-sm text-zinc-100 group-hover:text-purple-300">Conservation Recommendations</div>
              <div className="text-[10px] text-zinc-400 mt-1">Priority Ranking, Restoration & Protection</div>
            </Link>

            <Link
              to="/ecosystem-health"
              className="p-4 bg-gradient-to-br from-rose-950/40 via-zinc-900 to-zinc-900 border border-rose-800/40 hover:border-rose-500/80 rounded-2xl transition shadow-sm group"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">Module 10</span>
                <Activity size={16} className="text-rose-400 group-hover:scale-110 transition" />
              </div>
              <div className="mt-2 font-bold text-sm text-zinc-100 group-hover:text-rose-300">Ecosystem Health</div>
              <div className="text-[10px] text-zinc-400 mt-1">Weighted Health Score & Breakdown</div>
            </Link>
          </div>
        </div>

        {/* 1. Biodiversity Overview KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Card 1: Total Observations */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Image Obs</span>
              <div className="p-2 bg-emerald-950/50 border border-emerald-900/30 text-emerald-400 rounded-xl">
                <ClipboardList size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-zinc-100">{overview_kpis.total_observations}</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Image media uploads</p>
            </div>
          </div>

          {/* Card 2: Species Identified */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Species</span>
              <div className="p-2 bg-teal-950/50 border border-teal-900/30 text-teal-400 rounded-xl">
                <Eye size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-teal-400">{overview_kpis.total_species_identified}</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Unique taxa classified</p>
            </div>
          </div>

          {/* Card 3: Animals Detected */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Individuals</span>
              <div className="p-2 bg-cyan-950/50 border border-cyan-900/30 text-cyan-400 rounded-xl">
                <Activity size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-cyan-400">{overview_kpis.total_animals_detected}</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Animals detected count</p>
            </div>
          </div>

          {/* Card 4: Endangered Species */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-amber-900/50 transition shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Endangered</span>
              <div className="p-2 bg-amber-950/50 border border-amber-800/40 text-amber-400 rounded-xl">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-amber-400">{overview_kpis.endangered_species_count}</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">IUCN EN/CR/VU species</p>
            </div>
          </div>

          {/* Card 5: Avg Confidence */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Avg Accuracy</span>
              <div className="p-2 bg-emerald-950/50 border border-emerald-900/30 text-emerald-400 rounded-xl">
                <Award size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-emerald-400">{overview_kpis.avg_confidence}%</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Mean image classifier conf</p>
            </div>
          </div>

          {/* Card 6: Active Surveys */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Surveys</span>
              <div className="p-2 bg-blue-950/50 border border-blue-900/30 text-blue-400 rounded-xl">
                <Compass size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-blue-400">{overview_kpis.active_surveys}</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Active user survey projects</p>
            </div>
          </div>
        </div>

        {/* Row 1: Species Distribution + Taxonomic Diversity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Species Distribution Chart */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 size={18} className="text-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">Species Frequency Distribution</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-semibold">Image Vision Classification</span>
            </div>
            <div className="h-64">
              {data.species_distribution.length > 0 ? (
                <Bar data={speciesChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                  No image species detections recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Taxonomic Diversity Doughnut Chart */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Layers size={18} className="text-teal-400" />
                <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">Taxonomic Hierarchy</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-semibold">GBIF Class</span>
            </div>
            <div className="h-64 flex items-center justify-center">
              {data.taxonomic_diversity.length > 0 ? (
                <Doughnut data={taxonomyChartData} options={{ ...chartOptions, scales: {} }} />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                  No taxonomy classifications available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Conservation Status Distribution + Prediction Confidence Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conservation Status Chart */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">IUCN Red List Categories</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-semibold">Threat Level</span>
            </div>
            <div className="h-64 flex items-center justify-center">
              {data.conservation_distribution.length > 0 ? (
                <Doughnut data={conservationChartData} options={{ ...chartOptions, scales: {} }} />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                  No IUCN status mappings.
                </div>
              )}
            </div>
          </div>

          {/* Prediction Confidence Analysis Chart */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Award size={18} className="text-cyan-400" />
                <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">Image AI Model Confidence Brackets</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-semibold">Accuracy Breakdown</span>
            </div>
            <div className="h-64">
              <Bar data={confidenceChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Row 3: Observation Timeline */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">Image Observation Telemetry Timeline</h3>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono font-semibold">Chronological Detections</span>
          </div>
          <div className="h-64">
            {data.observation_timeline.length > 0 ? (
              <Line data={timelineChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No timeline records available.
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Top Species + Biodiversity Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Detected Species */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">Top Detected Image Species</h3>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono font-semibold">Ranked by Count</span>
              </div>

              <div className="space-y-3 mt-4">
                {data.top_species.length > 0 ? (
                  data.top_species.map((sp, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex items-center justify-between hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-xs font-extrabold text-emerald-400 font-mono">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-200">{sp.common_name}</h4>
                          <p className="text-[10px] text-zinc-500 italic">{sp.scientific_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 rounded-md">
                          {sp.count} obs
                        </span>
                        <span
                          className={`px-2 py-0.5 border text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                            sp.iucn_category === 'EN' || sp.iucn_category === 'CR'
                              ? 'bg-red-950/60 border-red-800/80 text-red-400'
                              : sp.iucn_category === 'VU'
                              ? 'bg-amber-950/60 border-amber-800/80 text-amber-400'
                              : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                          }`}
                        >
                          {sp.iucn_category}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-400 font-mono">
                          {sp.avg_confidence}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 py-4 text-center">No image species identified yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Biodiversity Insights */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">Automated Image Insights</h3>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono font-semibold">AI Derived</span>
              </div>

              <div className="space-y-3 mt-4">
                {data.insights.map((ins, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex items-start space-x-3 text-xs text-zinc-300"
                  >
                    <div className="p-1 bg-emerald-900/40 text-emerald-400 rounded shrink-0 mt-0.5">
                      <Sparkles size={12} />
                    </div>
                    <span className="leading-relaxed">{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 5: Recent Wildlife Image Observations Table */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-emerald-400" />
              <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">Recent Image Detections</h3>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono font-semibold">Image Assets Only</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-500 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="p-3">Media Asset</th>
                  <th className="p-3">Identified Species</th>
                  <th className="p-3">Classifier Confidence</th>
                  <th className="p-3">Survey Project</th>
                  <th className="p-3">Monitoring Site</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data.recent_observations.length > 0 ? (
                  data.recent_observations.map((obs, idx) => (
                    <tr key={idx} className="hover:bg-zinc-950/40 transition">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          {obs.filename && imageUrls[obs.filename] ? (
                            <img
                              src={imageUrls[obs.filename]}
                              alt={obs.common_name}
                              className="h-10 w-10 object-cover rounded-lg border border-zinc-700 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 text-[10px] shrink-0 font-bold">
                              IMAGE
                            </div>
                          )}
                          <span className="font-mono text-[11px] text-zinc-400 truncate max-w-[120px]">
                            {obs.filename || 'asset.jpg'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-zinc-200">{obs.common_name}</p>
                          <p className="text-[10px] text-zinc-500 italic">{obs.scientific_name}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        {obs.is_low_confidence || obs.confidence === null ? (
                          <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-800/80 text-amber-400 text-[10px] font-bold rounded">
                            Low Confidence
                          </span>
                        ) : (
                          <span className="font-mono font-extrabold text-emerald-400">
                            {(obs.confidence * 100).toFixed(1)}%
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-medium text-zinc-300">{obs.survey_name}</td>
                      <td className="p-3 text-zinc-400">{obs.site_name}</td>
                      <td className="p-3 text-zinc-500 font-mono text-[11px]">{obs.timestamp}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-zinc-500">
                      No recent image observation detections found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 6: Export Report Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-teal-950/40 border border-emerald-900/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Download size={18} className="text-emerald-400" />
              <span>Export Complete Biodiversity Analytics Report</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Generate text-only PDF documentation or CSV datasets for research archives.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition"
            >
              <FileSpreadsheet size={16} className="text-emerald-400" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <Printer size={16} />
              <span>Print Text PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TEXT-ONLY PRINT/PDF REPORT VIEW (Active ONLY during window.print())    */}
      {/* STRICTLY NO CHARTS, NO GRAPHS, NO IMAGES, NO ICONS, NO COLORED BACKGROUNDS*/}
      {/* ========================================================================= */}
      <div id="printable-text-report" className="hidden print:block text-black bg-white p-6 space-y-6 leading-relaxed text-xs">
        {/* Header */}
        <div className="border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold text-black uppercase tracking-wider">Biodiversity Analytics Report</h1>
          <div className="mt-3 text-sm space-y-1">
            <p>
              Generated For:{' '}
              <strong className="font-bold text-black text-base">{data.user_name}</strong>
            </p>
            <p className="text-xs text-gray-700">
              Report Generation Date & Time: <strong>{new Date().toLocaleString()}</strong>
            </p>
            <p className="text-xs text-gray-700">Data Source: Image Analysis Telemetry Only</p>
          </div>
        </div>

        {/* 1. Biodiversity Overview KPI Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-black pb-1">
            1. Biodiversity Overview KPI Summary
          </h2>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            <li><strong>Total Image Observations:</strong> {overview_kpis.total_observations}</li>
            <li><strong>Total Species Identified:</strong> {overview_kpis.total_species_identified}</li>
            <li><strong>Total Individual Animals Detected:</strong> {overview_kpis.total_animals_detected}</li>
            <li><strong>Endangered Species Detected:</strong> {overview_kpis.endangered_species_count}</li>
            <li><strong>Average Prediction Accuracy:</strong> {overview_kpis.avg_confidence}%</li>
            <li><strong>Active Surveys Running:</strong> {overview_kpis.active_surveys}</li>
          </ul>
        </div>

        {/* 2. Species Distribution Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-black pb-1">
            2. Species Distribution Summary
          </h2>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            {data.species_distribution && data.species_distribution.length > 0 ? (
              data.species_distribution.map((sp, idx) => (
                <li key={idx}><strong>{sp.species}:</strong> {sp.count} detection event(s)</li>
              ))
            ) : (
              <li>No species detections recorded.</li>
            )}
          </ul>
        </div>

        {/* 3. Taxonomic Diversity Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-black pb-1">
            3. Taxonomic Diversity Summary
          </h2>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            {data.taxonomic_diversity && data.taxonomic_diversity.length > 0 ? (
              data.taxonomic_diversity.map((tax, idx) => (
                <li key={idx}><strong>Class {tax.group}:</strong> {tax.count} species classification(s)</li>
              ))
            ) : (
              <li>No taxonomy classifications recorded.</li>
            )}
          </ul>
        </div>

        {/* 4. Conservation Status Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-black pb-1">
            4. Conservation Status Summary (IUCN Red List)
          </h2>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            {data.conservation_distribution && data.conservation_distribution.length > 0 ? (
              data.conservation_distribution.map((cs, idx) => (
                <li key={idx}><strong>{cs.category} ({cs.code}):</strong> {cs.count} species record(s)</li>
              ))
            ) : (
              <li>No conservation status mappings.</li>
            )}
          </ul>
        </div>

        {/* 5. Survey-wise Biodiversity Summary */}
        {data.survey_biodiversity && data.survey_biodiversity.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-black pb-1">
              5. Survey-wise Biodiversity Summary
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              {data.survey_biodiversity.map((sv, idx) => (
                <li key={idx}>
                  <strong>{sv.title}:</strong> {sv.species_count} unique species, {sv.animal_count} total animals ({sv.observation_count} observations)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. Monitoring Site Biodiversity Summary */}
        {data.site_biodiversity && data.site_biodiversity.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-black pb-1">
              6. Monitoring Site Biodiversity Summary
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              {data.site_biodiversity.map((st, idx) => (
                <li key={idx}>
                  <strong>{st.name}:</strong> {st.species_count} unique species, {st.animal_count} total animals ({st.observation_count} observations)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 7. Top Detected Species Table */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-black pb-1">
            7. Top Detected Species
          </h2>
          <table className="w-full text-left text-xs border border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="p-2 border-r border-black font-bold">Rank</th>
                <th className="p-2 border-r border-black font-bold">Common Name</th>
                <th className="p-2 border-r border-black font-bold">Scientific Name</th>
                <th className="p-2 border-r border-black font-bold">Count</th>
                <th className="p-2 border-r border-black font-bold">IUCN Category</th>
                <th className="p-2 font-bold">Avg Confidence</th>
              </tr>
            </thead>
            <tbody>
              {data.top_species && data.top_species.length > 0 ? (
                data.top_species.map((sp, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="p-2 border-r border-black font-mono">#{idx + 1}</td>
                    <td className="p-2 border-r border-black font-bold">{sp.common_name}</td>
                    <td className="p-2 border-r border-black italic">{sp.scientific_name}</td>
                    <td className="p-2 border-r border-black">{sp.count}</td>
                    <td className="p-2 border-r border-black">{sp.iucn_category} ({sp.iucn_label})</td>
                    <td className="p-2">{sp.avg_confidence}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-2 text-center">No species identified.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 8. Biodiversity Insights */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-black pb-1">
            8. Key Biodiversity Insights
          </h2>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            {data.insights.map((ins, idx) => (
              <li key={idx}>{ins}</li>
            ))}
          </ul>
        </div>

        {/* 9. Recent Image Observations Table (TEXT ONLY - NO IMAGES) */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-black pb-1">
            9. Recent Image Observation Telemetry
          </h2>
          <table className="w-full text-left text-xs border border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="p-2 border-r border-black font-bold">Filename</th>
                <th className="p-2 border-r border-black font-bold">Identified Species</th>
                <th className="p-2 border-r border-black font-bold">Confidence</th>
                <th className="p-2 border-r border-black font-bold">Survey</th>
                <th className="p-2 border-r border-black font-bold">Site</th>
                <th className="p-2 font-bold">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_observations && data.recent_observations.length > 0 ? (
                data.recent_observations.map((obs, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="p-2 border-r border-black font-mono text-[10px]">{obs.filename || 'asset.jpg'}</td>
                    <td className="p-2 border-r border-black font-bold">{obs.common_name}</td>
                    <td className="p-2 border-r border-black">
                      {obs.is_low_confidence || obs.confidence === null ? 'Low Conf' : `${(obs.confidence * 100).toFixed(1)}%`}
                    </td>
                    <td className="p-2 border-r border-black">{obs.survey_name}</td>
                    <td className="p-2 border-r border-black">{obs.site_name}</td>
                    <td className="p-2">{obs.timestamp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-2 text-center">No recent image observation detections found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
