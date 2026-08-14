import React, { useState, useEffect } from 'react';
import { Compass, MapPin, AlertTriangle, ShieldCheck, Layers, Sprout, Info, Filter, RefreshCw, Activity } from 'lucide-react';
import { getMonitoringSites, getMonitoringSite } from '../api/monitoringSites';
import { getObservations } from '../api/observations';
import { getEcologicalReport } from '../api/ecological';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export const HabitatIntelligence = () => {
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [observations, setObservations] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');

  // Loaded reports for sites
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

      // Pre-fetch ecological reports for all sites to do side-by-side comparison
      const reports = {};
      await Promise.all(items.map(async (s) => {
        try {
          const reportData = await getEcologicalReport(s.id);
          reports[s.id] = reportData;
        } catch (e) {
          console.error(`Failed to load report for site ${s.id}`, e);
        }
      }));
      setSiteReports(reports);
    } catch (err) {
      console.error('Error loading habitat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Sites list
  const filteredSites = sites.filter(s => {
    const report = siteReports[s.id];
    if (selectedSite && s.id !== selectedSite) {
      return false;
    }
    if (selectedRiskFilter) {
      const conflict = report?.human_conflict_level || 'Low';
      if (selectedRiskFilter === 'High' && conflict !== 'High') return false;
      if (selectedRiskFilter === 'Low' && conflict !== 'Low' && conflict !== 'Medium') return false;
    }
    if (filterSpecies) {
      // Check if this site has observations of this species
      const hasSpecies = observations.some(o => 
        o.site_id === s.id && o.species?.toLowerCase().includes(filterSpecies.toLowerCase())
      );
      if (!hasSpecies) return false;
    }
    return true;
  });

  // Calculate dynamic average KPIs across filtered sites
  let totalSuitability = 0;
  let totalVegetation = 0;
  let healthySitesCount = 0;
  let criticalSitesCount = 0;
  let totalRichness = 0;

  filteredSites.forEach(s => {
    const r = siteReports[s.id];
    if (r) {
      totalSuitability += r.habitat_suitability_score || 0;
      totalVegetation += r.vegetation_density || 50;
      totalRichness += r.species_richness || 0;

      if (r.habitat_suitability_score >= 60) healthySitesCount++;
      else if (r.habitat_suitability_score < 50 || r.human_conflict_level === 'High') {
        criticalSitesCount++;
      }
    }
  });

  const count = filteredSites.length || 1;
  const avgSuitability = Math.round(totalSuitability / count);
  const avgVegetation = Math.round(totalVegetation / count);
  const avgRichness = (totalRichness / count).toFixed(1);

  // Active site detail panel calculations
  const activeSiteData = selectedSite ? sites.find(s => s.id === selectedSite) : sites[0];
  const activeReport = activeSiteData ? siteReports[activeSiteData.id] : null;

  // Habitat Quality grading circular ring gauge
  const renderCircularProgress = (score) => {
    const radius = 60;
    const strokeWidth = 10;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <defs>
            <linearGradient id="suitabilityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="dark:stroke-forest-950"
          />
          <circle
            stroke="url(#suitabilityGrad)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out drop-shadow-[0_2px_6px_rgba(16,185,129,0.3)]"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center leading-none">
          <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">
            {score}%
          </span>
          <span className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">SUITABILITY</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-forest-850 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600 animate-pulse" />
            Habitat Intelligence Center
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 font-semibold">
            Evaluate microclimate quality, environmental suitability ratings, vegetation densities, and spatial habitat conflict risks.
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
              Habitat Filters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Focus Monitoring Site</label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">All Monitoring Sites</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.habitat_type})</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Associated Species</label>
                <input
                  type="text"
                  placeholder="Filter species sightings..."
                  value={filterSpecies}
                  onChange={(e) => setFilterSpecies(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Conflict Risk Level</label>
                <select
                  value={selectedRiskFilter}
                  onChange={(e) => setSelectedRiskFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">All Risks</option>
                  <option value="High">High Human Conflict</option>
                  <option value="Low">Low / Stable Conflict</option>
                </select>
              </div>

              <div className="flex items-end text-[10px] text-slate-400 font-mono italic">
                Filtering scales and computes values across {filteredSites.length} matched locations.
              </div>
            </div>
          </Card>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-emerald-600 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Avg Suitability</span>
              <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{avgSuitability}%</span>
              <span className="text-[9px] text-slate-400 mt-1">Overall habitat suitability</span>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-teal-650 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Avg Vegetation Density</span>
              <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{avgVegetation}%</span>
              <span className="text-[9px] text-slate-400 mt-1">Canopy foliage density</span>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-blue-600 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Avg Species Richness</span>
              <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{avgRichness}</span>
              <span className="text-[9px] text-slate-400 mt-1">Mean species count per site</span>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-indigo-600 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Healthy Sites</span>
              <span className="text-2xl font-black font-outfit text-emerald-600 mt-2">{healthySitesCount}</span>
              <span className="text-[9px] text-slate-400 mt-1">Suitability index &gt;= 60%</span>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-rose-600 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Critical / Risk Sites</span>
              <span className="text-2xl font-black font-outfit text-rose-600 mt-2">{criticalSitesCount}</span>
              <span className="text-[9px] text-slate-400 mt-1">At-risk and conflict locations</span>
            </Card>
          </div>

          {/* Central Analytics layouts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Active site metrics summary */}
            <div className="space-y-6">
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-forest-850 pb-2">
                  Site Quality Profile
                </h3>

                {activeSiteData && activeReport ? (
                  <div className="space-y-5">
                    
                    {/* Ring gauge */}
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                      {renderCircularProgress(activeReport.habitat_suitability_score)}
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest font-mono">
                        {activeReport.habitat_health || 'Healthy'} Status
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-forest-850 pb-1.5">
                        <span className="text-slate-400">Habitat Class:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{activeSiteData.habitat_type}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-forest-850 pb-1.5">
                        <span className="text-slate-400">Vegetation Density:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{activeReport.vegetation_density || 50}%</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-forest-850 pb-1.5">
                        <span className="text-slate-400">Observation Density:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{activeReport.observation_density} logs</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-forest-850 pb-1.5">
                        <span className="text-slate-400">GPS Coordinates:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 font-mono text-[10px]">
                          {activeSiteData.latitude.toFixed(4)}, {activeSiteData.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 italic">Please select a site to view coordinates.</div>
                )}
              </Card>

              {/* Site Risk parameters */}
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-forest-850 pb-2">
                  Conflict & Risk Matrix
                </h3>

                {activeReport ? (
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Human Activity Conflict:</span>
                      <Badge variant={activeReport.human_conflict_level === 'High' ? 'danger' : activeReport.human_conflict_level === 'Medium' ? 'warning' : 'success'}>
                        {activeReport.human_conflict_level || 'Low'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Climate Impact Warning:</span>
                      <span className="font-semibold text-slate-705 dark:text-slate-350">{activeReport.climate_impact_warning || 'Stable'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Ecological Stability:</span>
                      <Badge variant={activeReport.ecological_stability === 'High' ? 'success' : 'warning'}>
                        {activeReport.ecological_stability || 'Medium'} Stability
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-455 italic">Select site to query details.</div>
                )}
              </Card>
            </div>

            {/* Column 2: Site Parameter comparison lists */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-forest-850 pb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Suitability Indices Matrix
                </h3>

                {activeReport ? (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-slate-455">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold">Shannon Diversity</span>
                      </div>
                      <div className="flex justify-between items-end pt-1">
                        <span className="text-2xl font-mono font-bold text-slate-850 dark:text-slate-200">{activeReport.biodiversity_index}</span>
                        <span className="text-[8px] text-slate-400 font-mono">Shannon index score</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-slate-455">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="font-bold">Threatened Species</span>
                      </div>
                      <div className="flex justify-between items-end pt-1">
                        <span className="text-2xl font-mono font-bold text-slate-850 dark:text-slate-200">{activeReport.threatened_species_count}</span>
                        <span className="text-[8px] text-slate-400 font-mono">Endangered classes</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-slate-455">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span className="font-bold">Predator-Prey Ratio</span>
                      </div>
                      <div className="flex justify-between items-end pt-1">
                        <span className="text-2xl font-mono font-bold text-slate-850 dark:text-slate-200">{activeReport.predator_prey_ratio}</span>
                        <span className="text-[8px] text-slate-400 font-mono">Equilibrium index</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-slate-455">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold">Species Richness</span>
                      </div>
                      <div className="flex justify-between items-end pt-1">
                        <span className="text-2xl font-mono font-bold text-slate-850 dark:text-slate-200">{activeReport.species_richness}</span>
                        <span className="text-[8px] text-slate-400 font-mono">Profile counts</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-450 italic">No report resolved.</div>
                )}
              </Card>

              {/* Site health comparison chart table */}
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest border-b dark:border-forest-850 pb-2">
                  Ecosystem Habitat Suitability by Site
                </h3>
                <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1 text-xs">
                  {sites.map(s => {
                    const r = siteReports[s.id];
                    const score = r?.habitat_suitability_score || 0;
                    return (
                      <div key={s.id} className="space-y-1">
                        <div className="flex justify-between text-slate-705 dark:text-slate-350">
                          <span className="font-bold">{s.name} ({s.habitat_type})</span>
                          <span className="font-mono font-bold text-slate-500">{score}% suitability</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-forest-950 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          {/* Habitat Intelligence by Site Detail Table */}
          <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Monitoring Locations Habitat Census
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-forest-850 bg-slate-50 dark:bg-forest-950 font-bold text-slate-655 dark:text-slate-300">
                    <th className="p-3">Site</th>
                    <th className="p-3">Habitat Classification</th>
                    <th className="p-3 text-center">Quality Score</th>
                    <th className="p-3 text-center">Vegetation Density</th>
                    <th className="p-3 text-center">Conflict Level</th>
                    <th className="p-3 text-center">Stability Rating</th>
                    <th className="p-3">Coordinates</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSites.map((site) => {
                    const r = siteReports[site.id];
                    return (
                      <tr key={site.id} className="border-b dark:border-forest-850 hover:bg-slate-50/50 dark:hover:bg-forest-850/50 transition-colors">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{site.name}</td>
                        <td className="p-3 text-slate-550 font-semibold">{site.habitat_type}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-600">{r?.habitat_suitability_score || 0}%</td>
                        <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-350">{r?.vegetation_density || 50}%</td>
                        <td className="p-3 text-center">
                          <Badge variant={r?.human_conflict_level === 'High' ? 'danger' : r?.human_conflict_level === 'Medium' ? 'warning' : 'success'}>
                            {r?.human_conflict_level || 'Low'}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={r?.ecological_stability === 'High' ? 'success' : 'warning'}>
                            {r?.ecological_stability || 'Medium'}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}</td>
                      </tr>
                    );
                  })}
                  {filteredSites.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-450 italic">No locations matched filters.</td>
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

export default HabitatIntelligence;
