import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, PawPrint, Brain, MapPinned, Cpu, FileText, TriangleAlert, BadgeCheck, Info, Check, Trash2, CheckCircle2 } from 'lucide-react';
import notificationService from '../services/notificationService';
import { toast } from 'react-hot-toast';

export const getIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'observation': return <PawPrint className="w-5 h-5 text-blue-500" />;
    case 'prediction': return <Brain className="w-5 h-5 text-purple-500" />;
    case 'site': return <MapPinned className="w-5 h-5 text-emerald-500" />;
    case 'sensor': return <Cpu className="w-5 h-5 text-orange-500" />;
    case 'report': return <FileText className="w-5 h-5 text-indigo-500" />;
    case 'alert': return <TriangleAlert className="w-5 h-5 text-red-500" />;
    case 'success': return <BadgeCheck className="w-5 h-5 text-green-500" />;
    default: return <Info className="w-5 h-5 text-gray-500" />;
  }
};

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-700 border-red-200';
    case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'success': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const timeAgo = (dateStr) => {
  const diff = (new Date() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour(s) ago`;
  if (diff < 172800) return 'Yesterday';
  return `${Math.floor(diff / 86400)} days ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.slice(0, 6)); // Max 6 for bell
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif._id);
      fetchNotifications();
    }
    setOpen(false);
    if (notif.related_resource_id) {
      // Map to correct route based on type
      let route = '/dashboard';
      if (notif.type === 'observation') route = '/observations';
      if (notif.type === 'prediction') route = '/predictions';
      if (notif.type === 'site') route = '/sites';
      if (notif.type === 'report') route = '/reports';
      if (notif.type === 'sensor') route = '/devices';
      navigate(route);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 5 }}
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </motion.div>
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"
            >
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-full h-full bg-red-500 rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <>
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] uppercase font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded-md"
                    >
                      Mark All Read
                    </button>
                    <span className="bg-primary text-white shadow-sm text-xs px-2 py-0.5 rounded-full font-medium">
                      {unreadCount}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                    <PawPrint className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium">No notifications yet.</p>
                  <p className="text-xs text-gray-400">You're all caught up!</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif._id}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      onClick={() => handleItemClick(notif)}
                      className={`p-4 border-b border-gray-50 dark:border-gray-800/50 cursor-pointer flex gap-3 relative transition-colors ${!notif.is_read ? 'bg-primary/5' : ''}`}
                    >
                      {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                      
                      <div className="shrink-0 mt-1">
                        {getIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <p className={`text-sm font-semibold truncate ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notif.title}
                          </p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold shrink-0 ${getPriorityColor(notif.priority)}`}>
                            {notif.priority}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                          {notif.message}
                        </p>
                        
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>{timeAgo(notif.created_at)}</span>
                          {!notif.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif._id, e)}
                              className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => { setOpen(false); navigate('/notifications'); }}
                className="w-full py-2 text-sm text-center text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors"
              >
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
