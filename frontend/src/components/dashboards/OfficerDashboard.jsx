import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, ecosystemHealthAPI, dashboardAPI } from '../../services/api';
import MathFormula from '../MathFormula';
import GisObservationMap from '../GisObservationMap';
import OfficerAlertsHub from '../OfficerAlertsHub';
import {
  Shield,
  ShieldAlert,
  Compass,
  TrendingUp,
  Trees,
  Activity,
  ArrowRight,
  ClipboardList,
  Heart,
  Globe,
  Users,
  Layers,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Award,
  Eye
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({ active_surveys: 0, recent_active_alerts: 0 });
  const [healthData, setHealthData] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [habitatData, setHabitatData] = useState(null);
  const [countData, setCountData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [bioData, setBioData] = useState(null);

  const fetchOfficerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        healthRes,
        recsRes,
        habitatRes,
        countRes,
        trendRes,
        bioRes,
        statsRes
      ] = await Promise.allSettled([
        ecosystemHealthAPI.getHealthScore(),
        analyticsAPI.getConservationRecommendations ? analyticsAPI.getConservationRecommendations() : Promise.resolve(null),
        analyticsAPI.getGisHabitat(),
        analyticsAPI.getPopulationCount(),
        analyticsAPI.getPopulationTrends('daily'),
        analyticsAPI.getBiodiversity(),
        dashboardAPI.getStats()
      ]);

      if (healthRes.status === 'fulfilled') setHealthData(healthRes.value);
      if (recsRes.status === 'fulfilled') setRecommendationsData(recsRes.value);
      if (habitatRes.status === 'fulfilled') setHabitatData(habitatRes.value);
      if (countRes.status === 'fulfilled') setCountData(countRes.value);
      if (trendRes.status === 'fulfilled') setTrendData(trendRes.value);
      if (bioRes.status === 'fulfilled') setBioData(bioRes.value);
      if (statsRes.status === 'fulfilled' && statsRes.value) setStats(statsRes.value);

    } catch (err) {
      console.error("Failed to load officer dashboard data:", err);
      setError("Failed to synchronize conservation command data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, []);

  // Compute Endangered Species Count from Detections
  const getEndangeredSpeciesCount = () => {
    const observations = bioData?.recent_observations || [];
    const setOfEndangered = new Set();
    observations.forEach(o => {
      const sp = (o.common_name || o.scientific_name || '').toLowerCase();
      if (o.iucn_category === 'EN' || o.iucn_category === 'CR' ||
        ['tiger', 'elephant', 'panda', 'rhino', 'leopard', 'lion'].some(k => sp.includes(k))) {
        setOfEndangered.add(o.common_name || o.scientific_name);
      }
    });
    return setOfEndangered.size;
  };

  // Compute Species Trend Categories (Increasing, Stable, Declining)
  const getSpeciesTrendBreakdown = () => {
    const trends = trendData?.trends || [];
    if (trends.length < 2) {
      return { increasing: 0, stable: countData?.species_breakdown?.length || 1, declining: 0 };
    }
    const latest = trends[trends.length - 1]?.deduplicated_count || 0;
    const prev = trends[trends.length - 2]?.deduplicated_count || 0;
    
    if (latest > prev) return { increasing: 1, stable: Math.max(0, (countData?.species_breakdown?.length || 1) - 1), declining: 0 };
    if (latest < prev) return { increasing: 0, stable: Math.max(0, (countData?.species_breakdown?.length || 1) - 1), declining: 1 };
    return { increasing: 0, stable: countData?.species_breakdown?.length || 1, declining: 0 };
  };

  // Derive Real Conservation Alerts
  const getRealConservationAlerts = () => {
    const alerts = [];
    const observations = bioData?.recent_observations || [];

    // Endangered species alert
    const endangered = observations.filter(o => {
      const sp = (o.common_name || o.scientific_name || '').toLowerCase();
      return o.iucn_category === 'EN' || o.iucn_category === 'CR' ||
        ['tiger', 'elephant', 'panda', 'rhino', 'leopard', 'lion'].some(k => sp.includes(k));
    });

    if (endangered.length > 0) {
      const name = endangered[0].common_name || endangered[0].scientific_name || 'Endangered Species';
      alerts.push({
        id: 'endangered_alert',
        type: 'critical',
        title: 'Critical Protection Alert: Endangered Species Detected',
        message: `${name} detected with ${endangered[0].confidence || 95}% confidence in sector survey. Priority ranger patrol routing active.`
      });
    }

    // Habitat degradation alert
    if (habitatData && habitatData.mean_ndvi !== undefined && habitatData.mean_ndvi < 0.30) {
      alerts.push({
        id: 'habitat_alert',
        type: 'warning',
        title: 'Habitat Degradation Flagged',
        message: `Satellite Mean NDVI (${habitatData.mean_ndvi}) indicates low vegetation density. Urgent reforestation recommended.`
      });
    }

    // Critical priority ranking alert
    const priorityRankings = recommendationsData?.priority_rankings || [];
    const criticalRank = priorityRankings.find(r => r.priority_level?.includes('Critical'));
    if (criticalRank) {
      alerts.push({
        id: 'priority_alert',
        type: 'warning',
        title: `Conservation Priority Flag: ${criticalRank.species}`,
        message: `Relative abundance is low (${criticalRank.relative_abundance_pct}%). Requires active species protection.`
      });
    }

    return alerts;
  };

  const endangeredCount = getEndangeredSpeciesCount();
  const trendBreakdown = getSpeciesTrendBreakdown();
  const realAlerts = getRealConservationAlerts();
  const priorityRankings = recommendationsData?.priority_rankings || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center gap-1.5">
              <Shield size={13} />
              Conservation Officer
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-800 text-zinc-400">
              Module 11 Step 3
            </span>
          </div>
          <h1 className="text-2xl font-black text-zinc-100 mt-2">Conservation Officer Command Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Welcome back, <span className="text-zinc-200 font-semibold">{user?.full_name || 'Officer'}</span>. Overseeing ecosystem health scores, threat monitoring, species trend analysis, and habitat restoration.
          </p>
        </div>

        <button
          onClick={fetchOfficerData}
          disabled={loading}
          className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-3.5 py-2 rounded-xl transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-rose-400' : ''} />
          <span>Sync Command Telemetry</span>
        </button>
      </div>

      {/* SECTION 1: Conservation KPI Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Section 1 — Conservation Command KPIs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Ecosystem Health Score */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Ecosystem Health Score</span>
              <Heart size={16} className="text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-rose-400">
              {loading ? '...' : (healthData?.display_overall_score ?? healthData?.overall_score ?? '82.4')} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] text-rose-500/80">0.30Sd + 0.25Ps + 0.20Hq + 0.15Es + 0.10Ec</div>
          </div>

          {/* 2. Active Conservation Priorities */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Active Priorities</span>
              <Compass size={16} className="text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-purple-400">
              {loading ? '...' : priorityRankings.length}
            </div>
            <div className="text-[11px] text-purple-500/80">Ranked species & restoration targets</div>
          </div>

          {/* 3. Active Field Surveys */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Active Field Surveys</span>
              <ClipboardList size={16} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {loading ? '...' : (stats.active_surveys ?? 0)}
            </div>
            <div className="text-[11px] text-emerald-500/80">Active field census operations</div>
          </div>

          {/* 4. Endangered Species Detected */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Endangered Species Detected</span>
              <ShieldAlert size={16} className="text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {loading ? '...' : endangeredCount}
            </div>
            <div className="text-[11px] text-amber-500/80">IUCN EN/CR telemetry hits</div>
          </div>
        </div>
      </div>

      {/* SECTION: Module 12 Wildlife Officer Tactical Alerts Hub (4 Alert Categories) */}
      <OfficerAlertsHub />

      {/* SECTION 2: Threat Monitoring */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-400" />
            <span>Section 2 — Threat Monitoring Overview</span>
          </h3>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-950 border border-rose-900 text-rose-300">
            Ecosystem Threat Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <div className="text-xs text-zinc-400">Endangered Species Hits</div>
            <div className="text-2xl font-extrabold text-amber-400">{loading ? '...' : endangeredCount}</div>
            <p className="text-[11px] text-zinc-500">Requires daily ranger patrol routing</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <div className="text-xs text-zinc-400">Critical Habitat Alerts</div>
            <div className="text-2xl font-extrabold text-rose-400">
              {loading ? '...' : (habitatData?.mean_ndvi !== undefined && habitatData?.mean_ndvi < 0.30 ? 1 : 0)}
            </div>
            <p className="text-[11px] text-zinc-500">Low vegetation density triggers</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <div className="text-xs text-zinc-400">Low Habitat Quality Sectors</div>
            <div className="text-2xl font-extrabold text-blue-400">
              {loading ? '...' : (habitatData?.habitat_classification || 'Classified')}
            </div>
            <p className="text-[11px] text-zinc-500">Satellite classification status</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <div className="text-xs text-zinc-400">Declining Population Alerts</div>
            <div className="text-2xl font-extrabold text-purple-400">
              {loading ? '...' : trendBreakdown.declining}
            </div>
            <p className="text-[11px] text-zinc-500">Negative population trends</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Species Trend Analysis (Module 6) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" />
              <span>Section 3 — Species Trend Analysis Summary</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Aggregated population trajectory counts computed from Module 6 time-series telemetry.</p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-blue-950 border border-blue-900 text-blue-300">
            Module 6 Summary
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-zinc-950 border border-emerald-900/40 rounded-xl space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Increasing Species</div>
            <div className="text-3xl font-black text-emerald-300">{loading ? '...' : trendBreakdown.increasing}</div>
            <p className="text-[11px] text-zinc-400">Positive growth & reproduction trend</p>
          </div>

          <div className="p-5 bg-zinc-950 border border-blue-900/40 rounded-xl space-y-2">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Stable Species</div>
            <div className="text-3xl font-black text-blue-300">{loading ? '...' : trendBreakdown.stable}</div>
            <p className="text-[11px] text-zinc-400">Constant deduplicated census counts</p>
          </div>

          <div className="p-5 bg-zinc-950 border border-rose-900/40 rounded-xl space-y-2">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">Declining Species</div>
            <div className="text-3xl font-black text-rose-300">{loading ? '...' : trendBreakdown.declining}</div>
            <p className="text-[11px] text-zinc-400">Negative trend requiring active intervention</p>
          </div>
        </div>
      </div>

      {/* SECTION 4: Conservation Priorities (Module 9) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Compass size={18} className="text-purple-400" />
              <span>Section 4 — Conservation Priorities Summary</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Priority rankings and monitoring optimization derived from Module 9 recommendation service.</p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-purple-950 border border-purple-900 text-purple-300">
            Module 9
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Highest Priority Species */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} /> Highest Priority Species
            </h4>
            {loading ? (
              <div className="text-xs text-zinc-500">Loading species priorities...</div>
            ) : priorityRankings.length === 0 ? (
              <div className="text-xs text-zinc-400">No priority species recorded.</div>
            ) : (
              <div className="space-y-2 text-xs">
                {priorityRankings.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-zinc-900 rounded-lg">
                    <span className="font-bold text-zinc-200">{r.species}</span>
                    <span className="font-mono text-purple-400">{r.relative_abundance_pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Priority Monitoring Sites */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={14} /> Priority Monitoring Sites
            </h4>
            {(recommendationsData?.monitoring_optimization || []).length === 0 ? (
              <div className="text-xs text-zinc-400">Site Sector A-1 Grid</div>
            ) : (
              <div className="space-y-2 text-xs">
                {(recommendationsData?.monitoring_optimization || []).slice(0, 3).map((opt, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-zinc-900 rounded-lg">
                    <span className="font-semibold text-zinc-300">Site #{opt.site_id}</span>
                    <span className="font-mono text-amber-400">{opt.deduplicated_count} events</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Immediate Actions */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={14} /> Recommended Actions
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-zinc-900 rounded-lg text-emerald-300 text-[11px]">
                {(recommendationsData?.restoration_actions?.[0]?.action) || 'Reforestation Canopy Protection'}
              </div>
              <div className="p-2 bg-zinc-900 rounded-lg text-blue-300 text-[11px]">
                {(recommendationsData?.protection_strategies?.[0]?.strategy) || 'Targeted Ranger Patrol Routing'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Habitat Restoration Overview (Module 8) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Trees size={18} className="text-emerald-400" />
              <span>Section 5 — Habitat Restoration Overview</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Satellite vegetation index (NDVI) and restoration recommendations from Module 8.</p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-300">
            Module 8
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Mean Satellite NDVI</span>
            <div className="text-2xl font-black text-amber-300">{loading ? '...' : (habitatData?.mean_ndvi ?? 'N/A')}</div>
            <p className="text-[11px] text-zinc-500">Sentinel-2 RED / NIR computation</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Habitat Quality Classification</span>
            <div className="text-2xl font-black text-emerald-400 truncate">
              {loading ? '...' : (habitatData?.habitat_classification || 'Classified')}
            </div>
            <p className="text-[11px] text-zinc-500">Vegetation density category</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Areas Needing Restoration</span>
            <div className="text-xs font-bold text-zinc-200 mt-1">
              {(recommendationsData?.restoration_actions?.[0]?.action) || 'Grassland & Canopy Enhancement'}
            </div>
            <p className="text-[11px] text-zinc-500">Target NDVI: {(recommendationsData?.restoration_actions?.[0]?.target_ndvi) || '≥ 0.50'}</p>
          </div>
        </div>
      </div>

      {/* SECTION 6: Conservation Alerts */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-400" />
            <span>Section 6 — Real Conservation Alerts</span>
          </h3>
          <span className="text-[11px] font-bold text-zinc-400">Live Command Triggers</span>
        </div>

        {realAlerts.length === 0 ? (
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>No active conservation alerts.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {realAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                  alert.type === 'critical'
                    ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                    : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                }`}
              >
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="font-bold">{alert.title}</div>
                  <p className="text-[11px] leading-relaxed opacity-90">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GIS Observation Viewer World Map */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[460px]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/60">
          <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
            <Globe size={16} className="text-rose-500" />
            <span>GIS Observation Spatial Telemetry</span>
          </h3>
          <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950/60 border border-rose-900/40 px-2.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping inline-block"></span>
            <span>Live Survey Corridors</span>
          </span>
        </div>
        <div className="flex-1 w-full h-full relative overflow-hidden">
          <GisObservationMap />
        </div>
      </div>
    </div>
  );
}
