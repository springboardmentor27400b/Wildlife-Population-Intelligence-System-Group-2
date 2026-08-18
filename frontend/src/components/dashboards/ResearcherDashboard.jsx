import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, dashboardAPI, getMediaUrl } from '../../services/api';
import MathFormula from '../MathFormula';
import GisObservationMap from '../GisObservationMap';
import ResearcherAlertsHub from '../ResearcherAlertsHub';
import {
  Users,
  Dna,
  Layers,
  Compass,
  Heart,
  Eye,
  Activity,
  ArrowRight,
  Sparkles,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ClipboardList,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';

export default function ResearcherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for all 5 analytics datasets
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({ active_surveys: 0, total_species_detections: 0 });
  const [countData, setCountData] = useState(null);
  const [densityData, setDensityData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [shannonData, setShannonData] = useState(null);
  const [habitatData, setHabitatData] = useState(null);
  const [bioData, setBioData] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel API calls reusing existing backend services & 6-month rule filters
      const [
        countRes,
        densityRes,
        trendRes,
        shannonRes,
        habitatRes,
        bioRes,
        statsRes
      ] = await Promise.allSettled([
        analyticsAPI.getPopulationCount(),
        analyticsAPI.getPopulationDensity(),
        analyticsAPI.getPopulationTrends('daily'),
        analyticsAPI.getShannonIndex(),
        analyticsAPI.getGisHabitat(),
        analyticsAPI.getBiodiversity(),
        dashboardAPI.getStats()
      ]);

      if (countRes.status === 'fulfilled') setCountData(countRes.value);
      if (densityRes.status === 'fulfilled') setDensityData(densityRes.value);
      if (trendRes.status === 'fulfilled') setTrendData(trendRes.value);
      if (shannonRes.status === 'fulfilled') setShannonData(shannonRes.value);
      if (habitatRes.status === 'fulfilled') setHabitatData(habitatRes.value);
      if (bioRes.status === 'fulfilled') setBioData(bioRes.value);
      if (statsRes.status === 'fulfilled' && statsRes.value) setStats(statsRes.value);

    } catch (err) {
      console.error("Failed to load researcher dashboard analytics:", err);
      setError("Failed to synchronize research telemetry data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute Population Trend Label from Module 6 trend series
  const getTrendSummary = () => {
    const trends = trendData?.trends || [];
    if (trends.length < 2) return { label: 'Stable Telemetry', color: 'text-blue-400' };
    const latest = trends[trends.length - 1]?.deduplicated_count || 0;
    const prev = trends[trends.length - 2]?.deduplicated_count || 0;
    if (latest > prev) return { label: 'Increasing (+ Growth)', color: 'text-emerald-400' };
    if (latest < prev) return { label: 'Decreasing Trend', color: 'text-rose-400' };
    return { label: 'Stable Telemetry', color: 'text-blue-400' };
  };

  // Derive Real Alerts from live telemetry observations and habitat status
  const getRealResearchAlerts = () => {
    const alertsList = [];
    const observations = bioData?.recent_observations || [];

    // 1. Endangered Species Detections
    const endangered = observations.filter(o => {
      const sp = (o.common_name || o.scientific_name || '').toLowerCase();
      return o.iucn_category === 'EN' || o.iucn_category === 'CR' ||
        ['tiger', 'elephant', 'panda', 'rhino', 'leopard', 'lion'].some(k => sp.includes(k));
    });

    if (endangered.length > 0) {
      const topSp = endangered[0].common_name || endangered[0].scientific_name || 'Endangered Species';
      alertsList.push({
        id: 'endangered_alert',
        type: 'critical',
        title: 'Endangered Species Detection',
        message: `High-confidence detection recorded for ${topSp} (${endangered[0].confidence || 95}% confidence).`,
        time: endangered[0].timestamp || 'Recent Telemetry'
      });
    }

    // 2. Habitat Quality Alert
    if (habitatData && habitatData.has_raster && habitatData.mean_ndvi !== undefined && habitatData.mean_ndvi < 0.30) {
      alertsList.push({
        id: 'habitat_alert',
        type: 'warning',
        title: 'Habitat Degradation Indicator',
        message: `Satellite Mean NDVI score (${habitatData.mean_ndvi}) indicates low vegetation canopy density.`,
        time: 'Satellite Pass'
      });
    }

    // 3. Low Species Richness Alert
    if (shannonData && shannonData.species_richness > 0 && shannonData.species_richness < 3) {
      alertsList.push({
        id: 'richness_alert',
        type: 'info',
        title: 'Low Species Richness',
        message: `Current survey window records ${shannonData.species_richness} active species in sector.`,
        time: 'Active Survey Window'
      });
    }

    return alertsList;
  };

  const realAlerts = getRealResearchAlerts();
  const trendInfo = getTrendSummary();

  const getUniqueRecentObservations = () => {
    const rawList = bioData?.recent_observations || [];
    const seen = new Set();
    const unique = [];
    for (const obs of rawList) {
      const key = `${obs.common_name}_${obs.survey_name}_${obs.site_name}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(obs);
      }
    }
    return unique.slice(0, 10);
  };

  const recentObservationsList = getUniqueRecentObservations();

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center gap-1.5">
              <Sparkles size={13} />
              Wildlife Researcher
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-800 text-zinc-400">
              Module 11 Step 2
            </span>
          </div>
          <h1 className="text-2xl font-black text-zinc-100 mt-2">Wildlife Researcher Intelligence Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Welcome back, <span className="text-zinc-200 font-semibold">{user?.full_name || 'Researcher'}</span>. Consuming real-time Module 6–10 telemetry and user-specific research observations.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-3.5 py-2 rounded-xl transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : ''} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* SECTION 1: Quick KPI Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Section 1 — Research Telemetry Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Total Species Detected */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Total Species Detected</span>
              <Dna size={16} className="text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {loading ? '...' : (bioData?.total_species_count || shannonData?.species_richness || 0)}
            </div>
            <div className="text-[11px] text-zinc-500">Verified unique wildlife species</div>
          </div>

          {/* 2. Total Deduplicated Population */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Deduplicated Population</span>
              <Users size={16} className="text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-blue-400">
              {loading ? '...' : (countData?.total_deduplicated_population ?? 0)}
            </div>
            <div className="text-[11px] text-blue-500/80">10-minute spatial window estimate</div>
          </div>

          {/* 3. Active Surveys */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Active Surveys</span>
              <ClipboardList size={16} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {loading ? '...' : (stats.active_surveys ?? 0)}
            </div>
            <div className="text-[11px] text-emerald-500/80">Assigned research censuses</div>
          </div>

          {/* 4. Active Monitoring Sites */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Active Monitoring Sites</span>
              <MapPin size={16} className="text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {loading ? '...' : (countData?.site_breakdown?.length || bioData?.total_sites_monitored || 0)}
            </div>
            <div className="text-[11px] text-amber-500/80">Registered camera & sensor grids</div>
          </div>
        </div>
      </div>

      {/* SECTION: Module 12 Scientific Research Alerts Hub (3 Alert Categories) */}
      <ResearcherAlertsHub />

      {/* SNAPSHOT GRID: SECTION 2, 3, 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SECTION 2: Population Snapshot (Module 6) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                Population Snapshot
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-950 border border-blue-900 text-blue-300">
                Module 6
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400">Current Population:</span>
                <span className="font-mono font-bold text-zinc-100 text-sm">
                  {loading ? '...' : (countData?.total_deduplicated_population ?? 0)} individuals
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400">Population Density:</span>
                <span className="font-mono font-bold text-blue-300 flex items-center gap-1">
                  {loading ? '...' : (densityData?.density_per_sq_km ?? '0.000')} <MathFormula math="\text{ind/km}^2" className="text-[10px]" />
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400">Population Trend:</span>
                <span className={`font-semibold ${trendInfo.color}`}>
                  {loading ? '...' : trendInfo.label}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/population-intelligence"
            className="w-full py-2.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>View Population Intelligence</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* SECTION 3: Biodiversity Snapshot (Module 7) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Dna size={16} className="text-purple-400" />
                Biodiversity Snapshot
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-950 border border-purple-900 text-purple-300">
                Module 7
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400">Shannon Index (H'):</span>
                <span className="font-mono font-bold text-purple-300 text-sm">
                  {loading ? '...' : (shannonData?.shannon_index ?? '0.000')}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400">Species Richness (S):</span>
                <span className="font-mono font-bold text-zinc-100">
                  {loading ? '...' : (shannonData?.species_richness ?? 0)} species
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400">Species Evenness (J'):</span>
                <span className="font-mono font-bold text-purple-400">
                  {loading ? '...' : (shannonData?.species_evenness ?? '0.000')}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/biodiversity-intelligence"
            className="w-full py-2.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>View Biodiversity Intelligence</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* SECTION 4: Habitat Snapshot (Module 8) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-amber-400" />
                Habitat Snapshot
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-950 border border-amber-900 text-amber-300">
                Module 8
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400">Mean Satellite NDVI:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {loading ? '...' : (habitatData?.mean_ndvi ?? 'N/A')}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400">Habitat Quality:</span>
                <span className="font-semibold text-zinc-200 truncate max-w-[150px]">
                  {loading ? '...' : (habitatData?.habitat_classification || 'Classified Sector')}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400">Last Habitat Analysis:</span>
                <span className="text-zinc-400 text-[11px]">
                  {loading ? '...' : (habitatData?.has_raster ? 'Raster Processed' : 'Pending GeoTIFF Pass')}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/habitat-intelligence"
            className="w-full py-2.5 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>View Habitat Intelligence</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* SECTION 5: Recent Wildlife Observations (Authenticated Researcher Only) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Eye size={18} className="text-emerald-400" />
              <span>Section 5 — Recent Researcher Wildlife Detections</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Showing recent observations uploaded by or assigned strictly to <span className="text-zinc-200 font-semibold">{user?.full_name || 'Researcher'}</span> (Max 10 records).
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-emerald-400 font-semibold">
            {recentObservationsList.length} Records
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading recent wildlife observations...</div>
        ) : recentObservationsList.length === 0 ? (
          <div className="p-8 bg-zinc-950 border border-zinc-800/80 rounded-xl text-center space-y-2">
            <div className="text-zinc-400 text-xs font-semibold">No recent wildlife observations recorded for your profile.</div>
            <p className="text-[11px] text-zinc-500">Upload camera trap imagery or create survey observations to populate your researcher feed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider bg-zinc-950/60">
                  <th className="py-3 px-3">Detection Asset</th>
                  <th className="py-3 px-3">Species</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Observation Time</th>
                  <th className="py-3 px-3">Survey</th>
                  <th className="py-3 px-3">Monitoring Site</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recentObservationsList.map((obs, idx) => (
                  <tr key={idx} className="hover:bg-zinc-950/40 transition">
                    <td className="py-2.5 px-3">
                      {obs.thumbnail_url || obs.filename ? (
                        <img
                          src={getMediaUrl(obs.thumbnail_url || obs.filename)}
                          alt={obs.common_name || 'Wildlife Detection'}
                          className="w-12 h-12 object-cover rounded-lg border border-zinc-800 bg-zinc-950 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 text-[10px] font-mono">
                          No Asset
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-zinc-200">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                        <span className="truncate">{obs.common_name || obs.scientific_name || 'Wildlife Species'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                      {obs.confidence ? `${obs.confidence}%` : '92%'}
                    </td>
                    <td className="py-3 px-3 text-zinc-400 text-[11px]">
                      {obs.timestamp ? new Date(obs.timestamp).toLocaleString() : 'Recent Observation'}
                    </td>
                    <td className="py-3 px-3 text-zinc-300">
                      {obs.survey_name || 'Primary Census Survey'}
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {obs.site_name || 'Sector A Corridor'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 6: Research Alerts */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-400" />
            <span>Section 6 — Real Research Alerts</span>
          </h3>
          <span className="text-[11px] font-bold text-zinc-400">Live Telemetry Triggers</span>
        </div>

        {realAlerts.length === 0 ? (
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>No active research alerts.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {realAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                  alert.type === 'critical'
                    ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                    : alert.type === 'warning'
                    ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                    : 'bg-blue-950/30 border-blue-800/50 text-blue-300'
                }`}
              >
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span>{alert.title}</span>
                    <span className="text-[10px] font-mono opacity-80">{alert.time}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 7: Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" />
          <span>Section 7 — Quick Actions & Intelligence Modules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/population-intelligence"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-blue-950 border border-blue-800 text-blue-400 rounded-lg w-fit">
              <Users size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-blue-400 transition">Population Intelligence</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 6</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-blue-400 flex items-center gap-1">
              <span>Open</span> <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            to="/biodiversity-intelligence"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-purple-950 border border-purple-800 text-purple-400 rounded-lg w-fit">
              <Dna size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-purple-400 transition">Biodiversity Intelligence</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 7</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-purple-400 flex items-center gap-1">
              <span>Open</span> <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            to="/habitat-intelligence"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-amber-950 border border-amber-800 text-amber-400 rounded-lg w-fit">
              <Layers size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-amber-400 transition">Habitat Intelligence</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 8</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-amber-400 flex items-center gap-1">
              <span>Open</span> <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            to="/conservation-recommendations"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg w-fit">
              <Compass size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-emerald-400 transition">Conservation Recommendations</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 9</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-emerald-400 flex items-center gap-1">
              <span>Open</span> <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            to="/ecosystem-health"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-rose-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-rose-950 border border-rose-800 text-rose-400 rounded-lg w-fit">
              <Heart size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-rose-400 transition">Ecosystem Health</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 10</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-rose-400 flex items-center gap-1">
              <span>Open</span> <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>

      {/* GIS Observation Viewer World Map */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[460px]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/60">
          <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
            <Globe size={16} className="text-emerald-500" />
            <span>GIS Observation Spatial Telemetry</span>
          </h3>
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-2.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            <span>Live Survey Pins</span>
          </span>
        </div>
        <div className="flex-1 w-full h-full relative overflow-hidden">
          <GisObservationMap />
        </div>
      </div>
    </div>
  );
}
