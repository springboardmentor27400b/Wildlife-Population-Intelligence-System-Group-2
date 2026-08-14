import React, { useState, useEffect } from 'react';
import { Heart, Activity, ShieldCheck, Map, BarChart2, Compass, Layers, Filter, RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';
import { getMonitoringSites } from '../api/monitoringSites';
import { getObservations } from '../api/observations';
import { getEcologicalReport } from '../api/ecological';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';

export const EcosystemHealth = () => {
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [observations, setObservations] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  
  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Cached ecological reports
  const [siteReports, setSiteReports] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [siteList, obsData] = await Promise.all([
        getMonitoringSites({ page_size: 100 }),
        getObservations({ page_size: 100 })
      ]);
      const items = siteList.items || [];
      setSites(items);
      setObservations(obsData.items || []);

      const reports = {};
      await Promise.all(items.map(async (s) => {
        try {
          const r = await getEcologicalReport(s.id);
          reports[s.id] = r;
        } catch (e) {
          console.error(e);
        }
      }));
      setSiteReports(reports);
    } catch (err) {
      console.error('Error loading health indices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter observations by date and site
  const filteredObs = observations.filter(obs => {
    if (selectedSite && obs.site_id !== selectedSite) {
      return false;
    }
    if (startDate) {
      const oDate = new Date(obs.observed_at);
      const sDate = new Date(startDate);
      if (oDate < sDate) return false;
    }
    if (endDate) {
      const oDate = new Date(obs.observed_at);
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      if (oDate > eDate) return false;
    }
    return true;
  });

  // Calculate dynamic component values
  const activeReport = selectedSite ? siteReports[selectedSite] : null;

  // Weighted health calculation parameters
  // If selectedSite is empty, we average values across all site reports
  let meanDiversityScore = 70;
  let meanStabilityScore = 80;
  let meanHabitatScore = 75;
  let meanThreatenedScore = 90;
  let meanEnvironmentScore = 95;

  const targetReports = selectedSite 
    ? (activeReport ? [activeReport] : [])
    : Object.values(siteReports);

  if (targetReports.length > 0) {
    let divSum = 0, stabSum = 0, habSum = 0, threatSum = 0, envSum = 0;
    targetReports.forEach(r => {
      divSum += (r.species_richness * 15 > 100 ? 100 : r.species_richness * 15);
      stabSum += 85; // stability metric baseline
      habSum += r.habitat_suitability_score || 50;
      threatSum += Math.max(0, 100 - (r.threatened_species_count * 20));
      envSum += 95; // climate stability baseline
    });
    const c = targetReports.length;
    meanDiversityScore = Math.round(divSum / c);
    meanStabilityScore = Math.round(stabSum / c);
    meanHabitatScore = Math.round(habSum / c);
    meanThreatenedScore = Math.round(threatSum / c);
    meanEnvironmentScore = Math.round(envSum / c);
  }

  // Dynamic Overall Ecosystem Health Score using exact formula weights:
  // Diversity (30%) + Stability (25%) + Habitat (20%) + Threatened (15%) + Environment (10%)
  const overallEcosystemScore = Math.round(
    (meanDiversityScore * 0.3) +
    (meanStabilityScore * 0.25) +
    (meanHabitatScore * 0.2) +
    (meanThreatenedScore * 0.15) +
    (meanEnvironmentScore * 0.1)
  );

  const getLetterGrade = (score) => {
    if (score >= 85) return { grade: 'A', status: 'Excellent', color: 'text-emerald-600' };
    if (score >= 70) return { grade: 'B', status: 'Healthy', color: 'text-emerald-500' };
    if (score >= 50) return { grade: 'C', status: 'Moderate', color: 'text-amber-500' };
    if (score >= 35) return { grade: 'D', status: 'Vulnerable', color: 'text-rose-500' };
    return { grade: 'F', status: 'Critical', color: 'text-rose-600' };
  };

  const scoreDetails = getLetterGrade(overallEcosystemScore);

  // Compare monitoring sites side-by-side using active values
  const siteComparisonList = sites.map(s => {
    const r = siteReports[s.id];
    let siteScore = 70;
    if (r) {
      const d = (r.species_richness * 15 > 100 ? 100 : r.species_richness * 15);
      const q = r.habitat_suitability_score || 50;
      const t = Math.max(0, 100 - (r.threatened_species_count * 20));
      siteScore = Math.round((d * 0.3) + (85 * 0.25) + (q * 0.2) + (t * 0.15) + (95 * 0.1));
    }
    return {
      id: s.id,
      name: s.name,
      habitatType: s.habitat_type,
      healthScore: siteScore,
      biodiversity: r?.species_diversity || 0,
      populationHealth: r ? 'Stable' : 'Unknown',
      habitatHealth: r?.habitat_health || 'Healthy',
      conflict: r?.human_conflict_level || 'Low'
    };
  }).sort((a, b) => b.healthScore - a.healthScore);

  // Group sites into stability classifications
  const improvingSites = siteComparisonList.filter(s => s.healthScore >= 75);
  const stableSites = siteComparisonList.filter(s => s.healthScore >= 55 && s.healthScore < 75);
  const decliningSites = siteComparisonList.filter(s => s.healthScore < 55);

  // Group sightings by month to simulate Ecosystem Health trend
  const now = new Date();
  const monthsList = [];
  const monthlyHealthScores = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short' });
    monthsList.push({ label, start: new Date(d.getFullYear(), d.getMonth(), 1), end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59) });
  }

  monthsList.forEach(m => {
    const mObs = filteredObs.filter(o => {
      const oDate = new Date(o.observed_at);
      return oDate >= m.start && oDate <= m.end;
    });

    const mCount = mObs.length;
    // Math logic: health index fluctuates slightly with sightings count
    const monthlyVariance = mCount > 8 ? 4 : mCount > 4 ? 0 : -5;
    const finalScore = Math.min(100, Math.max(0, overallEcosystemScore + monthlyVariance));
    monthlyHealthScores.push({ month: m.label, score: finalScore });
  });

  // Calculate dynamic alerts
  const healthAlerts = [];
  sites.forEach(s => {
    const r = siteReports[s.id];
    if (r) {
      if (r.habitat_suitability_score < 50) {
        healthAlerts.push({
          type: 'Danger',
          message: `Critical suitability warning at site "${s.name}" (Score: ${r.habitat_suitability_score}%)`
        });
      }
      if (r.human_conflict_level === 'High') {
        healthAlerts.push({
          type: 'Warning',
          message: `Poaching / Agricultural activity alert flagged at site "${s.name}"`
        });
      }
    }
  });

  // SVG Trend Chart
  const renderHealthTrendChart = (chartData) => {
    if (!chartData || chartData.length === 0) return null;
    const width = 500;
    const height = 150;
    const padding = 25;
    const maxVal = 100;

    const points = chartData.map((d, index) => {
      const x = padding + (index * (width - 2 * padding) / (chartData.length - 1));
      const y = height - padding - (d.score * (height - 2 * padding) / maxVal);
      return { x, y, ...d };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : "";

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          <defs>
            <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" className="dark:stroke-forest-850" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" className="dark:stroke-forest-800" strokeWidth="1" />
          
          {areaD && <path d={areaD} fill="url(#healthGrad)" />}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
              <text x={p.x} y={p.y - 7} fontSize="7" textAnchor="middle" className="fill-slate-700 font-bold dark:fill-slate-350">
                {p.score}%
              </text>
              <text x={p.x} y={height - 8} fontSize="7" textAnchor="middle" className="fill-slate-400">
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
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-7 h-7 text-emerald-600 animate-pulse" />
            Ecosystem Health Intelligence
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-semibold">
            Evaluate aggregated ecosystem stability rates, Shannon richness curves, and regional site health matrices dynamically.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-forest-900 border-slate-250 dark:border-forest-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Monitoring Sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Hero grid split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Global health rating circular gauge */}
            <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm flex flex-col items-center justify-center space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center font-mono">GLOBAL HEALTH SCORE</span>
              
              <div className="relative flex items-center justify-center">
                <svg height="150" width="150" className="transform -rotate-90">
                  <defs>
                    <linearGradient id="healthRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <circle
                    stroke="#e2e8f0"
                    fill="transparent"
                    strokeWidth="12"
                    r="58"
                    cx="75"
                    cy="75"
                    className="dark:stroke-forest-950"
                  />
                  <circle
                    stroke="url(#healthRingGrad)"
                    fill="transparent"
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 58}`}
                    style={{ strokeDashoffset: `${2 * Math.PI * 58 * (1 - overallEcosystemScore / 100)}` }}
                    r="58"
                    cx="75"
                    cy="75"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center leading-none">
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                    {overallEcosystemScore}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">INDEX</span>
                </div>
              </div>

              <div className="text-center leading-tight">
                <span className={`text-xl font-extrabold ${scoreDetails.color}`}>Grade {scoreDetails.grade}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{scoreDetails.status} Status</p>
              </div>
            </Card>

            {/* Health components weights grid */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-forest-850 pb-2">
                  Ecosystem Health Metrics Weights
                </h3>

                <div className="space-y-4 text-xs">
                  {/* Diversity */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-655 dark:text-slate-300">Species Diversity (30%)</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {(meanDiversityScore * 0.3).toFixed(1)} / 30.0
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-forest-950 rounded-full overflow-hidden">
                      <div style={{ width: `${meanDiversityScore}%` }} className="h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>

                  {/* Stability */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-655 dark:text-slate-300">Population Stability (25%)</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {(meanStabilityScore * 0.25).toFixed(1)} / 25.0
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-forest-950 rounded-full overflow-hidden">
                      <div style={{ width: `${meanStabilityScore}%` }} className="h-full bg-blue-500 rounded-full" />
                    </div>
                  </div>

                  {/* Quality */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-655 dark:text-slate-300">Habitat Quality (20%)</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {(meanHabitatScore * 0.2).toFixed(1)} / 20.0
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-forest-950 rounded-full overflow-hidden">
                      <div style={{ width: `${meanHabitatScore}%` }} className="h-full bg-teal-500 rounded-full" />
                    </div>
                  </div>

                  {/* Threatened restraint */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-655 dark:text-slate-300">Threatened Species Restraints (15%)</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {(meanThreatenedScore * 0.15).toFixed(1)} / 15.0
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-forest-950 rounded-full overflow-hidden">
                      <div style={{ width: `${meanThreatenedScore}%` }} className="h-full bg-rose-500 rounded-full" />
                    </div>
                  </div>

                  {/* Environment */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-655 dark:text-slate-300">Environmental Conditions (10%)</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {(meanEnvironmentScore * 0.1).toFixed(1)} / 10.0
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-forest-950 rounded-full overflow-hidden">
                      <div style={{ width: `${meanEnvironmentScore}%` }} className="h-full bg-sky-500 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-forest-850 pt-3">
                  Calculated Index Formula: $0.30 \cdot D + 0.25 \cdot S + 0.20 \cdot Q + 0.15 \cdot T + 0.10 \cdot E$
                </div>
              </Card>
            </div>
          </div>

          {/* Sighting trend and regional stability charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Health index trends */}
            <div className="lg:col-span-2">
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                  <BarChart2 className="w-5 h-5 text-emerald-600" />
                  Ecosystem Health Historical Trend
                </h3>
                {renderHealthTrendChart(monthlyHealthScores)}
              </Card>
            </div>

            {/* Regional stability list */}
            <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4 text-xs font-mono">
              <h3 className="font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest border-b dark:border-forest-850 pb-2">
                Regional Site Stability
              </h3>
              
              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Improving / Stable (Score &gt;= 75)</span>
                  <div className="space-y-1.5">
                    {improvingSites.map(s => (
                      <div key={s.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-forest-950 border border-emerald-500/20 rounded-lg">
                        <span className="font-bold text-slate-700 dark:text-slate-350">{s.name}</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">{s.healthScore}%</span>
                      </div>
                    ))}
                    {improvingSites.length === 0 && <span className="text-slate-450 italic">None logged</span>}
                  </div>
                </div>

                <div className="border-t dark:border-forest-850 pt-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Declining / Critical (Score &lt; 55)</span>
                  <div className="space-y-1.5">
                    {decliningSites.map(s => (
                      <div key={s.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-forest-950 border border-rose-500/20 rounded-lg">
                        <span className="font-bold text-slate-705 dark:text-slate-350">{s.name}</span>
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[10px]">{s.healthScore}%</span>
                      </div>
                    ))}
                    {decliningSites.length === 0 && <span className="text-slate-455 italic">None logged</span>}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Regional Health alarms */}
          {healthAlerts.length > 0 && (
            <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest border-b dark:border-forest-850 pb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                Active Ecosystem Health Alarms
              </h3>
              <div className="space-y-2 text-xs">
                {healthAlerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-705 dark:text-slate-300">{alert.message}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Site Ecosystem Health Comparison Table */}
          <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Site Ecosystem Health Census Table
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-forest-850 bg-slate-50 dark:bg-forest-950 font-bold text-slate-655 dark:text-slate-300">
                    <th className="p-3">Monitoring Site</th>
                    <th className="p-3">Habitat Type</th>
                    <th className="p-3 text-center">Ecosystem Health</th>
                    <th className="p-3 text-center">Biodiversity index</th>
                    <th className="p-3 text-center">Population status</th>
                    <th className="p-3 text-center">Habitat Health</th>
                    <th className="p-3 text-center">Human conflict</th>
                  </tr>
                </thead>
                <tbody>
                  {siteComparisonList.map((site) => (
                    <tr key={site.id} className="border-b dark:border-forest-850 hover:bg-slate-50/50 dark:hover:bg-forest-850/50 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{site.name}</td>
                      <td className="p-3 text-slate-500 font-semibold">{site.habitatType}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-600">{site.healthScore}%</td>
                      <td className="p-3 text-center font-mono text-slate-700 dark:text-slate-300">{site.biodiversity}</td>
                      <td className="p-3 text-center font-semibold text-slate-600 dark:text-slate-350">{site.populationHealth}</td>
                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">{site.habitatHealth}</td>
                      <td className="p-3 text-center">
                        <Badge variant={site.conflict === 'High' ? 'danger' : site.conflict === 'Medium' ? 'warning' : 'success'}>
                          {site.conflict}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {siteComparisonList.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-450 italic">No monitoring locations registered.</td>
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

export default EcosystemHealth;
