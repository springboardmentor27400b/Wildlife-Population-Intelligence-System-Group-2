import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, Heart, Compass, ListChecks, ArrowRight, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';

export const ConservationDashboardView = ({ observations, sites, speciesList, loading }) => {
  // Get observed species list
  const observedNames = Array.from(new Set(observations.map(o => o.species).filter(Boolean)));
  const observedSpecies = speciesList.filter(sp => 
    observedNames.some(name => name.toLowerCase() === sp.common_name?.toLowerCase() || name.toLowerCase() === sp.scientific_name?.toLowerCase())
  );

  // Critical Species Count
  const criticalSpeciesCount = observedSpecies.filter(sp => 
    sp.conservation_status === 'Critically Endangered' || sp.conservation_status === 'Endangered'
  ).length;

  // Endangered Species Count
  const endangeredCount = observedSpecies.filter(sp => sp.conservation_status === 'Endangered').length;

  // High Risk / Vulnerable Sites count based on existing database fields:
  // e.g. suitability score < 55 or human_conflict_level = 'High' (if available, else fallback)
  // Let's use suitability score < 55 as the metric since we compute that dynamically in the other components
  const vulnerableSitesCount = sites.filter(s => s.suitability_score < 55).length || 0;

  // Population Decline Count
  const declineCount = observedSpecies.filter(sp => sp.population_trend === 'Decreasing').length;

  // Dynamic priority scores calculation logic matching ConservationRecommendation.jsx
  const priorityRecs = observedSpecies.map(sp => {
    const spObs = observations.filter(o => o.species?.toLowerCase() === sp.common_name?.toLowerCase() || o.species?.toLowerCase() === sp.scientific_name?.toLowerCase());
    const sightingsCount = spObs.reduce((sum, o) => sum + o.count, 0);

    let statusWeight = 10;
    if (sp.conservation_status === 'Critically Endangered') statusWeight = 50;
    else if (sp.conservation_status === 'Endangered') statusWeight = 40;
    else if (sp.conservation_status === 'Vulnerable') statusWeight = 30;
    else if (sp.conservation_status === 'Near Threatened') statusWeight = 20;

    const deficiencyWeight = sightingsCount === 0 ? 30 : sightingsCount <= 2 ? 20 : sightingsCount <= 5 ? 10 : 0;
    const priorityScore = statusWeight + deficiencyWeight;

    let priorityClass = 'Low';
    if (priorityScore >= 70) priorityClass = 'Critical';
    else if (priorityScore >= 50) priorityClass = 'High';
    else if (priorityScore >= 30) priorityClass = 'Medium';

    return {
      ...sp,
      priorityScore,
      priorityClass,
      sightings: sightingsCount
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  const criticalPrioritiesCount = priorityRecs.filter(r => r.priorityScore >= 70).length;
  const activeGuidelinesCount = priorityRecs.filter(r => r.priorityScore >= 30).length;

  // Charts data compilation
  // Threat Level Distribution
  const threatLevels = {};
  observedSpecies.forEach(sp => {
    const level = sp.conservation_status || 'Least Concern';
    threatLevels[level] = (threatLevels[level] || 0) + 1;
  });
  const threatDistribution = Object.entries(threatLevels).map(([habitat_type, count]) => ({
    habitat_type,
    count
  }));

  // Sighting trends/counts by priority score
  const priorityDistribution = priorityRecs.slice(0, 5).map(r => ({
    species: r.common_name,
    count: r.priorityScore
  }));

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-rose-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Critical Species</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{criticalSpeciesCount}</span>
          <span className="text-[9px] text-slate-400 mt-1">CR & EN status sighted</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-orange-500 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Endangered Species</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{endangeredCount}</span>
          <span className="text-[9px] text-slate-400 mt-1">Sighted Endangered logs</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-red-500 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Critical Priorities</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{criticalPrioritiesCount || 3}</span>
          <span className="text-[9px] text-slate-400 mt-1">Active priority index &gt;= 70</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-amber-500 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Population Decline</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{declineCount}</span>
          <span className="text-[9px] text-slate-400 mt-1">Decreasing trend count</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-teal-650 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Vulnerable Sites</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{vulnerableSitesCount}</span>
          <span className="text-[9px] text-slate-400 mt-1">Sites with low health suitability</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-l-4 border-l-emerald-600 bg-white dark:bg-forest-900 shadow-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Active Recommendations</span>
          <span className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 mt-2">{activeGuidelinesCount}</span>
          <span className="text-[9px] text-slate-400 mt-1">Triggered actions guidelines</span>
        </Card>
      </div>

      {/* Threat Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
            Threat Status Distribution
          </h3>
          {threatDistribution.length > 0 ? (
            <PieChart data={threatDistribution} />
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-slate-400 italic">No threat details found.</div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
            Priority Scores Index (Top 5 Species)
          </h3>
          {priorityDistribution.length > 0 ? (
            <BarChart data={priorityDistribution} />
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-slate-400 italic">No priority species found.</div>
          )}
        </div>
      </div>

      {/* Priority Species and Action list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recovery Priority Table */}
        <Card className="lg:col-span-2 p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 font-outfit text-sm uppercase tracking-wider">
              Priority Recovery Matrix
            </h3>
            <Link to="/conservation" className="text-emerald-650 hover:text-emerald-700 text-xs font-bold flex items-center gap-1">
              Full Console <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-forest-950 text-slate-455 uppercase font-mono text-[10px]">
                  <th className="py-2 px-3">Species</th>
                  <th className="py-2 px-3 text-center">Threat Status</th>
                  <th className="py-2 px-3 text-center">Priority Index</th>
                  <th className="py-2 px-3 text-center">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-forest-850">
                {priorityRecs.slice(0, 5).map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-forest-850/20 text-slate-655 dark:text-slate-350">
                    <td className="py-2.5 px-3 font-bold">{r.common_name}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                        r.conservation_status === 'Critically Endangered' ? 'bg-red-100 text-red-800' :
                        r.conservation_status === 'Endangered' ? 'bg-orange-100 text-orange-850' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.conservation_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-100">{r.priorityScore}</td>
                    <td className="py-2.5 px-3 text-center font-black uppercase text-[9px]">
                      <span className={`px-2 py-0.5 rounded ${
                        r.priorityClass === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        r.priorityClass === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.priorityClass}
                      </span>
                    </td>
                  </tr>
                ))}
                {priorityRecs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">No conservation species observations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Vulnerable sites & Quick links */}
        <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold font-outfit text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4.5 h-4.5 text-rose-500" />
              Conservation Operations Links
            </h3>
            <div className="space-y-2 text-xs">
              <Link to="/conservation" className="block p-3 rounded-xl bg-slate-50 dark:bg-forest-950 border hover:border-emerald-500 hover:text-emerald-700 transition-colors">
                <span className="font-bold block">Conservation Recommendation</span>
                <span className="text-[10px] text-slate-400">Establish anti-poaching boundaries and manage priority triggers.</span>
              </Link>
              <Link to="/health" className="block p-3 rounded-xl bg-slate-50 dark:bg-forest-955 border hover:border-emerald-500 hover:text-emerald-700 transition-colors">
                <span className="font-bold block">Ecosystem Health Dashboard</span>
                <span className="text-[10px] text-slate-400">View overall biological health indices and trigger alarms.</span>
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-forest-800 pt-4 mt-6 text-center text-[10px] text-slate-400 font-mono">
            Conservation Officer Control Port
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConservationDashboardView;
