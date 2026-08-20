import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Search, Filter, Trash2, Check, CheckCircle2, RotateCcw, 
  AlertTriangle, Inbox, CheckSquare, Clock
} from 'lucide-react';
import { getIcon, getPriorityColor, timeAgo } from '../components/NotificationBell';
import notificationService from '../services/notificationService';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRead, setFilterRead] = useState('all'); // 'all', 'unread', 'read'
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.is_read).length,
      read: notifications.filter(n => n.is_read).length,
      highPriority: notifications.filter(n => n.priority === 'High' || n.priority === 'Alert').length
    };
  }, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filterRead === 'unread' && n.is_read) return false;
      if (filterRead === 'read' && !n.is_read) return false;
      if (filterPriority !== 'all' && n.priority?.toLowerCase() !== filterPriority.toLowerCase()) return false;
      if (filterType !== 'all' && n.type?.toLowerCase() !== filterType.toLowerCase()) return false;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          n.title?.toLowerCase().includes(q) || 
          n.message?.toLowerCase().includes(q) || 
          n.type?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [notifications, filterRead, filterPriority, filterType, searchQuery]);

  // Grouping
  const groupedNotifications = useMemo(() => {
    const groups = { Unread: [], Today: [], 'This Week': [], Older: [] };
    const now = new Date();
    
    filteredNotifications.forEach(n => {
      if (!n.is_read) {
        groups.Unread.push(n);
        return;
      }
      
      const date = new Date(n.created_at);
      const diffMs = now - date;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      if (diffDays < 1 && now.getDate() === date.getDate()) {
        groups.Today.push(n);
      } else if (diffDays < 7) {
        groups['This Week'].push(n);
      } else {
        groups.Older.push(n);
      }
    });
    
    return groups;
  }, [filteredNotifications]);

  // Actions
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleBulkRead = async () => {
    if (selectedIds.size === 0) return;
    try {
      await notificationService.markSelectedRead(Array.from(selectedIds));
      setNotifications(prev => prev.map(n => selectedIds.has(n._id) ? { ...n, is_read: true } : n));
      setSelectedIds(new Set());
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await notificationService.deleteSelected(Array.from(selectedIds));
      setNotifications(prev => prev.filter(n => !selectedIds.has(n._id)));
      setSelectedIds(new Set());
      toast.success('Deleted selected');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to delete ALL notifications?")) {
      try {
        await notificationService.clearAll();
        setNotifications([]);
        toast.success('All notifications cleared');
      } catch (err) {
        toast.error('Clear failed');
      }
    }
  };

  const handleNavigate = (notif) => {
    if (!notif.is_read) handleMarkAsRead(notif._id);
    if (!notif.related_resource_id) return;
    
    let route = '/dashboard';
    if (notif.type === 'observation') route = '/observations';
    if (notif.type === 'prediction') route = '/predictions';
    if (notif.type === 'site') route = '/sites';
    if (notif.type === 'report') route = '/reports';
    if (notif.type === 'sensor') route = '/devices';
    navigate(route);
  };

  const toggleSelection = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/3"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error loading notifications</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Real-time alerts for endangered species and system anomalies.
          </p>
        <Button onClick={fetchNotifications} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-8 h-8 text-green-600" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your alerts, system updates, and task reports.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Inbox, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Unread', value: stats.unread, icon: Bell, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Read', value: stats.read, icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'High Priority', value: stats.highPriority, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-xl ${s.bg} dark:bg-gray-800`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500 uppercase font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search notifications..." 
              className="pl-9 h-10 w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-transparent focus:border-primary"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select className="bg-gray-50 dark:bg-gray-800 focus: text-sm text-gray-700 dark:text-gray-300 h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
            value={filterRead} onChange={e => setFilterRead(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          
          <select className="bg-gray-50 dark:bg-gray-800 focus: text-sm text-gray-700 dark:text-gray-300 hidden sm:block h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
            value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="success">Success</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {selectedIds.size > 0 ? (
            <>
              <span className="text-sm font-semibold text-gray-500 mr-2">{selectedIds.size} selected</span>
              <Button size="sm" variant="outline" onClick={handleBulkRead} className="h-9 gap-1.5"><Check className="w-4 h-4" /> Mark Read</Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="h-9 gap-1.5"><Trash2 className="w-4 h-4" /> Delete</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={handleMarkAllRead} className="h-9 gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Mark All Read</Button>
              <Button size="sm" variant="ghost" onClick={handleClearAll} className="h-9 gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /> Clear All</Button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div>
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No notifications yet.</h3>
            <p className="text-sm text-gray-500">You're all caught up with your alerts and updates.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedNotifications).map(([groupName, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={groupName} className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    {groupName === 'Unread' && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
                    {groupName}
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {items.map(notif => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={notif._id}
                          className={`group relative overflow-hidden bg-white dark:bg-gray-900 border rounded-2xl shadow-sm transition-all hover:shadow-md cursor-pointer ${notif.is_read ? 'border-gray-100 dark:border-gray-800 opacity-75 hover:opacity-100' : 'border-primary/20 bg-primary/5'}`}
                          onClick={() => handleNavigate(notif)}
                        >
                          {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />}
                          
                          <div className="p-4 flex gap-4 items-start">
                            {/* Checkbox */}
                            <div className="pt-1">
                              <input type="checkbox" 
                                className="w-5 h-5 rounded text-primary cursor-pointer accent-primary"
                                checked={selectedIds.has(notif._id)}
                                onChange={(e) => toggleSelection(notif._id, e)}
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                            
                            {/* Icon */}
                            <div className="shrink-0 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              {getIcon(notif.type)}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                                <h4 className={`text-base font-semibold truncate ${notif.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                  {notif.title}
                                </h4>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${getPriorityColor(notif.priority)}`}>
                                    {notif.priority}
                                  </span>
                                  <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {timeAgo(notif.created_at)}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                {notif.message}
                              </p>
                              
                              {/* Quick Actions */}
                              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notif.is_read && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif._id); }}
                                    className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Read
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                                  className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
