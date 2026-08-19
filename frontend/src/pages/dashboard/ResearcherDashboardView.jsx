import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Activity, SlidersHorizontal, MapPin, Compass, Search, Filter, RefreshCw, ChevronRight, Milestone, Camera, Volume2, BookOpen, Bell, Map, TrendingUp, Sprout, Shield, User, ArrowUpRight, Heart } from 'lucide-react';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import AreaChart from '../../components/charts/AreaChart';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import { formatDateTime } from '../../utils/formatters';

export const ResearcherDashboardView = ({ metrics, fetchMetrics, observations, sites, speciesList, cameras = [], sensors = [], loading }) => {
  const [searchSpecies, setSearchSpecies] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedHabitat, setSelectedHabitat] = useState('');

  // Apply filters to observations
  const filteredObs = observations.filter(o => {
    if (searchSpecies && !o.species?.toLowerCase().includes(searchSpecies.toLowerCase())) return false;
    if (selectedSite && o.site_id !== selectedSite) return false;
    if (selectedHabitat) {
      const site = sites.find(s => s.id === o.site_id);
      if (!site || site.habitat_type !== selectedHabitat) return false;
    }
    return true;
  });

  // Calculate dynamic stats
  const totalObsCount = filteredObs.length;
  const distinctSpecies = Array.from(new Set(filteredObs.map(o => o.species).filter(Boolean)));
  const speciesSightedCount = distinctSpecies.length;
  const totalAnimalsSighted = filteredObs.reduce((sum, o) => sum + (o.count || 0), 0);

  // Dynamic Shannon Wiener Index Calculation
  // H' = - sum(p_i * ln(p_i))
  let shannonIndex = 0;
  if (totalAnimalsSighted > 0 && speciesSightedCount > 0) {
    const speciesCounts = {};
    filteredObs.forEach(o => {
      if (o.species) {
        speciesCounts[o.species] = (speciesCounts[o.species] || 0) + (o.count || 0);
      }
    });
    let sum = 0;
    Object.values(speciesCounts).forEach(cnt => {
      const p_i = cnt / totalAnimalsSighted;
      if (p_i > 0) {
        sum += p_i * Math.log(p_i);
      }
    });
    shannonIndex = parseFloat((-sum).toFixed(2));
  }

  // Filtered Chart data compilation
  // Species breakdown
  const spCounts = {};
  filteredObs.forEach(o => {
    if (o.species) spCounts[o.species] = (spCounts[o.species] || 0) + (o.count || 0);
  });
  const speciesBreakdown = Object.entries(spCounts)
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Habitat distribution
  const habCounts = {};
  filteredObs.forEach(o => {
    const site = sites.find(s => s.id === o.site_id);
    const hab = site?.habitat_type || 'Unknown';
    habCounts[hab] = (habCounts[hab] || 0) + 1;
  });
  const habitatDistribution = Object.entries(habCounts).map(([habitat_type, count]) => ({
    habitat_type,
    count
  }));

  // Sighting timeline
  const dayCounts = {};
  filteredObs.forEach(o => {
    if (o.observed_at) {
      const day = o.observed_at.split('T')[0];
      dayCounts[day] = (dayCounts[day] || 0) + (o.count || 0);
    }
  });
  const sightingTimeline = Object.entries(dayCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);

  return (
    <div className="space-y-6">
      
      {/* Filters Row */}
      <Card className="p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase text-slate-455 tracking-wider">
          <Filter className="w-4.5 h-4.5 text-emerald-600" />
          Filter Scientific Context
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Search Species</label>
            <input
              type="text"
              placeholder="Type species name..."
              value={searchSpecies}
              onChange={(e) => setSearchSpecies(e.target.value)}
              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Monitoring Site</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Sites</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Habitat Type</label>
            <select
              value={selectedHabitat}
              onChange={(e) => setSelectedHabitat(e.target.value)}
              className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Habitats</option>
              <option value="Forest">Forest</option>
              <option value="Grassland">Grassland</option>
              <option value="Wetland">Wetland</option>
              <option value="Desert">Desert</option>
              <option value="Tundra">Tundra</option>
            </select>
          </div>

          <div className="flex items-end justify-between">
            <span className="text-[9px] font-mono text-slate-400 italic">
              Matching {totalObsCount} observations
            </span>
            <Button variant="outline" size="sm" onClick={fetchMetrics} icon={RefreshCw}>
              Reload
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-emerald-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Total Sightings</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{totalObsCount}</span>
          <span className="text-[9px] text-slate-400 mt-1">Logged occurrences</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-blue-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Species Sighted</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{speciesSightedCount}</span>
          <span className="text-[9px] text-slate-400 mt-1">Distinct species in filter</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-indigo-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Richness Index</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{speciesSightedCount}</span>
          <span className="text-[9px] text-slate-400 mt-1">Observed species richness</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-purple-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Observed Animal Count</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{totalAnimalsSighted}</span>
          <span className="text-[9px] text-slate-400 mt-1">Sum of observed counts</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-teal-650 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Biodiversity Index</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{shannonIndex || 'N/A'}</span>
          <span className="text-[9px] text-slate-400 mt-1">Shannon-Wiener (H') index</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-rose-500 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Monitoring Sites</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{sites.length}</span>
          <span className="text-[9px] text-slate-400 mt-1">Total coordinates online</span>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-emerald-600" />
            Filtered Sighting Trends
          </h3>
          <AreaChart data={sightingTimeline} height={200} />
        </div>

        <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Compass className="w-4.5 h-4.5 text-blue-600" />
            Observation Habitat Distribution
          </h3>
          {habitatDistribution.length > 0 ? (
            <PieChart data={habitatDistribution} />
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-slate-400 italic">No habitat data available.</div>
          )}
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4.5 h-4.5 text-indigo-650" />
            Sighting Abundance per Species
          </h3>
          {speciesBreakdown.length > 0 ? (
            <BarChart data={speciesBreakdown} />
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-slate-400 italic">No species data found in observations.</div>
          )}
        </div>

        {/* Scientific Module Diagnostics */}
        <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4.5 h-4.5 text-indigo-650" />
              Scientific Diagnostics
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-forest-955 rounded-xl border">
                <span className="font-semibold text-slate-750">Taxonomy Database</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-805">Active</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-forest-955 rounded-xl border">
                <span className="font-semibold text-slate-750">Species Profiles</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-805">{speciesList.length} Registered</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-forest-955 rounded-xl border">
                <span className="font-semibold text-slate-750">Shannon Entropy</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-805">H' = {shannonIndex || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-forest-800 pt-4 mt-6 text-center text-[10px] text-slate-400 font-mono">
            Researcher Scientific Viewport
          </div>
        </Card>
      </div>

      {/* QUICK ACTIONS COMMAND CENTER */}
      <div className="space-y-4 border-t pt-6 border-slate-200 dark:border-forest-850">
        <h3 className="text-sm font-bold font-outfit text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          Researcher Command Center
        </h3>
        
        {/* FIELD MONITORING */}
        <div className="space-y-2">
          <div className="category-header">
            <h4 className="category-title">FIELD MONITORING</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link to="/surveys" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Milestone className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">View Surveys</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Active scientific research surveys</span>
                </div>
              </div>
            </Link>
            <Link to="/monitoring-sites" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <MapPin className="premium-icon" />
                  </div>
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{sites.length} Online</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Monitoring Sites</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Inspect habitat locations coordinates</span>
                </div>
              </div>
            </Link>
            <Link to="/camera-traps" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Camera className="premium-icon" />
                  </div>
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{cameras.length} Active</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Camera Traps</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Verify video trap battery statuses</span>
                </div>
              </div>
            </Link>
            <Link to="/audio-sensors" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Volume2 className="premium-icon" />
                  </div>
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{sensors.length} Active</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Audio Sensors</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Acoustic sensors monitoring nodes</span>
                </div>
              </div>
            </Link>
            <Link to="/observations" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Eye className="premium-icon" />
                  </div>
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{observations.length} Logs</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Observations</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Browse dynamic raw sightings records</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* AI and INTELLIGENCE */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">AI and INTELLIGENCE</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/species-recognition" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Camera className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Wildlife Image Analysis</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Run YOLOv8 object detections</span>
                </div>
              </div>
            </Link>
            <Link to="/audio-analysis" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Volume2 className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Wildlife Audio Analysis</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Classify acoustic spectrogram sounds</span>
                </div>
              </div>
            </Link>
            <Link to="/species" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Eye className="premium-icon" />
                  </div>
                  <span className="absolute top-3 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-955/65 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">{speciesList.length} Species</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Species Intelligence</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Explore global profiles taxonomy</span>
                </div>
              </div>
            </Link>
            <Link to="/research-trends" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <TrendingUp className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Population Intelligence</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Demographics regressions and trends</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ECOLOGY and CONSERVATION */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">ECOLOGY and CONSERVATION</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/ecological" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Sprout className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Biodiversity Index</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Shannon-Wiener and Simpson parameters</span>
                </div>
              </div>
            </Link>
            <Link to="/habitat" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Compass className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Habitat Intelligence</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Ecological suitability conditions</span>
                </div>
              </div>
            </Link>
            <Link to="/ecosystem-health" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Heart className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Wildlife Health</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Ecosystem health scoring diagnostic</span>
                </div>
              </div>
            </Link>
            <Link to="/conservation" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Shield className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Conservation Priorities</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Formulate recovery plans and targets</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* MAPS, ALERTS and REPORTING */}
        <div className="space-y-2 pt-2">
          <div className="category-header">
            <h4 className="category-title">MAPS, ALERTS and REPORTING</h4>
            <div className="category-line" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/map" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Map className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">GIS Wildlife Map</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Tactical spatial maps viewer</span>
                </div>
              </div>
            </Link>
            <Link to="/notifications" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <Bell className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Notifications and Alerts</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Alert feeds for endangered sightings</span>
                </div>
              </div>
            </Link>
            <Link to="/reports" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <BookOpen className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">Generate Reports</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Export PDF templates and Excel sheets</span>
                </div>
              </div>
            </Link>
            <Link to="/profile" className="group premium-card">
              <div className="premium-card-glow" />
              <div>
                <div className="flex justify-between items-start">
                  <div className="premium-icon-container">
                    <User className="premium-icon" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-xs text-slate-855 dark:text-slate-250 block">My Profile Settings</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Manage names and credentials</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Observation Logs Table */}
      <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 font-outfit text-base">
          Recent Observed Sightings
        </h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-forest-955 text-slate-455 uppercase font-mono text-[10px] border-b border-slate-100 dark:border-forest-850">
                <th className="py-2.5 px-4">Observation ID</th>
                <th className="py-2.5 px-4">Species</th>
                <th className="py-2.5 px-4">Count</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-850">
              {filteredObs.slice(0, 5).map((obs) => (
                <tr key={obs.id} className="hover:bg-slate-50/50 dark:hover:bg-forest-850/20 text-slate-655 dark:text-slate-350">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{obs.id.slice(0, 8)}...</td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{obs.species}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-300">{obs.count}</td>
                  <td className="py-3 px-4 text-slate-455">{obs.observed_at ? formatDateTime(obs.observed_at) : 'N/A'}</td>
                  <td className="py-3 px-4 text-center">
                    <Link to={`/observations/${obs.id}`}>
                      <button className="text-emerald-650 hover:text-emerald-700 font-bold flex items-center justify-center gap-1 mx-auto text-[11px]">
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredObs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">No matching observations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ResearcherDashboardView;
