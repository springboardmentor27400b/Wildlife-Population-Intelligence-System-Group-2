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
  Compass,
  Settings,
  Activity,
  Search,
  Clock
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  markNotificationAsUnread,
  resolveNotification,
  deleteNotification
} from '../api/notifications';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';

export const Notifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  // Advanced filters
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unread', 'read'
  const [resolutionFilter, setResolutionFilter] = useState('all'); // 'all', 'resolved', 'unresolved'
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', type keys
  const [searchQuery, setSearchQuery] = useState('');
  
  const [toastMsg, setToastMsg] = useState(null);
  const [currentTime, setCurrentTime] = useState('');

  // Update IST dynamic clock
  useEffect(() => {
    const updateClock = () => {
      const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const formatted = new Intl.DateTimeFormat('en-US', options).format(new Date());
      setCurrentTime(`IST ${formatted} IST`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      // Query everything from backend and filter locally for high fidelity search
      const data = await getNotifications();
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
  }, []);

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

  const handleMarkAsUnread = async (id) => {
    try {
      await markNotificationAsUnread(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
      setToastMsg({ text: 'Alert marked as unread.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to update alert status.', type: 'error' });
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveNotification(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_resolved: true } : n));
      setToastMsg({ text: 'Alert resolved successfully.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to resolve alert.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setToastMsg({ text: 'Notification deleted.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to delete notification.', type: 'error' });
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

  // Local filtering matching search parameters
  const filteredNotifs = notifications.filter(n => {
    // Read status filter
    if (statusFilter === 'unread' && n.is_read) return false;
    if (statusFilter === 'read' && !n.is_read) return false;

    // Resolution status filter
    if (resolutionFilter === 'resolved' && !n.is_resolved) return false;
    if (resolutionFilter === 'unresolved' && n.is_resolved) return false;

    // Category filter
    if (selectedCategory !== 'all' && n.notification_type !== selectedCategory) return false;

    // Search query filter
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(term);
      const matchMsg = n.message?.toLowerCase().includes(term);
      const matchType = n.notification_type?.toLowerCase().includes(term);
      if (!matchTitle && !matchMsg && !matchType) return false;
    }

    return true;
  });

  const getSeverityClass = (sev) => {
    if (sev === 'critical') return 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-955 dark:border-rose-900/50 dark:text-rose-400';
    if (sev === 'high') return 'bg-orange-50 border-orange-200 text-orange-850 dark:bg-orange-955 dark:border-orange-900/50 dark:text-orange-400';
    if (sev === 'medium') return 'bg-amber-50 border-amber-250 text-amber-800 dark:bg-amber-955 dark:border-amber-900/50 dark:text-amber-400';
    return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-955 dark:border-blue-900/50 dark:text-blue-400';
  };

  const getLeftBorderClass = (sev) => {
    if (sev === 'critical') return 'border-l-4 border-l-rose-500';
    if (sev === 'high') return 'border-l-4 border-l-orange-500';
    if (sev === 'medium') return 'border-l-4 border-l-amber-500';
    return 'border-l-4 border-l-emerald-500';
  };

  const getTypeIcon = (type) => {
    if (type === 'endangered_species') return Shield;
    if (type === 'population_decline') return Sprout;
    if (type === 'habitat_degradation') return Compass;
    if (type === 'device_alert') return Camera;
    return Bell;
  };

  const getTypeLabel = (type) => {
    if (type === 'endangered_species') return 'SPECIES PROTECTION';
    if (type === 'population_decline') return 'POPULATION HEALTH';
    if (type === 'habitat_degradation') return 'HABITAT INTELLIGENCE';
    if (type === 'device_alert') return 'DEVICE MANAGEMENT';
    return 'SYSTEM ALERTS';
  };

  const categories = [
    { id: 'all', label: 'SHOW ALL' },
    { id: 'endangered_species', label: 'ENDANGERED SPECIES ALERT' },
    { id: 'population_decline', label: 'POPULATION DECLINE ALERT' },
    { id: 'habitat_degradation', label: 'HABITAT DEGRADATION ALERT' },
    { id: 'device_alert', label: 'MONITORING DEVICE ALERT' }
  ];

  // Group notifications helper
  const groupNotificationsByDate = (list) => {
    const todayList = [];
    const yesterdayList = [];
    const earlierList = [];

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    list.forEach(n => {
      const nDate = new Date(n.created_at);
      if (nDate.toDateString() === today.toDateString()) {
        todayList.push(n);
      } else if (nDate.toDateString() === yesterday.toDateString()) {
        yesterdayList.push(n);
      } else {
        earlierList.push(n);
      }
    });

    return [
      { title: 'TODAY', items: todayList },
      { title: 'YESTERDAY', items: yesterdayList },
      { title: 'EARLIER', items: earlierList }
    ];
  };

  const groupedNotifs = groupNotificationsByDate(filteredNotifs);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Section matching WPIS screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-forest-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
            <Bell className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block font-mono">
              AI-POWERED BIODIVERSITY PLATFORM
            </span>
            <h1 className="text-xl font-black font-outfit text-slate-800 dark:text-slate-105">
              Wildlife Population Intelligence System
            </h1>
          </div>
        </div>

        {/* Dynamic IST clock badge and Admin role bubble */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            {currentTime}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-forest-900 border rounded-xl shadow-sm text-xs">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="font-bold text-slate-705 dark:text-slate-205 font-mono">{user?.name || 'admin'}</span>
            <span className="bg-rose-50 text-rose-800 dark:bg-rose-955 dark:text-rose-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono">
              {user?.role?.toUpperCase() || 'ADMINISTRATOR'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Statistics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 flex items-center justify-between shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 uppercase font-black block tracking-wider">Lifetime logged events</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">
              {notifications.length}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
            <Bell className="w-5 h-5" />
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 flex items-center justify-between shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 uppercase font-black block tracking-wider">Requires attention</span>
            <span className="text-2xl font-black text-blue-650 dark:text-blue-405 font-mono">
              {notifications.filter(n => !n.is_read).length}
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 flex items-center justify-between shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 uppercase font-black block tracking-wider">Ecosystem severity drops</span>
            <span className="text-2xl font-black text-rose-650 dark:text-rose-450 font-mono">
              {notifications.filter(n => n.severity === 'critical' || n.severity === 'high').length}
            </span>
          </div>
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-600">
            <Shield className="w-5 h-5" />
          </div>
        </Card>

        {/* Card 4 */}
        <Card className="p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 flex items-center justify-between shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 uppercase font-black block tracking-wider">Regular updates logs</span>
            <span className="text-2xl font-black text-emerald-650 dark:text-emerald-455 font-mono">
              {notifications.filter(n => n.severity === 'medium' || n.severity === 'low').length}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
            <Settings className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 3. Search Alerts & Dropdowns Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-sm">
        
        {/* Search Input block */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-forest-955 border-slate-200 dark:border-forest-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs">
          
          {/* Read States dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-xl bg-white dark:bg-forest-955 border-slate-250 dark:border-forest-800 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Read States</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          {/* Resolution States dropdown */}
          <select
            value={resolutionFilter}
            onChange={(e) => setResolutionFilter(e.target.value)}
            className="px-3 py-2 border rounded-xl bg-white dark:bg-forest-955 border-slate-250 dark:border-forest-800 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Resolution States</option>
            <option value="resolved">Resolved</option>
            <option value="unresolved">Unresolved</option>
          </select>

          {/* Mark All Read & Refresh actions */}
          <div className="flex gap-2">
            <Button variant="outline" icon={RefreshCw} onClick={fetchNotifs} className="rounded-xl">
              Refresh
            </Button>
            <Button 
              variant="primary" 
              icon={CheckCircle}
              disabled={notifications.filter(n => !n.is_read).length === 0}
              onClick={handleMarkAllRead}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold whitespace-nowrap"
            >
              Mark All Read
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Category Pill Buttons Scroll Row */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-[10px] text-slate-455 font-black uppercase tracking-wider whitespace-nowrap font-mono">
            CATEGORY:
          </span>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-wider transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                  : 'bg-white dark:bg-forest-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-forest-850 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Notifications Date Grouping List */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Spinner className="w-8 h-8 text-emerald-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {filteredNotifs.length > 0 ? (
            groupedNotifs.map(group => {
              if (group.items.length === 0) return null;
              return (
                <div key={group.title} className="space-y-4">
                  {/* Group Date Header */}
                  <h2 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 border-b pb-1 dark:border-forest-850 uppercase font-mono">
                    {group.title}
                  </h2>

                  <div className="space-y-3">
                    {group.items.map(n => {
                      const IconComp = getTypeIcon(n.notification_type);
                      return (
                        <Card 
                          key={n.id}
                          className={`p-4 bg-white dark:bg-forest-900 border transition-all duration-300 flex items-start gap-4 hover:shadow-md ${getLeftBorderClass(n.severity)} ${
                            !n.is_read 
                              ? 'bg-gradient-to-r from-emerald-50/10 to-transparent dark:from-emerald-950/5 border-slate-250 dark:border-forest-800' 
                              : 'border-slate-200 dark:border-forest-850 opacity-85'
                          }`}
                        >
                          {/* Circle Icon Container */}
                          <div className="p-2.5 rounded-full border border-emerald-250 bg-emerald-50/30 text-emerald-600 flex items-center justify-center relative flex-shrink-0">
                            <IconComp className="w-5 h-5 animate-pulse" />
                            {!n.is_read && (
                              <span className="w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full absolute -top-0.5 -right-0.5" />
                            )}
                          </div>
                          
                          {/* Middle Content */}
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold">
                              <span className={`px-2 py-0.5 rounded uppercase text-[8px] font-black border ${getSeverityClass(n.severity)}`}>
                                {n.severity?.toUpperCase()}
                              </span>
                              <span className="text-slate-455 tracking-wider font-mono">
                                {getTypeLabel(n.notification_type)}
                              </span>
                              <span className="text-slate-450 font-mono">
                                • {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            
                            <h3 className="font-extrabold text-slate-800 dark:text-slate-105 text-sm leading-tight">
                              {n.title}
                            </h3>
                            <p className="text-xs text-slate-550 dark:text-slate-350 leading-relaxed font-semibold">
                              {n.message}
                            </p>

                            {/* Resolution Status pill */}
                            {n.is_resolved ? (
                              <div className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-955 text-emerald-800 dark:text-emerald-450 border border-emerald-200/50 text-[9px] font-extrabold font-mono uppercase">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Resolved
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-955 text-rose-800 dark:text-rose-450 border border-rose-200/50 text-[9px] font-extrabold font-mono uppercase animate-pulse">
                                Requires Attention
                              </div>
                            )}
                          </div>

                          {/* 6. Card Actions Right Aligned */}
                          <div className="flex items-center gap-2 self-center flex-shrink-0 flex-wrap">
                            <Link to="/research-trends">
                              <Button
                                variant="outline"
                                icon={Eye}
                                className="rounded-xl text-[10px] font-bold border-slate-250 dark:border-forest-800 py-1.5 px-2.5 h-8 whitespace-nowrap text-slate-500 hover:text-slate-805"
                              >
                                View Dashboard
                              </Button>
                            </Link>

                            <Button
                              variant="primary"
                              icon={n.is_read ? RefreshCw : Check}
                              onClick={() => n.is_read ? handleMarkAsUnread(n.id) : handleMarkAsRead(n.id)}
                              className={`rounded-xl text-[10px] font-bold py-1.5 px-3 h-8 whitespace-nowrap min-w-[90px] border-none text-white ${
                                n.is_read ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                              }`}
                            >
                              {n.is_read ? 'Mark Unread' : 'Mark Read'}
                            </Button>

                            {/* Resolve button action (shown only when unresolved) */}
                            {!n.is_resolved && (
                              <Button
                                variant="outline"
                                icon={CheckCircle}
                                onClick={() => handleResolve(n.id)}
                                className="rounded-xl text-[10px] font-bold border-slate-250 dark:border-forest-800 py-1.5 px-2.5 h-8 text-slate-550 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 hover:border-emerald-200"
                              >
                                Resolve
                              </Button>
                            )}

                            {/* Delete Alert Button */}
                            <Button
                              variant="outline"
                              icon={Trash2}
                              onClick={() => handleDelete(n.id)}
                              className="rounded-xl p-1.5 h-8 w-8 text-rose-500 hover:bg-rose-50 border-slate-250 dark:border-forest-800 hover:border-rose-200 flex items-center justify-center"
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
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

// Simple link helper to bypass react-router-dom context issues if not nested
const Link = ({ to, children }) => {
  return (
    <a href={to} className="inline-block" onClick={(e) => {
      e.preventDefault();
      window.location.hash = to; // support standard routing mechanisms in single page apps
      // For standard browser history navigation:
      window.history.pushState({}, '', to);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }}>
      {children}
    </a>
  );
};

export default Notifications;
