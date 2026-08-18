import React, { useState, useEffect } from 'react';
import { alertsAPI } from '../services/api';
import {
  Bell,
  ShieldAlert,
  TrendingDown,
  Sun,
  Cpu,
  Compass,
  CheckCircle2,
  RefreshCw,
  CheckCheck,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

export default function AdminAlertsHub() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, endangered_species, population_decline, habitat_degradation, device_alert, conservation_notification
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlertsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summaryData = await alertsAPI.getSummary();
      setSummary(summaryData);

      const params = { is_read: false };
      if (activeTab !== 'ALL') params.alert_type = activeTab;
      if (severityFilter !== 'ALL') params.severity = severityFilter;

      const list = await alertsAPI.getAlerts(params);
      setAlerts(list || []);
    } catch (err) {
      console.error('Failed to fetch Admin alerts:', err);
      setError('Failed to load system notifications & alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
    const handleUpdate = () => fetchAlertsData();
    window.addEventListener('alertsUpdated', handleUpdate);
    return () => window.removeEventListener('alertsUpdated', handleUpdate);
  }, [activeTab, severityFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await alertsAPI.refreshAlerts();
      await fetchAlertsData();
      window.dispatchEvent(new CustomEvent('alertsUpdated'));
    } catch (err) {
      console.error('Refresh alerts error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await alertsAPI.markAsRead(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      const summaryData = await alertsAPI.getSummary();
      setSummary(summaryData);
      window.dispatchEvent(new CustomEvent('alertsUpdated'));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setRefreshing(true);
      await alertsAPI.markAllAsRead();
      setAlerts([]);
      await fetchAlertsData();
      window.dispatchEvent(new CustomEvent('alertsUpdated'));
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'endangered_species':
        return <ShieldAlert size={18} className="text-red-400" />;
      case 'population_decline':
        return <TrendingDown size={18} className="text-amber-400" />;
      case 'habitat_degradation':
        return <Sun size={18} className="text-yellow-400" />;
      case 'device_alert':
        return <Cpu size={18} className="text-blue-400" />;
      case 'conservation_notification':
      default:
        return <Compass size={18} className="text-purple-400" />;
    }
  };

  const getBadgeStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-800/80 animate-pulse';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'MEDIUM':
        return 'bg-yellow-950/80 text-yellow-400 border-yellow-800/80';
      case 'INFO':
      default:
        return 'bg-blue-950/80 text-blue-400 border-blue-800/80';
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (a.is_read) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q) ||
      a.alert_type.toLowerCase().includes(q)
    );
  });

  const categoryTabs = [
    { key: 'ALL', label: 'All Alerts', count: summary?.total || 0, icon: Bell },
    { key: 'endangered_species', label: 'Endangered Species', count: summary?.counts_by_type?.endangered_species || 0, icon: ShieldAlert },
    { key: 'population_decline', label: 'Population Decline', count: summary?.counts_by_type?.population_decline || 0, icon: TrendingDown },
    { key: 'habitat_degradation', label: 'Habitat Degradation', count: summary?.counts_by_type?.habitat_degradation || 0, icon: Sun },
    { key: 'device_alert', label: 'Device Alerts', count: summary?.counts_by_type?.device_alert || 0, icon: Cpu },
    { key: 'conservation_notification', label: 'Conservation Advisories', count: summary?.counts_by_type?.conservation_notification || 0, icon: Compass },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-950/60 border border-red-800/60 text-red-400 flex items-center gap-1">
              <Radio size={12} className="animate-pulse" />
              Module 12 Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-950 border border-zinc-800 text-zinc-400">
              Admin Governance Scope (All 5 Categories)
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-100 mt-1 flex items-center gap-2">
            <span>System Notifications & Alerts Hub</span>
            <Bell size={20} className="text-emerald-400" />
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time monitoring telemetry covering endangered species sightings, population drops, habitat degradation, hardware status, and conservation advisories.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-emerald-400' : ''} />
            <span>Scan Engine</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={refreshing || summary?.unread_total === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-40 cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Unread Alerts</p>
            <p className="text-xl font-extrabold text-red-400 mt-0.5">{summary?.unread_total || 0}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-red-950/50 border border-red-900/40 flex items-center justify-center text-red-400">
            <Bell size={18} />
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Critical Threats</p>
            <p className="text-xl font-extrabold text-red-500 mt-0.5">{summary?.counts_by_severity?.CRITICAL || 0}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-red-950/50 border border-red-900/40 flex items-center justify-center text-red-500">
            <ShieldAlert size={18} />
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">High Severity</p>
            <p className="text-xl font-extrabold text-amber-400 mt-0.5">{summary?.counts_by_severity?.HIGH || 0}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-950/50 border border-amber-900/40 flex items-center justify-center text-amber-400">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total System Logs</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{summary?.total || 0}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-950/50 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      {/* 5 Alert Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800 scrollbar-none">
        {categoryTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-emerald-400'} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                isActive ? 'bg-emerald-800 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search alerts by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter size={14} className="text-zinc-500" />
          <span className="text-xs text-zinc-400 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <p className="text-xs text-zinc-400 font-medium">Scanning system telemetry...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-400 font-medium text-center">
          {error}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="py-12 bg-zinc-950/40 border border-zinc-800/60 rounded-xl text-center space-y-2">
          <ShieldCheck size={32} className="mx-auto text-emerald-500/60" />
          <p className="text-sm font-bold text-zinc-300">No Active Alerts Found</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            All system parameters, species detections, vegetation indices, and hardware devices are running normally.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.is_read
                  ? 'bg-zinc-950/40 border-zinc-800/60 opacity-80'
                  : 'bg-zinc-950/90 border-zinc-750 shadow-md hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                  {getAlertIcon(alert.alert_type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getBadgeStyle(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {alert.alert_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      {new Date(alert.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 mt-1">{alert.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">{alert.message}</p>

                  {/* Metadata Tag Badges */}
                  {alert.details && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {Object.entries(alert.details).map(([k, v]) => (
                        <span key={k} className="text-[10.5px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          <strong className="text-zinc-300 capitalize">{k.replace('_', ' ')}:</strong> {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                {!alert.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Acknowledge</span>
                  </button>
                )}
                {alert.is_read && (
                  <span className="flex items-center space-x-1 text-[11px] font-semibold text-zinc-500 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>Acknowledged</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
