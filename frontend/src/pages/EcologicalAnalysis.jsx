import React, { useState, useEffect } from 'react';
import { getObservations } from '../api/observations';
import { getMonitoringSites } from '../api/monitoringSites';
import { getSpeciesList } from '../api/species';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { 
  Sprout, 
  Compass, 
  ShieldAlert, 
  BarChart3, 
  TreePine, 
  Heart, 
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export const EcologicalAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [rawObservations, setRawObservations] = useState([]);
  const [sites, setSites] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);

  // Filters
  const [selectedSite, setSelectedSite] = useState('');
  const [searchSpecies, setSearchSpecies] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
    } catch (err) {
      console.error('Error loading ecological parameters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map site lookup
  const siteMap = {};
  sites.forEach(s => { siteMap[s.id] = s; });

  // Map species profile details
  const profileMap = {};
  speciesList.forEach(sp => {
    profileMap[sp.common_name.toLowerCase()] = sp;
  });

  // Filter Observations
  const filteredObs = rawObservations.filter(obs => {
    if (selectedSite && obs.site_id !== selectedSite) {
      return false;
    }
    if (searchSpecies && !obs.species?.toLowerCase().includes(searchSpecies.toLowerCase())) {
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

  // Calculate dynamic Shannon and Simpson Indices
  const speciesCounts = {};
  filteredObs.forEach(obs => {
    const sp = obs.species?.trim() || 'Unknown';
    speciesCounts[sp] = (speciesCounts[sp] || 0) + obs.count;
  });

  const totalAnimals = Object.values(speciesCounts).reduce((sum, val) => sum + val, 0);
  const richness = Object.keys(speciesCounts).length;

  let shannon = 0;
  let simpson = 0;
  let evenness = 0;

  if (totalAnimals > 0) {
    let sumPlogP = 0;
    let sumP2 = 0;
    Object.values(speciesCounts).forEach(count => {
      const p = count / totalAnimals;
      sumPlogP += p * Math.log(p);
      sumP2 += p ** 2;
    });

    shannon = parseFloat((-sumPlogP).toFixed(2));
    simpson = parseFloat((1 - sumP2).toFixed(2));
    evenness = richness > 1 ? parseFloat((shannon / Math.log(richness)).toFixed(2)) : 0.0;
  }

  // Stability classification
  const ecologicalStability = shannon > 1.5 ? 'High' : shannon > 0.8 ? 'Medium' : 'Low';

  // Species distribution breakdown
  const speciesDist = Object.entries(speciesCounts).map(([sp, count]) => {
    const pct = totalAnimals > 0 ? ((count / totalAnimals) * 100).toFixed(1) : 0;
    return {
      species: sp,
      count,
      percentage: pct
    };
  }).sort((a, b) => b.count - a.count);
  
  // Calculate average site stats for comparison
  const siteDensityBreakdown = sites.map(site => {
    const siteObs = filteredObs.filter(o => o.site_id === site.id);
    const siteTotal = siteObs.reduce((sum, o) => sum + o.count, 0);
    const siteSpecies = new Set(siteObs.map(o => o.species)).size;
    
    // Calculate shannon index for site
    const sCounts = {};
    siteObs.forEach(o => { sCounts[o.species] = (sCounts[o.species] || 0) + o.count; });
    let sShannon = 0;
    if (siteTotal > 0) {
      let sumP = 0;
      Object.values(sCounts).forEach(c => {
        const p = c / siteTotal;
        sumP += p * Math.log(p);
      });
      sShannon = parseFloat((-sumP).toFixed(2));
    }

    return {
      id: site.id,
      name: site.name,
      habitatType: site.habitat_type,
      totalCount: siteTotal,
      speciesCount: siteSpecies,
      shannon: sShannon,
      stability: sShannon > 1.5 ? 'High' : sShannon > 0.8 ? 'Medium' : 'Low'
    };
  }).sort((a, b) => b.totalCount - a.totalCount);

  // Group by month for Shannon index trend line
  const now = new Date();
  const monthsList = [];
  const monthlyShannon = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short' });
    monthsList.push({ label, dateStart: new Date(d.getFullYear(), d.getMonth(), 1), dateEnd: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59) });
  }

  monthsList.forEach(m => {
    const monthObs = filteredObs.filter(obs => {
      const oDate = new Date(obs.observed_at);
      return oDate >= m.dateStart && oDate <= m.dateEnd;
    });

    const mCounts = {};
    monthObs.forEach(o => { mCounts[o.species] = (mCounts[o.species] || 0) + o.count; });
    const mTotal = Object.values(mCounts).reduce((sum, val) => sum + val, 0);
    
    let mShannon = 0;
    if (mTotal > 0) {
      let sumP = 0;
      Object.values(mCounts).forEach(c => {
        const p = c / mTotal;
        sumP += p * Math.log(p);
      });
      mShannon = parseFloat((-sumP).toFixed(2));
    }
    monthlyShannon.push({ month: m.label, score: mShannon });
  });

  // Render a responsive Circular Progress Gauge
  const renderCircularGauge = (score, title, colorClass, strokeColor) => {
    const radius = 50;
    const strokeWidth = 10;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-white dark:bg-forest-900 rounded-2xl border border-slate-150 dark:border-forest-850">
        <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">{title}</span>
        <div className="relative flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              stroke="#e2e8f0"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="dark:stroke-forest-950"
            />
            {/* Foreground progress circle */}
            <circle
              stroke={strokeColor}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
              className={`transition-all duration-500 ease-out ${
                strokeColor === '#10b981' 
                  ? 'drop-shadow-[0_2px_5px_rgba(16,185,129,0.35)]' 
                  : 'drop-shadow-[0_2px_5px_rgba(244,63,94,0.35)]'
              }`}
            />
          </svg>
          <span className={`absolute text-base font-extrabold font-mono ${colorClass}`}>
            {score}%
          </span>
        </div>
      </div>
    );
  };

  // Render Shannon Trend Line SVG Chart
  const renderShannonTrendChart = (chartData) => {
    if (!chartData || chartData.length === 0) return null;
    
    const width = 500;
    const height = 150;
    const padding = 25;
    
    const maxVal = Math.max(...chartData.map(d => d.score), 2);
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
            <linearGradient id="shannonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" className="dark:stroke-forest-850" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" className="dark:stroke-forest-800" strokeWidth="1" />
          
          {areaD && <path d={areaD} fill="url(#shannonGrad)" />}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
          
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
              <text x={p.x} y={p.y - 7} fontSize="7" textAnchor="middle" className="fill-slate-700 font-bold dark:fill-slate-300">
                {p.score}
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
            <Sprout className="w-7 h-7 text-emerald-600 animate-pulse" />
            AI Ecological Intelligence
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-semibold">
            Evaluate biodiversity indices, dominant species configurations, and ecological stability matrices across monitoring sites.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={RefreshCw} onClick={loadData}>
            Refresh
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
              Ecological Filter Options
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
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
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Species Filter</label>
                <input
                  type="text"
                  placeholder="Filter species..."
                  value={searchSpecies}
                  onChange={(e) => setSearchSpecies(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                />
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

          {/* Gaugemeter row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {renderCircularGauge(
              Math.round(shannon * 30 > 100 ? 100 : shannon * 30),
              "Shannon Diversity Index",
              "text-indigo-600 dark:text-indigo-400",
              "#6366f1"
            )}
            
            {renderCircularGauge(
              Math.round(simpson * 100),
              "Simpson Index of Diversity",
              "text-emerald-600 dark:text-emerald-400",
              "#10b981"
            )}

            {/* Biodiversity overview index stats */}
            <Card className="p-5 flex flex-col justify-between bg-white dark:bg-forest-900 border border-slate-150 dark:border-forest-850 shadow-sm text-xs">
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono border-b dark:border-forest-850 pb-1">Biodiversity Stats</span>
                <div className="flex justify-between">
                  <span className="text-slate-450">Species Richness:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{richness} species</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Shannon Index (H'):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{shannon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Simpson Index (1-D):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{simpson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Pielou's Evenness (J'):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{evenness}</span>
                </div>
              </div>
            </Card>

            {/* Local ecological conditions */}
            <Card className="p-5 flex flex-col justify-between bg-white dark:bg-forest-900 border border-slate-150 dark:border-forest-850 shadow-sm text-xs">
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono border-b dark:border-forest-850 pb-1">Stability Indicators</span>
                <div className="flex justify-between">
                  <span className="text-slate-450">Ecosystem Stability:</span>
                  <Badge variant={ecologicalStability === 'High' ? 'success' : ecologicalStability === 'Medium' ? 'warning' : 'danger'}>
                    {ecologicalStability} Stability
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Sighting density rate:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {sites.length > 0 ? (filteredObs.length / sites.length).toFixed(1) : 0} logs/site
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Total observed animals:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{totalAnimals} units</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Central Analytics layouts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Shannon diversity trend chart */}
            <div className="lg:col-span-2">
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-indigo-650" />
                  Monthly Shannon Wiener Index Trend
                </h3>
                {filteredObs.length > 0 ? (
                  renderShannonTrendChart(monthlyShannon)
                ) : (
                  <div className="text-center py-12 text-slate-450 italic text-xs">Insufficient data for trend analysis.</div>
                )}
              </Card>
            </div>

            {/* Species composition list */}
            <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest border-b dark:border-forest-850 pb-2">
                Ecosystem Species Composition
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Dominant species (top sighted)</span>
                  {speciesDist.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-forest-950 border rounded-lg">
                      <span className="font-bold text-slate-700 dark:text-slate-350">{item.species}</span>
                      <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                  {speciesDist.length === 0 && <span className="text-slate-450 italic">None logged</span>}
                </div>

                <div className="space-y-2 border-t dark:border-forest-850 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rare / Vulnerable Sightings</span>
                  {speciesDist.filter(s => s.count <= 2).slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-forest-950 border rounded-lg">
                      <span className="font-bold text-slate-700 dark:text-slate-350">{item.species}</span>
                      <span className="font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.count} logs
                      </span>
                    </div>
                  ))}
                  {speciesDist.filter(s => s.count <= 2).length === 0 && <span className="text-slate-450 italic">None cataloged</span>}
                </div>
              </div>
            </Card>
          </div>

          {/* Site Ecological Comparison Grid */}
          <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Site Ecological Comparison Table
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-forest-850 bg-slate-50 dark:bg-forest-950 font-bold text-slate-655 dark:text-slate-300">
                    <th className="p-3">Monitoring Site</th>
                    <th className="p-3">Habitat Type</th>
                    <th className="p-3 text-center">Detections Count</th>
                    <th className="p-3 text-center">Species Count</th>
                    <th className="p-3 text-center">Shannon Index (H')</th>
                    <th className="p-3 text-center">Stability Index</th>
                  </tr>
                </thead>
                <tbody>
                  {siteDensityBreakdown.map((site, idx) => (
                    <tr key={idx} className="border-b dark:border-forest-850 hover:bg-slate-50/50 dark:hover:bg-forest-850/50 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{site.name}</td>
                      <td className="p-3 text-slate-500 font-semibold">{site.habitatType}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{site.totalCount}</td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-350">{site.speciesCount}</td>
                      <td className="p-3 text-center font-mono font-bold text-indigo-650">{site.shannon}</td>
                      <td className="p-3 text-center">
                        <Badge variant={site.stability === 'High' ? 'success' : site.stability === 'Medium' ? 'warning' : 'danger'}>
                          {site.stability}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {siteDensityBreakdown.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-450 italic">No monitoring sites cataloged.</td>
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

export default EcologicalAnalysis;
