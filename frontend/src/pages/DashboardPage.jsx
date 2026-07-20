import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { 
  Users, Activity, Camera, Trees, MapPin, RadioReceiver, UploadCloud, 
  Leaf, AlertCircle, PlusCircle, FileImage, 
  Map, FileText, ChevronRight, TrendingUp, TrendingDown, Minus, Check, Clock, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import dashboardService from '../services/dashboardService';
import auditLogService from '../services/auditLogService';
import { Link } from 'react-router-dom';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetching = useRef(false);

  const getRoleName = (roleObj) => {
    if (!roleObj) return "";
    return typeof roleObj === 'string' ? roleObj : (roleObj.name || roleObj.role_name || "");
  };
  const isAdmin = getRoleName(user?.role).toLowerCase() === "administrator";

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
      const response = await dashboardService.getDashboardAnalytics();
      setData(response);
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
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="h-[320px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse lg:col-span-2"></div>
            <div className="h-[320px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
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
    { label: 'Total Species', ...metrics.total_species, icon: Leaf },
    { label: 'Total Observations', ...metrics.total_observations, icon: Activity },
    { label: 'Verified Obs.', ...metrics.verified_observations, icon: Trees },
    { label: 'Pending Obs.', ...metrics.pending_observations, icon: AlertCircle },
    { label: 'Monitoring Sites', ...metrics.total_monitoring_sites, icon: MapPin },
    { label: 'Sensor Devices', ...metrics.total_sensor_devices, icon: RadioReceiver },
    { label: 'Total Uploads', ...metrics.total_uploads, icon: UploadCloud },
    { label: 'Registered Users', ...metrics.total_users, icon: Users },
  ];

  const quickActions = [
    { title: 'Add Observation', icon: PlusCircle, path: '/observations', color: 'bg-green-100 text-green-600' },
    { title: 'Upload Image', icon: FileImage, path: '/uploads', color: 'bg-blue-100 text-blue-600' },
    { title: 'Register Device', icon: RadioReceiver, path: '/devices', color: 'bg-purple-100 text-purple-600' },
    { title: 'Open Wildlife Map', icon: Map, path: '/map', color: 'bg-emerald-100 text-emerald-600' },
    { title: 'View Reports', icon: FileText, path: '/reports', color: 'bg-cyan-100 text-cyan-600' },
    { title: 'Predict Species', icon: Camera, path: '/predictions', color: 'bg-rose-100 text-rose-600' },
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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-10">
      {/* Header */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.full_name || 'Harshitha'} 👋</h1>
          <p className="text-primary-foreground/90 font-medium text-lg">Here's your latest wildlife monitoring summary.</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white dark:bg-gray-900 h-full">
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
                  <p className="text-3xl font-bold text-foreground mb-1 tracking-tight">{(kpi.value || 0).toLocaleString()}</p>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Top Charts Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Observation Trend Area Chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-0 shadow-sm rounded-xl h-full transition-shadow hover:shadow-md">
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
        </motion.div>

        {/* Verification Status Donut Chart */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm rounded-xl h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] flex flex-col items-center justify-center relative pb-4">
              {verificationData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={verificationData} 
                        cx="50%" cy="50%" 
                        innerRadius={80} 
                        outerRadius={110} 
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1000}
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
        </motion.div>
      </div>

      {/* Middle Charts Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-0 shadow-sm rounded-xl h-full transition-shadow hover:shadow-md">
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
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm rounded-xl h-full transition-shadow hover:shadow-md">
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
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-0 shadow-sm rounded-xl h-full transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <Link to="/observations" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data.recent_observations && data.recent_observations.length > 0 ? data.recent_observations.map((obs, idx) => (
                  <React.Fragment key={obs.id}>
                    <Link to={`/observations`} className="block group">
                      <div className="flex items-center gap-5 p-3 rounded-xl hover:bg-muted/60 transition-colors duration-200">
                        <div className="w-14 h-14 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                          {obs.file_url ? (
                            <img src={obs.file_url} alt={obs.species} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <Leaf className="w-7 h-7 text-primary/70" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0 flex flex-col justify-center">
                          <h4 className="font-bold text-foreground truncate text-base mb-0.5 group-hover:text-primary transition-colors">{obs.species}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                            <MapPin className="w-3.5 h-3.5" /> 
                            <span className="truncate">{obs.monitoring_site}</span>
                            <span>•</span>
                            <span className="truncate">{obs.observer}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0 justify-center">
                          <StatusBadge status={obs.status} />
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(obs.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="pl-2">
                          <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                    {idx < data.recent_observations.length - 1 && (
                      <div className="h-px w-full bg-border/40 mx-auto my-1" />
                    )}
                  </React.Fragment>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground font-medium">No recent activity found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm rounded-xl h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, idx) => (
                  <Link 
                    key={idx} 
                    to={action.path} 
                    className="flex flex-col items-center justify-center p-5 rounded-xl border border-border/60 hover:bg-white hover:border-transparent transition-all duration-300 gap-3 group text-center cursor-pointer shadow-sm hover:shadow-lg transform hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.color} shadow-sm group-hover:shadow transition-all duration-300 transform group-hover:scale-110`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{action.title}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Admin Widget - Recent System Activity */}
      {isAdmin && (
        <motion.div variants={item} className="w-full mt-8">
          <Card className="border-0 shadow-sm rounded-xl transition-shadow hover:shadow-md bg-white dark:bg-gray-900">
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
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
                        <tr key={log.id || log._id} className="hover:bg-muted/30 transition-colors">
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
      )}
    </motion.div>
  );
};

export default DashboardPage;
