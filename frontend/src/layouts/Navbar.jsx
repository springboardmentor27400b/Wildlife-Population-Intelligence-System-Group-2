import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, Check, ExternalLink } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notifications';

export const Navbar = ({ toggleSidebar }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications({ limit: 5 });
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll notifications every 30 seconds for real-time telemetry alerts
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/surveys')) return 'Surveys Boundary';
    if (path.startsWith('/monitoring-sites')) return 'Monitoring Sites';
    if (path.startsWith('/camera-traps')) return 'Camera Equipment';
    if (path.startsWith('/audio-sensors')) return 'Audio Sensors';
    if (path.startsWith('/observations')) return 'Wildlife Sighting logs';
    if (path.startsWith('/notifications')) return 'System Alerts Feed';
    if (path.startsWith('/profile')) return 'User Profile Setting';
    return 'Wildlife Intelligence';
  };

  const getSeverityClass = (sev) => {
    if (sev === 'critical') return 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-350';
    if (sev === 'high') return 'bg-orange-50 border-orange-200 text-orange-850 dark:bg-orange-950/20 dark:border-orange-900/50 dark:text-orange-350';
    if (sev === 'medium') return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-350';
    return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-350';
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-forest-850 bg-white dark:bg-forest-900 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 md:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold font-outfit text-slate-800 dark:text-slate-100 hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-forest-850/50 transition-colors focus:outline-none relative"
            title="View Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-extrabold text-[9px] flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 rounded-xl shadow-xl z-50 py-2.5 text-xs text-slate-655 dark:text-slate-300">
              <div className="flex items-center justify-between px-4 pb-2 border-b dark:border-forest-800">
                <span className="font-bold text-slate-800 dark:text-slate-100 font-outfit">Notifications feed</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-emerald-600 dark:text-emerald-450 hover:underline font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-64 overflow-y-auto divide-y dark:divide-forest-800">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => navigate('/notifications')}
                      className={`p-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-forest-850/30 flex flex-col gap-1 ${!n.is_read ? 'font-bold' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-extrabold tracking-wide uppercase">{n.notification_type.replace('_', ' ')}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border uppercase ${getSeverityClass(n.severity)}`}>
                            {n.severity}
                          </span>
                          {!n.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(n.id, e)}
                              className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-450 focus:outline-none"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 text-xs font-semibold leading-relaxed">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-normal leading-normal">{n.message}</p>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 italic">
                    No active notifications.
                  </div>
                )}
              </div>

              <div className="border-t dark:border-forest-800 pt-2 px-3 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setDropdownOpen(false)}
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-450 font-extrabold hover:underline"
                >
                  View All Alerts <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-forest-850/50 transition-colors focus:outline-none"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User icon linking to Profile */}
        <Link
          to="/profile"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs select-none">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
