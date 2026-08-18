import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  Users,
  ShieldAlert,
  Activity,
  Cpu,
  Database,
  FileCheck,
  Award,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Key,
  RefreshCw,
  TrendingUp,
  Server,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter
} from 'lucide-react';

export default function AdminDashboard() {
  // State for all 10 Admin sections
  const [kpis, setKpis] = useState(null);
  const [userActivity, setUserActivity] = useState({ items: [], total: 0, page: 1, limit: 10 });
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [aiAnalytics, setAiAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [events, setEvents] = useState([]);
  const [dataQuality, setDataQuality] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Modal State for User Management Actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null); // 'status', 'role', 'password'
  const [modalInput, setModalInput] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [modalMsg, setModalMsg] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getDashboard(searchQuery, userActivity.page, userActivity.limit);
      if (data) {
        setKpis(data.platform_overview);
        setUserActivity(data.user_activity);
        setFlaggedUsers(data.flagged_users);
        setAiAnalytics(data.ai_statistics);
        setSystemHealth(data.system_health);
        setLeaderboard(data.leaderboard);
        setEvents(data.recent_events);
        setDataQuality(data.data_quality);
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error("Error loading Admin Dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userActivity.page, searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(userActivity.total / userActivity.limit)) {
      setUserActivity(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleUserAction = async (e) => {
    e.preventDefault();
    if (!selectedUser || !actionType) return;

    try {
      if (actionType === 'status') {
        await adminAPI.updateUserStatus(selectedUser.id, modalInput, actionReason);
        setUserActivity(prev => ({
          ...prev,
          items: prev.items.map(u => u.id === selectedUser.id ? { ...u, account_status: modalInput } : u)
        }));
      } else if (actionType === 'role') {
        await adminAPI.updateUserRole(selectedUser.id, modalInput);
        setUserActivity(prev => ({
          ...prev,
          items: prev.items.map(u => u.id === selectedUser.id ? { ...u, role: modalInput } : u)
        }));
      } else if (actionType === 'password') {
        await adminAPI.resetUserPassword(selectedUser.id, modalInput);
      }
      setModalMsg(`Action successfully performed on ${selectedUser.username}`);
      setTimeout(() => {
        setSelectedUser(null);
        setActionType(null);
        setModalMsg('');
        fetchAdminData();
      }, 500);
    } catch (err) {
      setModalMsg(err.response?.data?.detail || "Action failed to execute.");
    }
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-16 text-zinc-100">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-950/80 border border-rose-800 text-rose-400 text-[10px] font-extrabold uppercase tracking-wider">
              Admin Platform Control
            </span>
            <span className="text-xs text-zinc-500 font-mono">System v1.0.0</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-100 mt-1">Platform Administration Dashboard</h1>
          <p className="text-xs text-zinc-400">Monitor system health, user activity, trust scores, AI inference metrics, and data quality</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Admin Alerts Panel */}
      {alerts && alerts.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-900/40 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertCircle size={15} />
            <span>System Telemetry Alerts ({alerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alt) => (
              <div key={alt.id} className="bg-zinc-950 p-3 rounded-xl border border-rose-900/30 flex items-start space-x-3">
                <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-rose-300">{alt.title}</p>
                  <p className="text-zinc-400 text-[11px]">{alt.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1: PLATFORM OVERVIEW KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Registered Users</p>
          <h3 className="text-xl font-black text-emerald-400 font-mono">{kpis?.total_registered_users ?? '...'}</h3>
          <p className="text-[9px] text-zinc-500">Platform Accounts</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Active Today</p>
          <h3 className="text-xl font-black text-blue-400 font-mono">{kpis?.active_users_today ?? '...'}</h3>
          <p className="text-[9px] text-zinc-500">Unique logins / activity</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Image Uploads</p>
          <h3 className="text-xl font-black text-emerald-400 font-mono">{kpis?.total_image_uploads ?? '...'}</h3>
          <p className="text-[9px] text-zinc-500">Stored GridFS images</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Audio Uploads</p>
          <h3 className="text-xl font-black text-emerald-400 font-mono">{kpis?.total_audio_uploads ?? '...'}</h3>
          <p className="text-[9px] text-zinc-500">Stored GridFS audio</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">AI Predictions</p>
          <h3 className="text-xl font-black text-emerald-400 font-mono">{kpis?.total_ai_analyses_completed ?? '...'}</h3>
          <p className="text-[9px] text-zinc-500">Executed pipeline runs</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Flagged Users</p>
          <h3 className="text-xl font-black text-amber-400 font-mono">{kpis?.flagged_users ?? '...'}</h3>
          <p className="text-[9px] text-zinc-500">Risk Score &gt; 30</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Pending Reviews</p>
          <h3 className="text-xl font-black text-rose-400 font-mono">{kpis?.pending_user_reviews ?? '...'}</h3>
          <p className="text-[9px] text-zinc-500">Needs Review status</p>
        </div>
      </div>

      {/* SECTION 6: SYSTEM HEALTH MONITOR */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Server size={15} />
            <span>Infrastructure & Microservice System Health</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Live latency probes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* PostgreSQL */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">PostgreSQL DB</span>
              <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[9px] font-extrabold rounded uppercase">
                {systemHealth?.postgresql?.status || 'Online'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">Relational Metadata Store</p>
            <p className="text-xs font-mono text-emerald-400 font-semibold">{systemHealth?.postgresql?.response_time_ms || 1.4} ms latency</p>
          </div>

          {/* MongoDB */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">MongoDB Atlas</span>
              <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[9px] font-extrabold rounded uppercase">
                {systemHealth?.mongodb?.status || 'Online'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">GridFS &amp; Prediction Store</p>
            <p className="text-xs font-mono text-emerald-400 font-semibold">{systemHealth?.mongodb?.response_time_ms || 8.2} ms latency</p>
          </div>

          {/* Redis */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Redis Cache</span>
              <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[9px] font-extrabold rounded uppercase">
                {systemHealth?.redis?.status || 'Healthy'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">Taxonomy &amp; Session Store</p>
            <p className="text-xs font-mono text-emerald-400 font-semibold">{systemHealth?.redis?.response_time_ms || 1.2} ms latency</p>
          </div>

          {/* FastAPI */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">FastAPI Engine</span>
              <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[9px] font-extrabold rounded uppercase">
                {systemHealth?.backend_api?.status || 'Online'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">PyTorch &amp; TF AI Service</p>
            <p className="text-xs font-mono text-emerald-400 font-semibold">{systemHealth?.backend_api?.response_time_ms || 0.5} ms latency</p>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 4: USER ACTIVITY MONITOR & FLAGGED USERS */}
      <div className="space-y-6">
        
        {/* Flagged Users Panel */}
        {flaggedUsers && flaggedUsers.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert size={15} />
                <span>Flagged Users &amp; Risk Score Analysis Panel</span>
              </div>
              <span className="text-[10px] text-amber-500 font-mono">Requires Administrative Review</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flaggedUsers.map((fu) => (
                <div key={fu.user_id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-200">{fu.full_name || fu.username}</h4>
                        <p className="text-[11px] text-zinc-500 font-mono">@{fu.username} • Role: {fu.role}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-mono font-extrabold uppercase ${
                        fu.risk_score > 60 ? 'bg-rose-950/80 text-rose-400 border border-rose-800' : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      }`}>
                        Risk Score: {fu.risk_score}/100
                      </span>
                    </div>

                    <div className="space-y-1 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850 text-xs">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold">Flagged Reasons:</p>
                      <ul className="list-disc list-inside text-[11px] text-zinc-300 space-y-0.5">
                        {fu.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-850 flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase ${
                      fu.account_status === 'Suspended' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      Status: {fu.account_status}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedUser({ id: fu.user_id, username: fu.username });
                          setActionType('status');
                          setModalInput('Suspended');
                        }}
                        className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 text-[10px] font-bold rounded-lg transition cursor-pointer"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser({ id: fu.user_id, username: fu.username });
                          setActionType('status');
                          setModalInput('Normal');
                        }}
                        className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/40 text-[10px] font-bold rounded-lg transition cursor-pointer"
                      >
                        Reactivate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Searchable User Activity Table */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Users size={15} />
              <span>User Activity &amp; Risk Monitor</span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search user, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Activity Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-[10px] text-zinc-500 uppercase tracking-wider font-bold border-b border-zinc-850">
                <tr>
                  <th className="py-3 px-3">User Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Last Activity</th>
                  <th className="py-3 px-3">Images</th>
                  <th className="py-3 px-3">Audio</th>
                  <th className="py-3 px-3">Analyses</th>
                  <th className="py-3 px-3">Risk Score</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-855">
                {userActivity.items && userActivity.items.length > 0 ? (
                  userActivity.items.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-950/60 transition">
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-bold text-zinc-200">{u.full_name || u.username}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">@{u.username}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 font-mono text-[10px]">
                        {u.last_login ? u.last_login.slice(0, 10) : 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">{u.images_uploaded}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-400">{u.audio_uploaded}</td>
                      <td className="py-3 px-3 font-mono font-bold text-zinc-200">{u.ai_analyses_completed}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.risk_score > 60 
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800' 
                            : u.risk_score > 30 
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800' 
                            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        }`}>
                          {u.risk_score}/100 ({u.trust_level})
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          u.account_status === 'Suspended' 
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-900/50' 
                            : u.account_status === 'Needs Review' 
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-900/50' 
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
                        }`}>
                          {u.account_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser({ id: u.id, username: u.username });
                              setActionType('role');
                              setModalInput(u.role);
                            }}
                            className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 rounded text-[10px] font-semibold transition"
                            title="Change Role"
                          >
                            Role
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser({ id: u.id, username: u.username });
                              setActionType('status');
                              setModalInput(u.account_status === 'Suspended' ? 'Normal' : 'Suspended');
                            }}
                            className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-amber-400 rounded text-[10px] font-semibold transition"
                            title="Toggle Status"
                          >
                            Status
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser({ id: u.id, username: u.username });
                              setActionType('password');
                              setModalInput('');
                            }}
                            className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-rose-400 rounded text-[10px] font-semibold transition"
                            title="Reset Password"
                          >
                            <Key size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-6 text-center text-zinc-500 italic">No user activity records found matching search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-zinc-855 pt-3 text-xs text-zinc-400">
            <span>Page {userActivity.page} of {Math.max(1, Math.ceil(userActivity.total / userActivity.limit))} ({userActivity.total} users)</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(userActivity.page - 1)}
                disabled={userActivity.page === 1}
                className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 disabled:opacity-40 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => handlePageChange(userActivity.page + 1)}
                disabled={userActivity.page >= Math.ceil(userActivity.total / userActivity.limit)}
                className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 disabled:opacity-40 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: AI USAGE ANALYTICS */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Cpu size={15} />
            <span>AI Inference Engine Telemetry &amp; Usage Analytics</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Real-time model performance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-1">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Primary Model Engine</p>
            <h4 className="text-base font-extrabold text-emerald-400 truncate">{aiAnalytics?.most_used_model || 'YOLOv8 + ViT'}</h4>
            <p className="text-[10px] text-zinc-500">Highest volume inference model</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-1">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Average AI Confidence</p>
            <h4 className="text-base font-extrabold text-emerald-400 font-mono">{aiAnalytics?.average_confidence || 0}%</h4>
            <p className="text-[10px] text-zinc-500">Across all completed analyses</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-1">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Unknown Predictions</p>
            <h4 className="text-base font-extrabold text-amber-400 font-mono">{aiAnalytics?.unknown_predictions_count || 0}</h4>
            <p className="text-[10px] text-zinc-500">Low confidence / unclassified</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-1">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Endangered Detections</p>
            <h4 className="text-base font-extrabold text-rose-400 font-mono">{aiAnalytics?.endangered_species_detections || 0}</h4>
            <p className="text-[10px] text-zinc-500">IUCN EN / CR / VU species</p>
          </div>
        </div>
      </div>

      {/* SECTION 7, 8 & 10: LEADERBOARD, EVENTS & DATA QUALITY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Section 7: Top Researcher Leaderboard */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
            <Award size={15} />
            <span>Top Researcher Leaderboard</span>
          </div>

          <div className="space-y-3">
            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((r, idx) => (
                <div key={r.user_id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{r.name}</p>
                      <p className="text-[10px] text-zinc-500">{r.role}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-xs font-bold text-emerald-400">{r.ai_analyses} Runs</p>
                    <p className="text-[10px] text-zinc-500">{r.species_identified} Species</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic">No researcher leaderboard statistics found.</p>
            )}
          </div>
        </div>

        {/* Section 8: Recent Platform Events */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
            <Activity size={15} />
            <span>Recent Platform Events Feed</span>
          </div>

          <div className="space-y-2.5">
            {events && events.length > 0 ? (
              events.slice(0, 5).map((evt, i) => (
                <div key={i} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-start space-x-2.5">
                  <Clock size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <p className="text-zinc-200">{evt.message}</p>
                    <p className="text-[10px] font-mono text-zinc-500">{evt.timestamp ? String(evt.timestamp).slice(0, 16) : 'Just now'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic">No platform events logged.</p>
            )}
          </div>
        </div>

        {/* Section 10: Data Quality Monitor */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
            <FileCheck size={15} />
            <span>Data Quality Monitor</span>
          </div>

          <div className="space-y-2">
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Missing Metadata</span>
              <span className="font-mono font-bold text-amber-400">{dataQuality?.missing_metadata || 0}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Incomplete Surveys</span>
              <span className="font-mono font-bold text-amber-400">{dataQuality?.incomplete_surveys || 0}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Duplicate Observations</span>
              <span className="font-mono font-bold text-zinc-200">{dataQuality?.duplicate_observations || 0}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Failed AI Analyses</span>
              <span className="font-mono font-bold text-rose-400">{dataQuality?.failed_ai_analyses || 0}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Missing Site Assignments</span>
              <span className="font-mono font-bold text-zinc-200">{dataQuality?.missing_monitoring_sites || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* USER MANAGEMENT ACTION MODAL */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100 uppercase tracking-wider">
              {actionType === 'status' && `Update Account Status: ${selectedUser.username}`}
              {actionType === 'role' && `Change User Role: ${selectedUser.username}`}
              {actionType === 'password' && `Reset Password: ${selectedUser.username}`}
            </h3>

            <form onSubmit={handleUserAction} className="space-y-4">
              {actionType === 'status' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Select New Status</label>
                  <select
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              )}

              {actionType === 'role' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Select New Role</label>
                  <select
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                  >
                    <option value="Researcher">Researcher</option>
                    <option value="Officer">Officer</option>
                    <option value="Analyst">Analyst</option>
                    <option value="ForestDept">ForestDept</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              )}

              {actionType === 'password' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password..."
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                    required
                  />
                </div>
              )}

              {modalMsg && (
                <p className="text-xs font-semibold text-emerald-400">{modalMsg}</p>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Execute Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
