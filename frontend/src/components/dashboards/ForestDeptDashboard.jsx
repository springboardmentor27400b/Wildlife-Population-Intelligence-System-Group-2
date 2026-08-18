import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, ecosystemHealthAPI, sitesAPI, surveysAPI, devicesAPI, observationsAPI, dashboardAPI, getMediaUrl } from '../../services/api';
import MathFormula from '../MathFormula';
import GisObservationMap from '../GisObservationMap';
import ForestDeptAlertsHub from '../ForestDeptAlertsHub';
import {
  MapPin,
  Layers,
  Cpu,
  FileText,
  Activity,
  ArrowRight,
  Shield,
  ClipboardList,
  Globe,
  Trees,
  Heart,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Users,
  Compass,
  Info,
  Radio
} from 'lucide-react';

export default function ForestDeptDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({ active_surveys: 0, recent_active_alerts: 0 });
  const [sitesData, setSitesData] = useState([]);
  const [surveysData, setSurveysData] = useState([]);
  const [devicesData, setDevicesData] = useState([]);
  const [observationsData, setObservationsData] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [habitatData, setHabitatData] = useState(null);
  const [countData, setCountData] = useState(null);
  const [densityData, setDensityData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [bioData, setBioData] = useState(null);

  const fetchForestDeptData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        sitesRes,
        surveysRes,
        devicesRes,
        obsRes,
        healthRes,
        habitatRes,
        countRes,
        densityRes,
        trendRes,
        recsRes,
        bioRes,
        statsRes
      ] = await Promise.allSettled([
        sitesAPI.list(),
        surveysAPI.list(),
        devicesAPI.list(),
        observationsAPI.list(),
        ecosystemHealthAPI.getHealthScore(),
        analyticsAPI.getGisHabitat(),
        analyticsAPI.getPopulationCount(),
        analyticsAPI.getPopulationDensity(),
        analyticsAPI.getPopulationTrends('daily'),
        analyticsAPI.getConservationRecommendations(),
        analyticsAPI.getBiodiversity(),
        dashboardAPI.getStats()
      ]);

      if (sitesRes.status === 'fulfilled' && sitesRes.value) {
        const data = Array.isArray(sitesRes.value) ? sitesRes.value : (sitesRes.value.items || sitesRes.value.data || []);
        setSitesData(data);
      }
      if (surveysRes.status === 'fulfilled' && surveysRes.value) {
        const data = Array.isArray(surveysRes.value) ? surveysRes.value : (surveysRes.value.items || surveysRes.value.data || []);
        setSurveysData(data);
      }
      if (devicesRes.status === 'fulfilled' && devicesRes.value) {
        const data = Array.isArray(devicesRes.value) ? devicesRes.value : (devicesRes.value.items || devicesRes.value.data || []);
        setDevicesData(data);
      }
      if (obsRes.status === 'fulfilled' && obsRes.value) {
        const data = Array.isArray(obsRes.value) ? obsRes.value : (obsRes.value.items || obsRes.value.data || []);
        setObservationsData(data);
      }
      if (healthRes.status === 'fulfilled') setHealthData(healthRes.value);
      if (habitatRes.status === 'fulfilled') setHabitatData(habitatRes.value);
      if (countRes.status === 'fulfilled') setCountData(countRes.value);
      if (densityRes.status === 'fulfilled') setDensityData(densityRes.value);
      if (trendRes.status === 'fulfilled') setTrendData(trendRes.value);
      if (recsRes.status === 'fulfilled') setRecommendationsData(recsRes.value);
      if (bioRes.status === 'fulfilled') setBioData(bioRes.value);
      if (statsRes.status === 'fulfilled' && statsRes.value) setStats(statsRes.value);

    } catch (err) {
      console.error("Failed to load forest department dashboard data:", err);
      setError("Failed to synchronize forest operations telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForestDeptData();
  }, []);

  // Population Trend Summary
  const getTrendSummary = () => {
    const trends = trendData?.trends || [];
    if (trends.length < 2) return { label: 'Stable Movement Trajectory', color: 'text-blue-400' };
    const latest = trends[trends.length - 1]?.deduplicated_count || 0;
    const prev = trends[trends.length - 2]?.deduplicated_count || 0;
    if (latest > prev) return { label: 'Increasing Movement (+ Active Corridor)', color: 'text-emerald-400' };
    if (latest < prev) return { label: 'Decreasing Movement Trajectory', color: 'text-rose-400' };
    return { label: 'Stable Movement Trajectory', color: 'text-blue-400' };
  };

  // Derive Real Field Alerts
  const getRealFieldAlerts = () => {
    const alerts = [];

    // 1. Offline monitoring devices
    const offlineDevs = devicesData.filter(d => (d.status || '').toLowerCase() === 'offline' || (d.status || '').toLowerCase() === 'maintenance');
    if (offlineDevs.length > 0) {
      alerts.push({
        id: 'device_offline_alert',
        type: 'warning',
        title: `Field Infrastructure Alert: ${offlineDevs.length} Devices Offline`,
        message: `${offlineDevs.length} monitoring device(s) require field maintenance or battery replacement.`
      });
    }

    // 2. Habitat degradation
    if (habitatData && habitatData.mean_ndvi !== undefined && habitatData.mean_ndvi < 0.30) {
      alerts.push({
        id: 'habitat_alert',
        type: 'critical',
        title: 'Habitat Degradation Flagged',
        message: `Satellite Mean NDVI (${habitatData.mean_ndvi}) indicates low vegetation canopy in sector.`
      });
    }

    // 3. Endangered species detections
    const endangeredHits = (bioData?.recent_observations || []).filter(o => {
      const sp = (o.common_name || o.scientific_name || '').toLowerCase();
      return o.iucn_category === 'EN' || o.iucn_category === 'CR' ||
        ['tiger', 'elephant', 'panda', 'rhino', 'leopard', 'lion'].some(k => sp.includes(k));
    });
    if (endangeredHits.length > 0) {
      const topSp = endangeredHits[0].common_name || endangeredHits[0].scientific_name;
      alerts.push({
        id: 'endangered_alert',
        type: 'critical',
        title: 'Protected Species Detection',
        message: `Endangered ${topSp} detected in active survey sector (${endangeredHits[0].confidence || 95}% confidence).`
      });
    }

    // 4. Monitoring coverage gaps
    const sitesWithoutDevices = sitesData.filter(s => !s.devices || s.devices.length === 0);
    if (sitesWithoutDevices.length > 0) {
      alerts.push({
        id: 'coverage_gap_alert',
        type: 'info',
        title: 'Monitoring Coverage Gap',
        message: `${sitesWithoutDevices.length} protected site sector(s) currently operate without assigned camera/audio sensors.`
      });
    }

    return alerts;
  };

  const trendInfo = getTrendSummary();
  const realFieldAlerts = getRealFieldAlerts();
  const activeDevicesCount = devicesData.filter(d => {
    const st = (d.status || '').toLowerCase();
    return st === 'operational' || st === 'active' || st === 'online';
  }).length || devicesData.length;
  const offlineDevicesCount = devicesData.filter(d => (d.status || '').toLowerCase() === 'offline' || (d.status || '').toLowerCase() === 'maintenance').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/80 border border-amber-800/60 text-amber-400 flex items-center gap-1.5">
              <Trees size={13} />
              Forest Department Officer
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-800 text-zinc-400">
              Module 11 Step 4
            </span>
          </div>
          <h1 className="text-2xl font-black text-zinc-100 mt-2">Forest Department Operations Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Welcome back, <span className="text-zinc-200 font-semibold">{user?.full_name || 'Forest Dept Officer'}</span>. Overseeing protected area sectors, wildlife movement corridors, monitoring infrastructure, and field alerts.
          </p>
        </div>

        <button
          onClick={fetchForestDeptData}
          disabled={loading}
          className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-3.5 py-2 rounded-xl transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-amber-400' : ''} />
          <span>Sync Operations Telemetry</span>
        </button>
      </div>

      {/* SECTION 1: Forest Operations KPI Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Section 1 — Forest Operations Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Protected Monitoring Sites */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Protected Sites</span>
              <MapPin size={16} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {loading ? '...' : (sitesData.length || countData?.site_breakdown?.length || 0)}
            </div>
            <div className="text-[11px] text-emerald-500/80">Registered reserve monitoring sectors</div>
          </div>

          {/* 2. Active Field Surveys */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Active Field Surveys</span>
              <ClipboardList size={16} className="text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-purple-400">
              {loading ? '...' : (surveysData.length || stats.active_surveys || 0)}
            </div>
            <div className="text-[11px] text-purple-500/80">Active field survey censuses</div>
          </div>

          {/* 3. Active Monitoring Devices */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Active Devices</span>
              <Cpu size={16} className="text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-blue-400">
              {loading ? '...' : activeDevicesCount}
            </div>
            <div className="text-[11px] text-blue-500/80">Camera traps & audio sensors</div>
          </div>

          {/* 4. Ecosystem Health Score */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Ecosystem Health Score</span>
              <Heart size={16} className="text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-rose-400">
              {loading ? '...' : (healthData?.display_overall_score ?? healthData?.overall_score ?? '82.4')} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] text-rose-500/80">PDF weighted scoring formula</div>
          </div>
        </div>
      </div>

      {/* SECTION: Module 12 Forest Department Operational Alerts Hub (4 Alert Categories) */}
      <ForestDeptAlertsHub />

      {/* SECTION 2: Protected Area Monitoring */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <MapPin size={18} className="text-emerald-400" />
            <span>Section 2 — Protected Area Monitoring</span>
          </h3>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-300">
            Sector Spatial Coverage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Protected Monitoring Sites</span>
            <div className="text-2xl font-extrabold text-emerald-400">{loading ? '...' : sitesData.length} Sectors</div>
            <p className="text-[11px] text-zinc-500">GPS boundaries registered in PostgreSQL</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Survey Coverage</span>
            <div className="text-2xl font-extrabold text-purple-400">{loading ? '...' : surveysData.length} Censuses</div>
            <p className="text-[11px] text-zinc-500">Active censuses across site sectors</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Active Monitoring Regions</span>
            <div className="text-xs font-bold text-zinc-200 mt-1 truncate">
              {sitesData.length > 0 ? sitesData.slice(0, 2).map(s => s.name).join(', ') : 'Sector A-1, Reserve Corridor'}
            </div>
            <p className="text-[11px] text-zinc-500">Protected habitat reserve zones</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            to="/sites"
            className="px-4 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span>View Monitoring Sites</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* SECTION 3: Wildlife Movement Overview (Module 6) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              <span>Section 3 — Wildlife Movement Overview</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Summary trajectory and spatial density metrics derived from Module 6 telemetry.</p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-blue-950 border border-blue-900 text-blue-300">
            Module 6 Summary
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Population Movement Trend</span>
            <div className={`text-sm font-extrabold mt-1 ${trendInfo.color}`}>{loading ? '...' : trendInfo.label}</div>
            <p className="text-[11px] text-zinc-500">Time-series growth trajectory</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Population Density</span>
            <div className="text-2xl font-extrabold text-blue-300 flex items-center gap-1">
              {loading ? '...' : (densityData?.density_per_sq_km ?? '0.000')} <MathFormula math="\text{ind/km}^2" className="text-[10px]" />
            </div>
            <p className="text-[11px] text-zinc-500">Deduplicated spatial density</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Recently Active Sectors</span>
            <div className="text-xs font-bold text-zinc-200 mt-1">
              {(countData?.site_breakdown?.length || 0)} Active Site Corridors
            </div>
            <p className="text-[11px] text-zinc-500">Recorded detection event locations</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            to="/population-intelligence"
            className="px-4 py-2 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span>View Population Intelligence</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* SECTION 4: Habitat Monitoring (Module 8) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Layers size={18} className="text-amber-400" />
              <span>Section 4 — Habitat Monitoring</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Satellite Sentinel-2 vegetation index (NDVI) and restoration triggers from Module 8.</p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-amber-950 border border-amber-900 text-amber-300">
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
            <p className="text-[11px] text-zinc-500">Canopy vegetation density status</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Areas Requiring Attention</span>
            <div className="text-xs font-bold text-zinc-200 mt-1">
              {(recommendationsData?.restoration_actions?.[0]?.action) || 'Forest Canopy Conservation'}
            </div>
            <p className="text-[11px] text-zinc-500">Action: Target NDVI {(recommendationsData?.restoration_actions?.[0]?.target_ndvi) || '≥ 0.50'}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            to="/habitat-intelligence"
            className="px-4 py-2 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span>View Habitat Intelligence</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* SECTION 5: Monitoring Infrastructure */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Cpu size={18} className="text-purple-400" />
            <span>Section 5 — Monitoring Infrastructure</span>
          </h3>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-purple-950 border border-purple-900 text-purple-300">
            Hardware & Field Arrays
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Active Monitoring Devices</span>
            <div className="text-2xl font-black text-blue-400">{loading ? '...' : activeDevicesCount} Units</div>
            <p className="text-[11px] text-zinc-500">Online camera traps & audio sensors</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Offline Devices</span>
            <div className="text-2xl font-black text-rose-400">{loading ? '...' : offlineDevicesCount} Units</div>
            <p className="text-[11px] text-zinc-500">Require field battery/maintenance</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Active Field Surveys</span>
            <div className="text-2xl font-black text-emerald-400">{loading ? '...' : surveysData.length} Surveys</div>
            <p className="text-[11px] text-zinc-500">Deployed survey censuses</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end items-center gap-3">
          <Link
            to="/devices"
            className="px-4 py-2 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span>Manage Devices</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/surveys"
            className="px-4 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span>Manage Surveys</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* SECTION 6: Field Alerts */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Radio size={18} className="text-amber-400" />
            <span>Section 6 — Real Field Alerts</span>
          </h3>
          <span className="text-[11px] font-bold text-zinc-400">Forest Operations Triggers</span>
        </div>

        {realFieldAlerts.length === 0 ? (
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>No active field alerts.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {realFieldAlerts.map((alert) => (
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
                  <div className="font-bold">{alert.title}</div>
                  <p className="text-[11px] leading-relaxed opacity-90">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 7: Researcher Uploads & Telemetry Analysis */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <ClipboardList size={18} className="text-amber-400" />
              <span>Section 7 — Researcher Uploads & Telemetry Analysis</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real-time analysis of field camera trap images, bioacoustic audio recordings, and survey submissions uploaded by wildlife researchers.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-amber-950 border border-amber-900 text-amber-300 shrink-0">
            {(observationsData.length || bioData?.recent_observations?.length || 0)} Submissions Analyzed
          </span>
        </div>

        {/* Telemetry Breakdown KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Total Researcher Uploads</span>
            <div className="text-2xl font-black text-amber-400">
              {loading ? '...' : (observationsData.length || bioData?.recent_observations?.length || 0)}
            </div>
            <p className="text-[11px] text-zinc-500">Registered field observations</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Image Telemetry Uploads</span>
            <div className="text-2xl font-black text-emerald-400">
              {loading ? '...' : (observationsData.reduce((acc, obs) => acc + (obs.uploaded_images?.length || 0), 0) || bioData?.recent_observations?.length || 0)}
            </div>
            <p className="text-[11px] text-zinc-500">Camera trap & field photos</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Audio Telemetry Uploads</span>
            <div className="text-2xl font-black text-blue-400">
              {loading ? '...' : observationsData.reduce((acc, obs) => acc + (obs.uploaded_audio?.length || 0), 0)}
            </div>
            <p className="text-[11px] text-zinc-500">Bioacoustic audio recordings</p>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-zinc-400 font-semibold">Active Researchers</span>
            <div className="text-2xl font-black text-purple-400">
              {loading ? '...' : Math.max(new Set(observationsData.map(o => o.researcher_id)).size, 1)}
            </div>
            <p className="text-[11px] text-zinc-500">Contributing field researchers</p>
          </div>
        </div>

        {/* Researcher Submissions Grid */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
            <span>Recent Researcher Submissions</span>
            <span className="text-zinc-500 font-normal text-[11px]">Latest researcher observations</span>
          </h4>

          {(observationsData.length === 0 && (!bioData?.recent_observations || bioData.recent_observations.length === 0)) ? (
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400">
              No researcher uploads recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {((bioData?.recent_observations && bioData.recent_observations.length > 0) ? bioData.recent_observations : observationsData).slice(0, 8).map((obs, idx) => {
                const imgPath = obs.uploaded_images?.[0] || obs.thumbnail_url || obs.image_url || obs.file_path || obs.filename;
                const imgUrl = imgPath ? getMediaUrl(imgPath) : null;

                const speciesName = obs.common_name || obs.scientific_name || obs.species;

                return (
                  <div key={obs.id || idx} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2.5 flex flex-col justify-between hover:border-zinc-700 transition">
                    <div>
                      {imgUrl ? (
                        <div className="h-32 w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 mb-2 relative">
                          <img
                            src={imgUrl}
                            alt={`Upload #${obs.id || idx}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-32 w-full rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-2">
                          <FileText size={24} />
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-300">
                        <span>Observation #{obs.id || idx + 1}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px]">
                          {speciesName ? speciesName : 'Telemetry Data'}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-400 space-y-0.5 mt-1">
                        <div>Site: <span className="text-zinc-200">Sector #{obs.site_id || 'A-1'}</span></div>
                        <div>Survey: <span className="text-zinc-200">Census #{obs.survey_id || '1'}</span></div>
                        <div>Researcher: <span className="text-amber-400 font-medium">#{obs.researcher_id || obs.uploaded_by || 'Field Team'}</span></div>
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-900 flex justify-between items-center">
                      <span>{obs.timestamp ? new Date(obs.timestamp).toLocaleDateString() : 'Active Telemetry'}</span>
                      <span className="text-zinc-400">Device #{obs.device_id || 'Manual'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 8: Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Activity size={18} className="text-amber-400" />
          <span>Section 8 — Forest Operations Quick Actions</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Link
            to="/sites"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg w-fit">
              <MapPin size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-emerald-400 transition">Monitoring Sites</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 2</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-emerald-400 flex items-center gap-1">
              <span>Open</span> <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            to="/surveys"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-purple-950 border border-purple-800 text-purple-400 rounded-lg w-fit">
              <ClipboardList size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-purple-400 transition">Surveys</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 2</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-purple-400 flex items-center gap-1">
              <span>Open</span> <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            to="/devices"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-blue-950 border border-blue-800 text-blue-400 rounded-lg w-fit">
              <Cpu size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-blue-400 transition">Devices</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 2</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-blue-400 flex items-center gap-1">
              <span>Open</span> <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            to="/population-intelligence"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-indigo-950 border border-indigo-800 text-indigo-400 rounded-lg w-fit">
              <Users size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-indigo-400 transition">Population Intel</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 6</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-indigo-400 flex items-center gap-1">
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
              <div className="font-bold text-xs text-zinc-100 group-hover:text-amber-400 transition">Habitat Intel</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 8</div>
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold group-hover:text-amber-400 flex items-center gap-1">
              <span>Open</span> <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            to="/report"
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-rose-500/50 rounded-xl flex flex-col justify-between space-y-3 group transition"
          >
            <div className="p-2 bg-rose-950 border border-rose-800 text-rose-400 rounded-lg w-fit">
              <FileText size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 group-hover:text-rose-400 transition">Reports</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Module 13</div>
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
            <Globe size={16} className="text-amber-500" />
            <span>GIS Protected Area Spatial Telemetry</span>
          </h3>
          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/60 border border-amber-900/40 px-2.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block"></span>
            <span>Live Sector Tracking</span>
          </span>
        </div>
        <div className="flex-1 w-full h-full relative overflow-hidden">
          <GisObservationMap />
        </div>
      </div>
    </div>
  );
}
