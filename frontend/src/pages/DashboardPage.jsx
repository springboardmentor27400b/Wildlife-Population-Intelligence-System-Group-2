import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { 
  Users, Activity, Camera, Trees, MapPin, RadioReceiver, UploadCloud, 
  Leaf, AlertCircle, PlusCircle, FileImage, 
  Map, FileText, ChevronRight, TrendingUp, TrendingDown, Minus, Check, Clock, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import ecosystemHealthService from '../services/ecosystemHealthService';
import habitatIntelligenceService from '../services/habitatIntelligenceService';
import conservationRecommendationService from '../services/conservationRecommendationService';
import predictionService from '../services/predictionService';
import wildlifeDashboardService from '../services/wildlifeDashboardService';
import siteService from '../services/siteService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, ComposedChart } from 'recharts';
import dashboardService from '../services/dashboardService';
import { populationEstimationService } from '../services/populationEstimationService';
import auditLogService from '../services/auditLogService';
import { Link } from 'react-router-dom';
import DashboardHero from '../components/ui/DashboardHero';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import Tooltip from '../components/ui/tooltip';
import SystemStatusWidget from '../components/ui/SystemStatusWidget';
import QuickActionCard from '../components/ui/QuickActionCard';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

// Theme Colors
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const VERIFICATION_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

const DashboardPage = () => {
  const { user, loading: userLoading } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [popData, setPopData] = useState(null);

  const [ecoData, setEcoData] = useState(null);
  const [habData, setHabData] = useState(null);
  const [consData, setConsData] = useState(null);
  const [predData, setPredData] = useState([]);
  const [alertsData, setAlertsData] = useState([]);
  const [sitesData, setSitesData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetching = useRef(false);

  function getRoleName(roleObj) {
    if (!roleObj) return "";
    return typeof roleObj === 'string' ? roleObj : (roleObj.name || roleObj.role_name || "");
  }
  const isAdmin = getRoleName(user?.role).toLowerCase() === "administrator";

  // Drag and drop layout
  const defaultLayout = [
    'kpis', 
    'population_intelligence', 
    'habitat_intelligence', 
    'ecosystem_health', 
    'conservation_insights', 
    'charts_top', 
    'charts_middle', 
    'site_overview',
    'recent_predictions',
    'smart_alerts',
    'bottom_row'
  ];
  if (isAdmin) defaultLayout.push('system_activity');
  
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('dashboard_layout');
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to generate before setting opacity
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    const newLayout = [...layout];
    const item = newLayout.splice(draggedItem, 1)[0];
    newLayout.splice(index, 0, item);
    setLayout(newLayout);
    setDraggedItem(index);
  };

  const handleDragEnd = (e) => {
    setDraggedItem(null);
    if (e.target) e.target.style.opacity = '1';
    localStorage.setItem('dashboard_layout', JSON.stringify(layout));
  };

  const [recentAuditLogs, setRecentAuditLogs] = useState([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      const fetchRecentLogs = async () => {
        setIsLogsLoading(true);
        try {
          const res = await auditLogService.getAuditLogs({ page: 1, limit: 5 });
          setRecentAuditLogs(res.logs || []);
        } catch (err) {
          console.error("Failed to fetch recent audit logs", err);
        } finally {
          setIsLogsLoading(false);
        }
      };
      fetchRecentLogs();
    }
  }, [user, isAdmin]);

  const getSeverityBadge = (severity) => {
    const sev = (severity || 'INFO').toUpperCase();
    switch (sev) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold border">
            SUCCESS
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold border">
            WARNING
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold border">
            ERROR
          </span>
        );
      default: // INFO
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold border">
            INFO
          </span>
        );
    }
  };

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (isFetching.current) return;
    try {
      isFetching.current = true;
      if (!silent) setIsLoading(true);
      setError(null);
      const [
        dashboardRes, popRes, ecoRes, habRes, consRes, predRes, alertsRes, sitesRes
      ] = await Promise.allSettled([
        dashboardService.getDashboardAnalytics(),
        populationEstimationService.getDashboardStats(),
        ecosystemHealthService.getSummary(),
        habitatIntelligenceService.getSummary(),
        conservationRecommendationService.getSummary(),
        predictionService.getPredictions({ limit: 5 }),
        wildlifeDashboardService.getAlerts(),
        siteService.getSites()
      ]);

      setData(dashboardRes.status === 'fulfilled' ? dashboardRes.value : null);
      setPopData(popRes.status === 'fulfilled' ? popRes.value : null);
      setEcoData(ecoRes.status === 'fulfilled' ? ecoRes.value : null);
      setHabData(habRes.status === 'fulfilled' ? habRes.value : null);
      setConsData(consRes.status === 'fulfilled' ? consRes.value : null);
      setPredData(predRes.status === 'fulfilled' ? (predRes.value?.items || predRes.value?.predictions || []) : []);
      setAlertsData(alertsRes.status === 'fulfilled' ? (alertsRes.value?.alerts || alertsRes.value || []) : []);
      setSitesData(sitesRes.status === 'fulfilled' ? (sitesRes.value?.sites || sitesRes.value || []) : []);
    } catch (err) {
      console.error("Dashboard API failed", err);
      if (!silent) setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      fetchDashboardData();
    }
  }, [userLoading, user, fetchDashboardData]);

  // Polling every 30 seconds if tab is active
  useEffect(() => {
    if (!user) return;
    
    let intervalId;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalId);
      } else {
        fetchDashboardData(true);
        intervalId = setInterval(() => {
          fetchDashboardData(true);
        }, 30000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    if (!document.hidden) {
      intervalId = setInterval(() => {
        fetchDashboardData(true);
      }, 30000);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [user, fetchDashboardData]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (userLoading || (isLoading && !data)) {
    return (
      <div className="space-y-8">
        <SkeletonLoader type="chart" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <SkeletonLoader key={i} type="kpi" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2"><SkeletonLoader type="chart" /></div>
            <div><SkeletonLoader type="chart" /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button 
          onClick={() => fetchDashboardData(false)}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const hasData = metrics.total_observations?.value > 0 || metrics.total_monitoring_sites?.value > 0 || metrics.total_sensor_devices?.value > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Leaf className="w-16 h-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No wildlife data available yet.</h2>
        <p className="text-muted-foreground mb-6 max-w-md text-center">
          Start by adding a monitoring site or uploading your first wildlife observation to see analytics.
        </p>
        <Link 
          to="/observations"
          className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition flex items-center gap-2 shadow-sm"
        >
          <PlusCircle className="w-5 h-5" /> Add Observation
        </Link>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Observations', ...metrics.total_observations, icon: Activity },
    { label: 'Species Monitored', value: metrics.total_species?.value || popData?.total_species || 0, mom_change: metrics.total_species?.mom_change || 0, icon: Leaf },
    { label: 'Active Sites', value: metrics.total_monitoring_sites?.value || sitesData?.length || 0, mom_change: metrics.total_monitoring_sites?.mom_change || 0, icon: MapPin },
    { label: 'Species At Risk', value: popData?.high_risk_species || 0, mom_change: 0, icon: AlertCircle },
    { label: 'AI Predictions', ...metrics.total_predictions, icon: Camera },
    { label: 'Ecosystem Health', value: ecoData?.overall_score || ecoData?.health_score || 0, mom_change: 0, icon: Trees }
  ];

  const quickActions = [
    { title: 'Upload Observation', icon: PlusCircle, path: '/observations', gradientClass: 'from-green-500 to-emerald-600' },
    { title: 'Monitoring Sites', icon: MapPin, path: '/sites', gradientClass: 'from-blue-500 to-cyan-600' },
    { title: 'AI Detection', icon: Camera, path: '/predictions', gradientClass: 'from-purple-500 to-indigo-600' },
    { title: 'Bioacoustics', icon: RadioReceiver, path: '/audio-predictions', gradientClass: 'from-rose-500 to-pink-600' },
    { title: 'View Reports', icon: FileText, path: '/wildlife-reports', gradientClass: 'from-amber-500 to-orange-600' },
    { title: 'Map View', icon: Map, path: '/map', gradientClass: 'from-teal-500 to-emerald-600' },
  ];
  
  const topSpeciesData = data.species_distribution ? data.species_distribution.slice(0, 5) : [];
  const verificationData = [
    { name: 'Verified', value: metrics.verified_observations?.value || 0 },
    { name: 'Pending', value: metrics.pending_observations?.value || 0 },
  ].filter(item => item.value > 0);

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
            <Check className="w-3 h-3" /> Verified
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-900 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const renderSection = (sectionId, index) => {
    const DragHandle = () => (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-gray-300" />
    );

    const sectionProps = {
      draggable: true,
      onDragStart: (e) => handleDragStart(e, index),
      onDragOver: (e) => handleDragOver(e, index),
      onDragEnd: handleDragEnd,
      className: "relative group transition-all duration-300 pt-4 cursor-default",
      variants: item
    };

    switch (sectionId) {
      case 'kpis':
        return (
          <motion.div key="kpis" {...sectionProps}>
            <DragHandle />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, i) => (
                <motion.div key={i} whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <CardContent className="p-6 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center transform transition-transform group-hover:scale-110">
                          <kpi.icon className="h-6 w-6 text-primary" />
                        </div>
                        {kpi.mom_change !== null && kpi.mom_change !== undefined ? (
                          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${kpi.mom_change > 0 ? 'bg-green-100 text-green-700' : kpi.mom_change < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {kpi.mom_change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : kpi.mom_change < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                            {Math.abs(kpi.mom_change)}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                            New
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-foreground mb-1 tracking-tight">
                          <AnimatedNumber value={kpi.value || 0} />
                        </p>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                          {kpi.label}
                          <Tooltip content={<div className="text-center"><p className="font-semibold mb-1">{kpi.label}</p><p className="text-[10px] text-gray-300">Last updated: Just now</p></div>} position="top">
                            <AlertCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                          </Tooltip>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      
      
      case 'population_intelligence':
        return (
          <motion.div key="population_intelligence" {...sectionProps}>
            <DragHandle />
            <div className="grid lg:grid-cols-2 gap-8 mt-4">
              <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary"/> Population Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pb-4">
                  {popData && popData.population_trends ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={popData.population_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="popTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
                        <XAxis dataKey="month" tick={{fontSize: 12}} />
                        <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                        <RechartsTooltip cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 2 }} />
                        <Area type="monotone" dataKey="population" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#popTrend)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="h-full flex items-center justify-center text-muted-foreground">No population trend data available</div>}
                </CardContent>
              </Card>
              <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500"/> High Risk Species</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popData && popData.risk_distribution && popData.risk_distribution.length > 0 ? (
                      popData.risk_distribution.map((r, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-muted/40">
                          <span className="font-semibold text-sm">{r.species || r.name}</span>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">Risk Level: {r.risk_level || 'High'}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-8">No high risk species data available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 'habitat_intelligence':
        return (
          <motion.div key="habitat_intelligence" {...sectionProps}>
            <DragHandle />
            <div className="grid lg:grid-cols-3 gap-8 mt-4">
              <div className="lg:col-span-2">
                <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-green-500"/> Habitat Quality</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    {habData && habData.habitat_quality ? (
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={habData.habitat_quality} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="region" tick={{fontSize: 12}} />
                           <YAxis tick={{fontSize: 12}} />
                           <RechartsTooltip />
                           <Bar dataKey="quality_score" fill="#22c55e" radius={[4, 4, 0, 0]} />
                         </BarChart>
                       </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-muted-foreground">No habitat quality data available</div>}
                  </CardContent>
                </Card>
              </div>
              <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl h-full">
                <CardHeader>
                  <CardTitle>Habitat Stability</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[280px]">
                  {habData && habData.stability_score ? (
                    <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-green-100">
                      <div className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent animate-spin-slow" style={{transform: `rotate(${habData.stability_score * 3.6}deg)`}}></div>
                      <div className="text-center">
                         <span className="text-3xl font-bold block">{habData.stability_score}%</span>
                         <span className="text-xs text-muted-foreground">Stable</span>
                      </div>
                    </div>
                  ) : <div className="text-muted-foreground">N/A</div>}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 'ecosystem_health':
        return (
          <motion.div key="ecosystem_health" {...sectionProps}>
            <DragHandle />
            <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trees className="w-5 h-5 text-teal-500"/> Ecosystem Health Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl">
                    <span className="text-sm text-muted-foreground font-medium mb-1">Health Score</span>
                    <span className="text-3xl font-bold text-teal-600">{ecoData?.overall_score || ecoData?.health_score || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl">
                    <span className="text-sm text-muted-foreground font-medium mb-1">Biodiversity Score</span>
                    <span className="text-3xl font-bold text-blue-600">{ecoData?.biodiversity_score || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl">
                    <span className="text-sm text-muted-foreground font-medium mb-1">Sustainability Index</span>
                    <span className="text-3xl font-bold text-green-600">{ecoData?.sustainability_index || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'conservation_insights':
        return (
          <motion.div key="conservation_insights" {...sectionProps}>
            <DragHandle />
            <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-500"/> Conservation Priority Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consData && consData.recommendations && consData.recommendations.length > 0 ? (
                    consData.recommendations.slice(0, 4).map((rec, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">{rec.species || rec.title}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" /> Threat: {rec.threat_level || 'Medium'}
                          </span>
                        </div>
                        <div className="mt-2 sm:mt-0 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                          {rec.action || rec.recommended_action}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No conservation actions currently recommended.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'site_overview':
        return (
          <motion.div key="site_overview" {...sectionProps}>
            <DragHandle />
            <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Map className="w-5 h-5 text-blue-500"/> Monitoring Site Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="block text-xs text-blue-700 font-semibold mb-1">Total Sites</span>
                    <span className="text-xl font-bold text-blue-900">{sitesData?.length || 0}</span>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="block text-xs text-green-700 font-semibold mb-1">Active</span>
                    <span className="text-xl font-bold text-green-900">{sitesData?.filter(s => s.status === 'Active' || s.is_active)?.length || 0}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="block text-xs text-amber-700 font-semibold mb-1">Maintenance</span>
                    <span className="text-xl font-bold text-amber-900">{sitesData?.filter(s => s.status === 'Maintenance')?.length || 0}</span>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="block text-xs text-red-700 font-semibold mb-1">Offline</span>
                    <span className="text-xl font-bold text-red-900">{sitesData?.filter(s => s.status === 'Offline' || s.status === 'Inactive' || s.is_active === false)?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'recent_predictions':
        return (
          <motion.div key="recent_predictions" {...sectionProps}>
            <DragHandle />
            <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl mt-4">
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-purple-500"/> Recent AI Predictions</CardTitle>
                <Link to="/predictions" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground">
                        <th className="pb-2 font-medium">Species</th>
                        <th className="pb-2 font-medium">Confidence</th>
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predData && predData.length > 0 ? (
                        predData.slice(0, 5).map((p, i) => (
                          <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                            <td className="py-3 font-medium text-foreground">{p.species || p.predicted_class}</td>
                            <td className="py-3">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                                {Math.round((p.confidence || 0) * 100)}%
                              </span>
                            </td>
                            <td className="py-3 text-muted-foreground">{new Date(p.created_at || p.timestamp).toLocaleDateString()}</td>
                            <td className="py-3">
                              {p.status === 'Verified' ? <StatusBadge status="Verified" /> : p.status === 'Rejected' ? <StatusBadge status="Rejected" /> : <StatusBadge status="Pending" />}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="py-6 text-center text-muted-foreground">No recent AI predictions.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'smart_alerts':
        return (
          <motion.div key="smart_alerts" {...sectionProps}>
            <DragHandle />
            <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl mt-4">
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500"/> Smart Alerts</CardTitle>
                <Link to="/notifications" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alertsData && alertsData.length > 0 ? (
                    alertsData.slice(0, 5).map((alert, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition border border-transparent hover:border-border/60">
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${alert.priority === 'High' ? 'bg-red-500' : alert.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{alert.message || alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at || alert.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No active alerts at this time.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'charts_top':
        return (
          <motion.div key="charts_top" {...sectionProps}>
            <DragHandle />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-0 hover: duration-300 h-full bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardHeader>
                    <CardTitle>Observation Trend (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[320px] pb-4">
                    {data.observation_trend && data.observation_trend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.observation_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
                          <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} />
                          <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                          <RechartsTooltip cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 2 }} />
                          <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" animationDuration={1000} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No recent trend data</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-0 hover: duration-300 h-full bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[320px] flex flex-col items-center justify-center relative pb-4">
                    {verificationData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={verificationData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" animationDuration={1000}
                            >
                              {verificationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={VERIFICATION_COLORS[index % VERIFICATION_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-2">
                          <span className="text-3xl font-bold text-foreground block tracking-tight">
                            {Math.round((metrics.verified_observations?.value / ((metrics.verified_observations?.value + metrics.pending_observations?.value) || 1)) * 100)}%
                          </span>
                          <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Verified</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No verification data</span>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        );

      case 'charts_middle':
        return (
          <motion.div key="charts_middle" {...sectionProps}>
            <DragHandle />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-0 hover: duration-300 h-full bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardHeader>
                    <CardTitle>Top Observed Species</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[320px] pb-4">
                    {topSpeciesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topSpeciesData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.4} />
                          <XAxis type="number" allowDecimals={false} tick={{fontSize: 12}} />
                          <YAxis dataKey="species" type="category" width={110} tick={{ fontSize: 13, fontWeight: 500 }} />
                          <RechartsTooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={32} animationDuration={1000} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No species data</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-0 hover: duration-300 h-full bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardHeader>
                    <CardTitle>Monthly Observations</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[320px] flex items-center justify-center pb-4">
                    {data.monthly_observations && data.monthly_observations.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.monthly_observations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
                          <XAxis dataKey="month" tick={{fontSize: 12}} tickMargin={10} />
                          <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                          <RechartsTooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={48} animationDuration={1000} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <span className="text-muted-foreground">No monthly data</span>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        );

      case 'bottom_row':
        return (
          <motion.div key="bottom_row" {...sectionProps}>
            <DragHandle />
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-0 hover: duration-300 h-full bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle>Recent Activity</CardTitle>
                    <Link to="/observations" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto overflow-y-auto max-h-[360px] rounded-xl border border-border/50">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-sm">
                          <tr className="border-b border-border/60 text-muted-foreground bg-muted/20">
                            <th className="py-2.5 px-4 font-semibold">Species</th>
                            <th className="py-2.5 px-4 font-semibold">Site</th>
                            <th className="py-2.5 px-4 font-semibold">Date</th>
                            <th className="py-2.5 px-4 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {data.recent_observations && data.recent_observations.length > 0 ? (
                            data.recent_observations.slice(0, 6).map((obs, idx) => (
                              <tr key={obs.id || idx} className="hover:bg-muted/40 transition even:bg-muted/10">
                                <td className="py-3 px-4 font-medium text-foreground">{obs.species}</td>
                                <td className="py-3 px-4 text-muted-foreground text-xs"><div className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {obs.monitoring_site}</div></td>
                                <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(obs.created_at).toLocaleDateString()}</td>
                                <td className="py-3 px-4"><StatusBadge status={obs.status} /></td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="4" className="py-8 text-center text-muted-foreground">No recent observations found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <SystemStatusWidget lastSync={new Date()} />
              </div>

              <div>
                <Card className="border-0 hover: duration-300 h-full bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="grid grid-cols-2 gap-3 h-full">
                      {quickActions.slice(0,4).map((action, idx) => (
                        <QuickActionCard key={idx} {...action} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        );

      case 'system_activity':
        return isAdmin ? (
          <motion.div key="system_activity" {...sectionProps}>
            <DragHandle />
            <Card className="border-0 hover: duration-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl mt-4">
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <CardTitle>Recent System Activity (Audit Logs)</CardTitle>
                </div>
                <Link to="/audit-logs" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                  Manage Audit Logs <ChevronRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent>
                {isLogsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recentAuditLogs.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                        <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Module</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Severity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 text-sm">
                        {recentAuditLogs.map((log) => (
                          <tr key={log.id || log._id} className="hover:bg-muted/30 transition-colors even:bg-muted/20">
                            <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-medium text-foreground">
                              {log.user_name || "System"}
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-muted px-2 py-1 rounded text-xs font-medium border border-border/40">
                                {log.module}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs font-bold text-foreground">
                              {log.action}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground max-w-xs truncate" title={log.description}>
                              {log.description}
                            </td>
                            <td className="py-3 px-4">
                              {getSeverityBadge(log.severity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No system activity logs found.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-10">
      <div className="flex justify-between items-center mb-4">
        <DashboardHero user={user} lastSync={new Date()} systemHealth="Healthy" />
      </div>

      <div className="flex flex-col space-y-8">
        {layout.map((sectionId, index) => renderSection(sectionId, index))}
      </div>
    </motion.div>
  );
};

export default DashboardPage;
