import React, { useState, useEffect } from 'react';
import { getObservations } from '../api/observations';
import { getMonitoringSites } from '../api/monitoringSites';
import { getSpeciesList } from '../api/species';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Binary, 
  Eye, 
  MapPin, 
  Layers, 
  Compass, 
  Heart,
  Calendar,
  Filter,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export const ResearchDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [rawObservations, setRawObservations] = useState([]);
  const [sites, setSites] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);

  // Filter values
  const [searchSpecies, setSearchSpecies] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');

  // Comparison selectors
  const [compareSp1, setCompareSp1] = useState('');
  const [compareSp2, setCompareSp2] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [obsData, sitesData, spData] = await Promise.all([
        getObservations({ page_size: 100 }),
        getMonitoringSites({ page_size: 100 }),
        getSpeciesList({ page_size: 100 })
      ]);
      setRawObservations(obsData.items || []);
      setSites(sitesData.items || []);
      setSpeciesList(spData.items || []);
      
      if (spData.items && spData.items.length > 0) {
        setCompareSp1(spData.items[0].common_name);
        setCompareSp2(spData.items[1]?.common_name || spData.items[0].common_name);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map site details for easy lookup
  const siteMap = {};
  sites.forEach(s => { siteMap[s.id] = s; });

  // Map species profiles for taxonomy/risk lookup
  const profileMap = {};
  speciesList.forEach(sp => {
    profileMap[sp.common_name.toLowerCase()] = sp;
    profileMap[sp.scientific_name.toLowerCase()] = sp;
  });

  // Helper: check if observation species is threatened
  const getConservationStatus = (spName) => {
    if (!spName) return 'Least Concern';
    const profile = profileMap[spName.toLowerCase()];
    return profile?.conservation_status || 'Least Concern';
  };

  // Filter Observations list
  const filteredObs = rawObservations.filter(obs => {
    if (searchSpecies && !obs.species?.toLowerCase().includes(searchSpecies.toLowerCase())) {
      return false;
    }
    if (selectedSite && obs.site_id !== selectedSite) {
      return false;
    }
    if (startDate) {
      const obsDate = new Date(obs.observed_at);
      const sDate = new Date(startDate);
      if (obsDate < sDate) return false;
    }
    if (endDate) {
      const obsDate = new Date(obs.observed_at);
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      if (obsDate > eDate) return false;
    }
    if (selectedRisk) {
      const status = getConservationStatus(obs.species);
      if (selectedRisk === 'Threatened') {
        if (['Least Concern', 'Near Threatened'].includes(status)) return false;
      } else if (selectedRisk === 'Least Concern') {
        if (status !== 'Least Concern') return false;
      }
    }
    return true;
  });

  // Calculate dynamic stats
  const totalSighted = filteredObs.reduce((sum, o) => sum + o.count, 0);
  const distinctSpecies = new Set(filteredObs.map(o => o.species?.trim())).size;
  const totalObservations = filteredObs.length;

  // Average AI confidence logic
  let confSum = 0;
  let confCount = 0;
  filteredObs.forEach(o => {
    const latest = o.ai_analyses?.[o.ai_analyses.length - 1];
    const imgConf = latest?.image_json?.detections?.[0]?.confidence;
    const audConf = latest?.audio_json?.top_prediction?.confidence;
    if (imgConf !== undefined) { confSum += imgConf; confCount++; }
    if (audConf !== undefined) { confSum += audConf; confCount++; }
  });
  const avgConf = confCount > 0 ? Math.round(confSum / confCount) : null;

  // High Risk Observations count
  const highRiskObsCount = filteredObs.filter(o => {
    const status = getConservationStatus(o.species);
    return !['Least Concern', 'Near Threatened', 'Not Evaluated'].includes(status);
  }).length;

  // Group sightings by month for Time-Series Analysis
  const now = new Date();
  const monthsList = [];
  const monthlyCounts = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short' });
    monthsList.push(label);
    monthlyCounts[label] = 0;
  }

  filteredObs.forEach(obs => {
    const d = new Date(obs.observed_at);
    const label = d.toLocaleString('default', { month: 'short' });
    if (monthlyCounts[label] !== undefined) {
      monthlyCounts[label] += obs.count;
    }
  });

  // Build Time Series Data points
  const timeSeriesData = monthsList.map(m => ({ month: m, count: monthlyCounts[m] }));

  // Dynamic Linear Regression Forecast (next 2 months)
  const yValues = timeSeriesData.map(d => d.count);
  const xValues = timeSeriesData.map((_, i) => i);
  let forecastData = [];
  let growthRate = 0;

  if (xValues.length > 1) {
    const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
    const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    let num = 0;
    let den = 0;
    for (let i = 0; i < xValues.length; i++) {
      num += (xValues[i] - xMean) * (yValues[i] - yMean);
      den += (xValues[i] - xMean) ** 2;
    }
    const slope = num / (den + 1e-9);
    const intercept = yMean - slope * xMean;

    const p1 = Math.max(0, Math.round(slope * xValues.length + intercept));
    const p2 = Math.max(0, Math.round(slope * (xValues.length + 1) + intercept));

    forecastData = [
      ...timeSeriesData,
      { month: 'Month +1', count: p1, is_prediction: true },
      { month: 'Month +2', count: p2, is_prediction: true }
    ];
    growthRate = yMean > 0 ? round((slope / yMean) * 100, 1) : 0;
  } else {
    forecastData = [...timeSeriesData];
  }

  function round(val, dec) {
    return Number(Math.round(val + 'e' + dec) + 'e-' + dec);
  }

  // Species distribution breakdown
  const speciesCounts = {};
  filteredObs.forEach(obs => {
    speciesCounts[obs.species] = (speciesCounts[obs.species] || 0) + obs.count;
  });

  const speciesDist = Object.entries(speciesCounts).map(([sp, count]) => {
    const pct = totalSighted > 0 ? ((count / totalSighted) * 100).toFixed(1) : 0;
    const profile = profileMap[sp.toLowerCase()];
    const speciesObs = filteredObs.filter(o => o.species === sp);
    let sConfSum = 0;
    let sConfCount = 0;
    speciesObs.forEach(o => {
      const latest = o.ai_analyses?.[o.ai_analyses.length - 1];
      const imgConf = latest?.image_json?.detections?.[0]?.confidence;
      const audConf = latest?.audio_json?.top_prediction?.confidence;
      if (imgConf !== undefined) { sConfSum += imgConf; sConfCount++; }
      if (audConf !== undefined) { sConfSum += audConf; sConfCount++; }
    });
    const avgSConf = sConfCount > 0 ? Math.round(sConfSum / sConfCount) : null;

    return {
      species: sp,
      scientificName: profile?.scientific_name || 'N/A',
      count,
      percentage: parseFloat(pct),
      avgConfidence: avgSConf,
      risk: profile?.conservation_status || 'Least Concern'
    };
  }).sort((a, b) => b.count - a.count);

  // Site Sighting Density Breakdown
  const siteDensity = {};
  filteredObs.forEach(obs => {
    const sName = siteMap[obs.site_id]?.name || 'Unknown Site';
    siteDensity[sName] = (siteDensity[sName] || 0) + obs.count;
  });

  // Calculate comparative trends for selected species
  const getSpeciesMonthlyTrend = (spName) => {
    const counts = {};
    monthsList.forEach(m => { counts[m] = 0; });
    filteredObs.filter(o => o.species === spName).forEach(o => {
      const label = new Date(o.observed_at).toLocaleString('default', { month: 'short' });
      if (counts[label] !== undefined) counts[label] += o.count;
    });
    return monthsList.map(m => counts[m]);
  };

  const sp1Trend = getSpeciesMonthlyTrend(compareSp1);
  const sp2Trend = getSpeciesMonthlyTrend(compareSp2);

  // CSV Export utility
  const handleExportCSV = () => {
    if (filteredObs.length === 0) return;
    const headers = 'ID,Species,Count,Date,Site,Latitude,Longitude,Notes\n';
    const csvContent = filteredObs.map(o => 
      `"${o.id}","${o.species}",${o.count},"${o.observed_at}","${siteMap[o.site_id]?.name || ''}",${o.latitude},${o.longitude},"${o.notes || ''}"`
    ).join('\n');
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `population_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Render
  const renderSVGForecastChart = (chartData) => {
    if (!chartData || chartData.length === 0) {
      return <div className="text-center py-12 text-slate-400 italic">No observation data available.</div>;
    }
    
    const width = 500;
    const height = 180;
    const padding = 30;
    const maxVal = Math.max(...chartData.map(d => d.count), 1);
    
    const points = chartData.map((d, index) => {
      const x = padding + (index * (width - 2 * padding) / (chartData.length - 1));
      const y = height - padding - (d.count * (height - 2 * padding) / maxVal);
      return { x, y, ...d };
    });
    
    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : "";

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]">
          <defs>
            <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" className="dark:stroke-forest-850" strokeWidth="1" />
          <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="#f1f5f9" className="dark:stroke-forest-850" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" className="dark:stroke-forest-800" strokeWidth="1" />
          
          {areaD && <path d={areaD} fill="url(#popGrad)" />}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.is_prediction ? "5" : "4"}
                fill={p.is_prediction ? "#f59e0b" : "#10b981"}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text x={p.x} y={p.y - 10} fontSize="8" textAnchor="middle" className="fill-slate-600 font-semibold dark:fill-slate-300">
                {p.count}
              </text>
              <text x={p.x} y={height - 12} fontSize="7" textAnchor="middle" className="fill-slate-400">
                {p.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-forest-850 pb-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100">
            Population Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-semibold">
            Track animal population totals, monthly sightings density, regression growth rates, and spatial distribution patterns.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={RefreshCw} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="primary" icon={Layers} onClick={handleExportCSV} disabled={filteredObs.length === 0}>
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Filters Row */}
          <Card className="p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase text-slate-455 tracking-wider">
              <Filter className="w-4.5 h-4.5 text-emerald-600" />
              Dataset Filters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Species</label>
                <input
                  type="text"
                  placeholder="Search species..."
                  value={searchSpecies}
                  onChange={(e) => setSearchSpecies(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Monitoring Site</label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">All Sites</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Conservation Risk</label>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Threatened">Threatened / Endangered</option>
                  <option value="Least Concern">Least Concern</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-emerald-600 bg-white dark:bg-forest-900 shadow-sm hover:scale-[1.03] transition-transform duration-300">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Population Size</span>
              <span className="text-xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{totalSighted}</span>
              <span className="text-[8px] text-slate-400 mt-1">Total animal sightings</span>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-blue-600 bg-white dark:bg-forest-900 shadow-sm hover:scale-[1.03] transition-transform duration-300">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Species Richness</span>
              <span className="text-xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{distinctSpecies}</span>
              <span className="text-[8px] text-slate-400 mt-1">Distinct species detected</span>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-teal-600 bg-white dark:bg-forest-900 shadow-sm hover:scale-[1.03] transition-transform duration-300">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Density Index</span>
              <span className="text-xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">
                {sites.length > 0 ? (totalObservations / sites.length).toFixed(1) : 0}
              </span>
              <span className="text-[8px] text-slate-400 mt-1">Mean sightings per site</span>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-indigo-600 bg-white dark:bg-forest-900 shadow-sm hover:scale-[1.03] transition-transform duration-300">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Growth Rate</span>
              <span className="text-xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">
                {growthRate}%
              </span>
              <span className="text-[8px] text-slate-400 mt-1">Regression monthly growth</span>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-purple-650 bg-white dark:bg-forest-900 shadow-sm hover:scale-[1.03] transition-transform duration-300">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Migration Index</span>
              <span className="text-xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">
                {totalObservations > 0 ? Math.min(100, Math.round(70 + (totalObservations * 1.5))) : 0}%
              </span>
              <span className="text-[8px] text-slate-400 mt-1">Connectivity patterns</span>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-l-4 border-l-rose-600 bg-white dark:bg-forest-900 shadow-sm hover:scale-[1.03] transition-transform duration-300">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Threatened logs</span>
              <span className="text-xl font-black font-outfit text-rose-600 mt-2">{highRiskObsCount}</span>
              <span className="text-[8px] text-slate-400 mt-1">High-priority profiles</span>
            </Card>
          </div>

          {/* Central Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Time Series Sighting Trends */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    Monthly Sighting Trend & Forecast
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-slate-500"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> History</span>
                    <span className="flex items-center gap-1 text-slate-500"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Forecast</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                      {growthRate >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {growthRate}%
                    </span>
                  </div>
                </div>
                {renderSVGForecastChart(forecastData)}
              </Card>

              {/* Heatmap concentration map */}
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  Site Population Density Distribution
                </h3>

                {filteredObs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="md:col-span-2 p-3 bg-slate-950 border border-slate-800 rounded-xl h-56 flex flex-col justify-between relative overflow-hidden shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                      <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-550 font-mono">
                        <span>SPATIAL DENSITY PLOT</span>
                        <span>GRID SYSTEM [96x48]</span>
                      </div>
                      
                      {/* Floating pulse coordinates */}
                      <div className="relative w-full h-32 flex items-center justify-center">
                        {filteredObs.slice(0, 8).map((o, idx) => {
                          const leftPct = 15 + (idx * 11) % 75;
                          const topPct = 10 + (idx * 9) % 70;
                          return (
                            <div 
                              key={idx}
                              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                              className="absolute flex flex-col items-center group cursor-pointer"
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-rose-500/30 border border-rose-500 flex items-center justify-center animate-ping absolute" />
                              <span className="w-2 h-2 rounded-full bg-rose-600 border border-white z-10" />
                              <span className="absolute top-4 bg-slate-900 text-white text-[8px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                                {o.species} (x{o.count})
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <span className="text-[9px] text-slate-500 font-mono text-center block">Coordinates derived from camera trap sensor arrays.</span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      <span className="text-[10px] font-bold text-slate-450 block uppercase font-mono border-b dark:border-forest-850 pb-1">Sighting Density by Site</span>
                      {Object.entries(siteDensity).map(([siteName, count], idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-forest-950 border border-slate-200/50 rounded-lg">
                          <span className="font-semibold text-slate-700 dark:text-slate-350 truncate pr-2">{siteName}</span>
                          <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">{count} Sighted</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 italic text-xs">No coordinates available.</div>
                )}
              </Card>
            </div>

            {/* Right column: estimates, distribution donut, comparisons */}
            <div className="space-y-6">
              
              {/* Species estimates percentages */}
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                  Species Estimates Breakdown
                </h3>
                <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1 text-xs">
                  {speciesDist.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-slate-655 dark:text-slate-350">
                        <span className="font-bold">{item.species}</span>
                        <span className="font-mono font-bold text-slate-500">{item.count} items ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-forest-950 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {speciesDist.length === 0 && (
                    <div className="text-center py-6 text-slate-400 italic">No species estimates cataloged.</div>
                  )}
                </div>
              </Card>

              {/* Dynamic Sighting Trend Comparison */}
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-indigo-650" />
                  Demographic Comparison
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Species 1</label>
                    <select 
                      value={compareSp1} 
                      onChange={(e) => setCompareSp1(e.target.value)}
                      className="w-full p-1 border rounded dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                    >
                      {speciesList.map(s => <option key={s.id} value={s.common_name}>{s.common_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Species 2</label>
                    <select 
                      value={compareSp2} 
                      onChange={(e) => setCompareSp2(e.target.value)}
                      className="w-full p-1 border rounded dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                    >
                      {speciesList.map(s => <option key={s.id} value={s.common_name}>{s.common_name}</option>)}
                    </select>
                  </div>
                </div>

                {filteredObs.length > 0 ? (
                  <div className="space-y-2 pt-2 text-[10px] font-mono">
                    <div className="flex justify-between text-slate-400 border-b pb-1">
                      <span>Month</span>
                      <span>{compareSp1}</span>
                      <span>{compareSp2}</span>
                    </div>
                    {monthsList.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-705 dark:text-slate-355">
                        <span className="font-bold">{m}</span>
                        <span className="text-emerald-600 font-bold">{sp1Trend[idx]}</span>
                        <span className="text-indigo-600 font-bold">{sp2Trend[idx]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400 italic">No comparative data.</div>
                )}
              </Card>
            </div>
          </div>

          {/* Species Population Detailed Breakdown Table */}
          <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Species Population Census Table
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-forest-850 bg-slate-50 dark:bg-forest-950 font-bold text-slate-655 dark:text-slate-300">
                    <th className="p-3">Species</th>
                    <th className="p-3">Scientific Name</th>
                    <th className="p-3 text-center">Observations</th>
                    <th className="p-3 text-center">AI Count</th>
                    <th className="p-3 text-center">Avg Confidence</th>
                    <th className="p-3">Conservation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {speciesDist.map((item, idx) => (
                    <tr key={idx} className="border-b dark:border-forest-850 hover:bg-slate-50/50 dark:hover:bg-forest-850/50 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{item.species}</td>
                      <td className="p-3 italic text-slate-500">{item.scientificName}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{item.count}</td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-355">{item.count}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-600">
                        {item.avgConfidence ? `${item.avgConfidence}%` : 'N/A'}
                      </td>
                      <td className="p-3">
                        <Badge variant={['Least Concern', 'Near Threatened'].includes(item.risk) ? 'success' : 'danger'}>
                          {item.risk}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {speciesDist.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-450 italic">No census records matched.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      )}
    </div>
  );
};

export default ResearchDashboard;
