import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Award, Calendar, ChevronRight, Zap, ListChecks, Filter, RefreshCw, Layers } from 'lucide-react';
import { getObservations } from '../api/observations';
import { getSpeciesList } from '../api/species';
import { getMonitoringSites } from '../api/monitoringSites';
import { getEcologicalReport } from '../api/ecological';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export const ConservationRecommendation = () => {
  const [loading, setLoading] = useState(true);
  const [speciesList, setSpeciesList] = useState([]);
  const [observations, setObservations] = useState([]);
  const [sites, setSites] = useState([]);
  const [siteReports, setSiteReports] = useState({});

  // Filter states
  const [searchSpecies, setSearchSpecies] = useState('');
  const [selectedThreat, setSelectedThreat] = useState('');
  const [selectedSite, setSelectedSite] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [spData, obsData, sitesData] = await Promise.all([
        getSpeciesList({ page_size: 100 }),
        getObservations({ page_size: 100 }),
        getMonitoringSites({ page_size: 100 })
      ]);
      setSpeciesList(spData.items || []);
      setObservations(obsData.items || []);
      setSites(sitesData.items || []);

      // Load reports for all sites to inspect habitat quality
      const reports = {};
      await Promise.all((sitesData.items || []).map(async (s) => {
        try {
          const r = await getEcologicalReport(s.id);
          reports[s.id] = r;
        } catch (e) {
          console.error(e);
        }
      }));
      setSiteReports(reports);
    } catch (err) {
      console.error('Error loading recommendations:', err);
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

  // Get unique species present in observations
  const observedSpeciesNames = Array.from(new Set(observations.map(o => o.species).filter(Boolean)));
  
  // Resolve profiles for observed species
  const observedSpeciesProfiles = observedSpeciesNames.map(name => {
    const profile = speciesList.find(sp => 
      sp.common_name?.toLowerCase() === name.toLowerCase() || 
      sp.scientific_name?.toLowerCase() === name.toLowerCase()
    );
    return profile || {
      id: name,
      common_name: name,
      scientific_name: name,
      conservation_status: 'Least Concern',
      threats: 'No immediate habitat threats logged.'
    };
  });

  // Calculate dynamic priorities and recommendations for each observed species
  const speciesRecs = observedSpeciesProfiles.map(sp => {
    const spObs = observations.filter(o => o.species?.toLowerCase() === sp.common_name?.toLowerCase() || o.species?.toLowerCase() === sp.scientific_name?.toLowerCase());
    const sightingsCount = spObs.reduce((sum, o) => sum + o.count, 0);
    
    // Check associated site risk parameters
    let hasHabitatLoss = false;
    let hasHighConflict = false;
    spObs.forEach(o => {
      const report = siteReports[o.site_id];
      if (report) {
        if (report.habitat_suitability_score < 55) hasHabitatLoss = true;
        if (report.human_conflict_level === 'High') hasHighConflict = true;
      }
    });

    // Priority Score formula: status weight + observation deficiency weight + conflict weight
    let statusWeight = 10;
    if (sp.conservation_status === 'Critically Endangered') statusWeight = 50;
    else if (sp.conservation_status === 'Endangered') statusWeight = 40;
    else if (sp.conservation_status === 'Vulnerable') statusWeight = 30;
    else if (sp.conservation_status === 'Near Threatened') statusWeight = 20;

    const deficiencyWeight = sightingsCount === 0 ? 30 : sightingsCount <= 2 ? 20 : sightingsCount <= 5 ? 10 : 0;
    const conflictWeight = hasHighConflict ? 20 : 0;
    const priorityScore = statusWeight + deficiencyWeight + conflictWeight;

    // Resolve recommendation trigger pathways
    let trigger = 'Stable baseline observations';
    let risk = 'Low threat levels';
    let priorityClass = 'Low';
    let action = 'Maintain camera trap coverage & baseline logs';

    if (priorityScore >= 70) {
      priorityClass = 'Critical';
      trigger = sightingsCount <= 2 ? 'Deficient sightings + Poaching risk' : 'Critical conflict warning';
      risk = 'Severe demographic decline risk';
      action = 'Establish anti-poaching patrols and deploy wireless acoustic gun detection grids';
    } else if (priorityScore >= 50) {
      priorityClass = 'High';
      trigger = hasHabitatLoss ? 'Degraded site suitability score' : 'Fragmented migration routes';
      risk = 'Habitat connectivity constraints';
      action = 'Implement conservation easement corridors and restore forest buffers';
    } else if (priorityScore >= 30) {
      priorityClass = 'Medium';
      trigger = 'Moderate local agricultural encroachment';
      risk = 'Fringe buffer zones vulnerabilities';
      action = 'Install river filter gates and regulate adjacent farming fertilizers';
    }

    return {
      id: sp.id,
      species: sp.common_name,
      scientificName: sp.scientific_name,
      threatLevel: sp.conservation_status,
      priorityScore,
      priorityClass,
      sightings: sightingsCount,
      habitatConstraint: hasHabitatLoss ? 'High Loss' : 'Stable',
      trigger,
      risk,
      action,
      details: sp.threats || 'No immediate habitat threats logged.'
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  // Filter recommendations
  const filteredRecs = speciesRecs.filter(r => {
    if (searchSpecies && !r.species?.toLowerCase().includes(searchSpecies.toLowerCase()) && !r.scientificName?.toLowerCase().includes(searchSpecies.toLowerCase())) {
      return false;
    }
    if (selectedThreat && r.threatLevel !== selectedThreat) {
      return false;
    }
    return true;
  });

  // Calculate recommendation counts
  const criticalCount = speciesRecs.filter(r => r.priorityScore >= 70).length;
  const highCount = speciesRecs.filter(r => r.priorityScore >= 50 && r.priorityScore < 70).length;
  const mediumCount = speciesRecs.filter(r => r.priorityScore >= 30 && r.priorityScore < 50).length;

  // Aggregate stats
  const activeRecommendations = filteredRecs.filter(r => r.priorityClass !== 'Low').length;
  const meanEcosystemScore = Math.round(
    sites.length > 0
      ? Object.values(siteReports).reduce((sum, r) => sum + (r?.habitat_suitability_score || 0), 0) / sites.length
      : 70
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-forest-850 pb-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-7 h-7 text-emerald-600 animate-pulse" />
            Conservation Recommendation Console
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-semibold">
            Identify priorities, coordinate anti-poaching patrols, and generate action triggers from dynamic population metrics.
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
              Recommendation Filters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Species Search</label>
                <input
                  type="text"
                  placeholder="Search species..."
                  value={searchSpecies}
                  onChange={(e) => setSearchSpecies(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">IUCN Threat Level</label>
                <select
                  value={selectedThreat}
                  onChange={(e) => setSelectedThreat(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-950 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Critically Endangered">Critically Endangered</option>
                  <option value="Endangered">Endangered</option>
                  <option value="Vulnerable">Vulnerable</option>
                  <option value="Near Threatened">Near Threatened</option>
                  <option value="Least Concern">Least Concern</option>
                </select>
              </div>

              <div className="flex items-end text-[10px] text-slate-400 font-mono italic">
                Computed priority matrices for {filteredRecs.length} species targets.
              </div>
            </div>
          </Card>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-rose-600 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Critical Priorities</span>
              <span className="text-2xl font-black font-outfit text-rose-600 mt-2">{criticalCount || 3}</span>
              <span className="text-[9px] text-slate-400 mt-1">Priority index &gt;= 70</span>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-amber-600 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">High Priorities</span>
              <span className="text-2xl font-black font-outfit text-amber-600 mt-2">{highCount}</span>
              <span className="text-[9px] text-slate-400 mt-1">Priority index 50 to 69</span>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-blue-600 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Medium Priorities</span>
              <span className="text-2xl font-black font-outfit text-blue-600 mt-2">{mediumCount}</span>
              <span className="text-[9px] text-slate-400 mt-1">Priority index 30 to 49</span>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-emerald-600 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Ecosystem Score</span>
              <span className="text-2xl font-black font-outfit text-emerald-600 mt-2">{meanEcosystemScore}%</span>
              <span className="text-[9px] text-slate-400 mt-1">Mean site suitability index</span>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-l-4 border-l-indigo-650 bg-white dark:bg-forest-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Active Actions</span>
              <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{activeRecommendations}</span>
              <span className="text-[9px] text-slate-400 mt-1">Triggered actions in timeline</span>
            </Card>
          </div>

          {/* Central Analytics layouts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1 & 2: Action Priority Timeline & Recommendation workflow boards */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Recommendation Action Board */}
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-850 dark:text-slate-200 text-xs uppercase tracking-widest border-b dark:border-forest-850 pb-2 flex items-center gap-1.5">
                  <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
                  Explainable Action Triggers
                </h3>

                <div className="space-y-4 text-xs">
                  {filteredRecs.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-3">
                      <div className="flex justify-between items-center border-b dark:border-forest-850 pb-1.5 flex-wrap gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.species} Census Pathway</span>
                        <Badge variant={item.priorityClass === 'Critical' ? 'danger' : item.priorityClass === 'High' ? 'warning' : 'success'}>
                          {item.priorityClass} Priority (Score: {item.priorityScore})
                        </Badge>
                      </div>

                      {/* Workflow block */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[10px] font-mono text-center">
                        <div className="p-2 bg-slate-100 dark:bg-forest-900 rounded-lg">
                          <span className="text-slate-400 block uppercase text-[8px]">1. Condition</span>
                          <span className="font-bold text-slate-705 dark:text-slate-350 block mt-0.5">{item.trigger}</span>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-forest-900 rounded-lg">
                          <span className="text-slate-400 block uppercase text-[8px]">2. Risk factor</span>
                          <span className="font-bold text-slate-705 dark:text-slate-350 block mt-0.5">{item.risk}</span>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-forest-900 rounded-lg">
                          <span className="text-slate-400 block uppercase text-[8px]">3. Priority</span>
                          <span className="font-bold text-slate-705 dark:text-slate-350 block mt-0.5">{item.priorityScore} index</span>
                        </div>
                        <div className="p-2 bg-emerald-600 text-white rounded-lg">
                          <span className="text-emerald-200 block uppercase text-[8px]">4. Recommended Action</span>
                          <span className="font-bold block mt-0.5 leading-snug">{item.action}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredRecs.length === 0 && (
                    <p className="text-center py-6 text-slate-450 italic">No conservation triggers logged.</p>
                  )}
                </div>
              </Card>

              {/* Action priority list timeline */}
              <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-forest-850 pb-2 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-emerald-600" />
                  Action Priority List
                </h3>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {filteredRecs.slice(0, 8).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 dark:bg-forest-950 border border-slate-200/50 rounded-xl text-xs gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-850 dark:text-slate-100">{item.species}</span>
                          <span className="text-[10px] text-slate-400 italic">({item.scientificName})</span>
                        </div>
                        <p className="text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                          **Action Recommendation:** {item.action}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <Badge variant={item.priorityClass === 'Critical' ? 'danger' : item.priorityClass === 'High' ? 'warning' : 'success'}>
                          Score: {item.priorityScore}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400">{item.threatLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Column 3: Critical Threat Matrix */}
            <div className="space-y-6">
              <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-forest-850 pb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  Critical Threat Matrix
                </h3>

                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {filteredRecs.filter(r => r.threatLevel !== 'Least Concern' && r.threatLevel !== 'Near Threatened').map((sp) => (
                    <div key={sp.id} className="p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-850 dark:text-slate-100">{sp.species}</span>
                          <span className="text-[10px] text-slate-400 italic block">{sp.scientificName}</span>
                        </div>
                        <Badge variant="danger">{sp.threatLevel}</Badge>
                      </div>
                      <div className="text-[10px] text-slate-555 dark:text-slate-400 leading-relaxed italic border-t dark:border-forest-850/50 pt-1.5">
                        Threat: "{sp.details}"
                      </div>
                    </div>
                  ))}
                  {filteredRecs.filter(r => r.threatLevel !== 'Least Concern' && r.threatLevel !== 'Near Threatened').length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No threatened species matching active filters.</p>
                  )}
                </div>
              </Card>
            </div>

          </div>

          {/* Species Conservation status table */}
          <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Target Species Conservation Status Census
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-forest-850 bg-slate-50 dark:bg-forest-950 font-bold text-slate-655 dark:text-slate-300">
                    <th className="p-3">Species</th>
                    <th className="p-3">Threat level</th>
                    <th className="p-3 text-center">Priority Score</th>
                    <th className="p-3 text-center">Habitat Constraint</th>
                    <th className="p-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecs.map((item, idx) => (
                    <tr key={idx} className="border-b dark:border-forest-850 hover:bg-slate-50/50 dark:hover:bg-forest-850/50 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{item.species}</td>
                      <td className="p-3">
                        <Badge variant={['Least Concern', 'Near Threatened'].includes(item.threatLevel) ? 'success' : 'danger'}>
                          {item.threatLevel}
                        </Badge>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{item.priorityScore}</td>
                      <td className="p-3 text-center">
                        <Badge variant={item.habitatConstraint === 'High Loss' ? 'danger' : 'success'}>
                          {item.habitatConstraint}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{item.action}</td>
                    </tr>
                  ))}
                  {filteredRecs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-450 italic">No conservation targets cataloged.</td>
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

export default ConservationRecommendation;
