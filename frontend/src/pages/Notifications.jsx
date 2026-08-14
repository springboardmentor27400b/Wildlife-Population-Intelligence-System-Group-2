import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Trash2, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  Eye, 
  Shield, 
  Camera, 
  Volume2, 
  Sprout, 
  Compass 
} from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notifications';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';

export const Notifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unread', 'read'
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all', 'critical', 'high', 'medium', 'low'
  const [toastMsg, setToastMsg] = useState(null);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const isReadParam = statusFilter === 'unread' ? false : statusFilter === 'read' ? true : undefined;
      const data = await getNotifications({ is_read: isReadParam });
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to retrieve notifications.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [statusFilter]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setToastMsg({ text: 'Alert marked as read.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to update alert status.', type: 'error' });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setToastMsg({ text: `${res.count} alerts marked as read.`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to update alerts status.', type: 'error' });
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (severityFilter !== 'all' && n.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityClass = (sev) => {
    if (sev === 'critical') return 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-955 dark:border-rose-900/50 dark:text-rose-400';
    if (sev === 'high') return 'bg-orange-50 border-orange-200 text-orange-850 dark:bg-orange-955 dark:border-orange-900/50 dark:text-orange-400';
    if (sev === 'medium') return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-955 dark:border-amber-900/50 dark:text-amber-400';
    return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-955 dark:border-blue-900/50 dark:text-blue-400';
  };

  const getTypeIcon = (type) => {
    if (type === 'endangered_species') return Shield;
    if (type === 'population_decline') return Sprout;
    if (type === 'habitat_degradation') return Compass;
    if (type === 'device_alert') return Camera;
    return Bell;
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-forest-850 pb-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-7 h-7 text-emerald-600 animate-pulse" />
            System Alerts & Notifications
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-semibold">
            Track ecological anomalies, population alerts, and hardware device states targeted to your role as a {user?.role}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={RefreshCw} onClick={fetchNotifs}>
            Refresh
          </Button>
          <Button 
            variant="primary" 
            icon={CheckCircle}
            disabled={notifications.filter(n => !n.is_read).length === 0}
            onClick={handleMarkAllRead}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter and control panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Read Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Alerts</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>
          </div>
        </div>

        <div className="text-[10px] font-bold text-slate-455">
          Showing {filteredNotifs.length} alerts of {notifications.length} total
        </div>
      </div>

      {/* Main notifications feed list */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Spinner className="w-8 h-8 text-emerald-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map(n => {
              const IconComp = getTypeIcon(n.notification_type);
              return (
                <Card 
                  key={n.id}
                  className={`p-5 bg-white dark:bg-forest-900 border transition-all duration-300 ${
                    !n.is_read 
                      ? 'border-emerald-250 dark:border-emerald-850/50 shadow-md ring-1 ring-emerald-500/5' 
                      : 'border-slate-200 dark:border-forest-850 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center ${getSeverityClass(n.severity)}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {n.notification_type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${getSeverityClass(n.severity)}`}>
                            {n.severity}
                          </span>
                          {!n.is_read && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-350 text-[8px] font-extrabold uppercase animate-pulse">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{n.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">{n.message}</p>
                    </div>

                    {!n.is_read && (
                      <Button
                        variant="outline"
                        icon={Check}
                        onClick={() => handleMarkAsRead(n.id)}
                        className="rounded-lg text-[10px] font-bold self-center"
                      >
                        Read
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-sm text-slate-400 italic text-xs space-y-1.5">
              <CheckCircle className="w-9 h-9 text-slate-300" />
              <span>No notifications matching the selected filters.</span>
            </div>
          )}
        </div>
      )}

      {toastMsg && (
        <Toast
          message={toastMsg.text}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}
    </div>
  );
};

export default Notifications;
