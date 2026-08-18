import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alertsAPI } from '../services/api';
import { 
  LayoutDashboard, 
  ClipboardList, 
  MapPin, 
  Cpu, 
  UploadCloud, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileAudio,
  BarChart3,
  Heart,
  Users,
  Dna,
  Layers,
  Compass,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  TrendingDown,
  Sun,
  RotateCw,
  Check,
  CheckCheck
} from 'lucide-react';

function HeaderNotificationBell() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSummaryAndAlerts = async () => {
    try {
      const summary = await alertsAPI.getSummary();
      setUnreadTotal(summary.unread_total || 0);
      // Fetch notifications including acknowledged ones so they appear when the bell icon is clicked
      const list = await alertsAPI.getAlerts({ limit: 20 });
      setAlerts(list || []);
    } catch (err) {
      console.error('Alerts bell fetch error:', err);
    }
  };

  useEffect(() => {
    fetchSummaryAndAlerts();
    const interval = setInterval(fetchSummaryAndAlerts, 30000);
    const handleUpdate = () => fetchSummaryAndAlerts();
    window.addEventListener('alertsUpdated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('alertsUpdated', handleUpdate);
    };
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await alertsAPI.markAsRead(id);
      fetchSummaryAndAlerts();
      window.dispatchEvent(new CustomEvent('alertsUpdated'));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await alertsAPI.markAllAsRead();
      await fetchSummaryAndAlerts();
      window.dispatchEvent(new CustomEvent('alertsUpdated'));
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'endangered_species':
        return <ShieldAlert size={15} className="text-red-400 shrink-0" />;
      case 'population_decline':
        return <TrendingDown size={15} className="text-amber-400 shrink-0" />;
      case 'habitat_degradation':
        return <Sun size={15} className="text-yellow-400 shrink-0" />;
      case 'device_alert':
        return <Cpu size={15} className="text-blue-400 shrink-0" />;
      case 'conservation_notification':
      default:
        return <Compass size={15} className="text-purple-400 shrink-0" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative cursor-pointer text-zinc-400 hover:text-zinc-200 transition p-1.5 rounded-lg hover:bg-zinc-800 focus:outline-none"
        title="Notifications & Alerts"
      >
        <Bell size={20} />
        {unreadTotal > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-600 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center px-1 border border-zinc-900 shadow">
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3.5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell size={16} className="text-emerald-400" />
              <span className="font-bold text-sm text-zinc-100">System Alerts & Notifications</span>
              {unreadTotal > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-950/80 text-red-400 border border-red-800/60">
                  {unreadTotal} Unread
                </span>
              )}
            </div>
            {unreadTotal > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>Read All</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No notifications or alerts.
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-3.5 flex items-start space-x-3 transition ${
                    a.is_read ? 'bg-zinc-900/60 opacity-80' : 'bg-zinc-850/90 hover:bg-zinc-800/90'
                  }`}
                >
                  <div className="mt-0.5">{getAlertIcon(a.alert_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-zinc-200 truncate">{a.title}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                          a.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800/60' :
                          a.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                          'bg-zinc-800 text-zinc-300'
                        }`}>
                          {a.severity}
                        </span>
                        {a.is_read && (
                          <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={10} className="text-emerald-400" />
                            <span>Acknowledged</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{a.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/50">
                      <span className="text-[9.5px] text-zinc-500 font-mono">
                        {new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {a.is_read ? (
                        <span className="text-[10px] font-semibold text-emerald-400/90 flex items-center gap-1">
                          <Check size={11} className="text-emerald-400" /> Acknowledged
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleMarkAsRead(a.id, e)}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded transition"
                        >
                          <Check size={11} /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-zinc-950 border-t border-zinc-800 text-center">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              View Alerts Hub &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProtectedLayout() {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const location = useLocation();
  const navigate = useNavigate();

  const isMoreAnalyticsActive = [
    '/population-intelligence',
    '/biodiversity-intelligence',
    '/habitat-intelligence',
    '/conservation-recommendations',
    '/ecosystem-health'
  ].includes(location.pathname);

  const [moreAnalyticsOpen, setMoreAnalyticsOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogoClick = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      localStorage.setItem('sidebar_collapsed', 'false');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-500 font-medium">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mr-3"></div>
        Loading environment...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const primaryNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Biodiversity Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const moreAnalyticsItems = [
    { name: 'Population Intelligence', path: '/population-intelligence', icon: Users },
    { name: 'Biodiversity Intelligence', path: '/biodiversity-intelligence', icon: Dna },
    { name: 'Habitat Intelligence', path: '/habitat-intelligence', icon: Layers },
    { name: 'Conservation Recommendations', path: '/conservation-recommendations', icon: Compass },
    { name: 'Ecosystem Health', path: '/ecosystem-health', icon: Heart },
  ];

  const secondaryNavItems = [
    { name: 'Surveys', path: '/surveys', icon: ClipboardList },
    { name: 'Monitoring Sites', path: '/sites', icon: MapPin },
    { name: 'Devices', path: '/devices', icon: Cpu },
    { name: 'Image Analysis', path: '/upload', icon: UploadCloud },
    { name: 'Audio Analysis', path: '/audio-analysis', icon: FileAudio },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return 'Dashboard';
    return paths.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  };

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center z-50 print:hidden">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-white">W</div>
          <span className="font-bold text-lg text-emerald-500">WildlifeIntel</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-400 hover:text-zinc-200">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between z-40 print:hidden
        ${sidebarCollapsed ? 'md:w-20 w-64' : 'w-64'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="overflow-y-auto max-h-screen">
          {/* Brand Header */}
          <div 
            onClick={handleLogoClick}
            className={`p-6 border-b border-zinc-800 hidden md:flex items-center cursor-pointer ${sidebarCollapsed ? 'md:justify-center' : 'md:justify-between'}`}
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center font-extrabold text-white text-xl shrink-0" title={sidebarCollapsed ? "Expand Sidebar" : ""}>W</div>
              <div className={`transition-opacity duration-300 opacity-100 whitespace-nowrap ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>
                <h1 className="font-bold text-emerald-500 text-lg leading-tight">WildlifeIntel</h1>
                <p className="text-xs text-zinc-500">Population System</p>
              </div>
            </div>
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSidebar();
                }}
                className="text-zinc-400 hover:text-zinc-200 transition-colors p-1.5 rounded bg-zinc-800/30 hover:bg-zinc-800 cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {/* Primary Items */}
            {primaryNavItems.map((item) => {
              // Hide Biodiversity Analytics from sidebar for Admin and Officer roles
              if ((user?.role === 'Admin' || user?.role === 'Officer') && item.path === '/analytics') {
                return null;
              }

              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.name : ''}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${sidebarCollapsed ? 'md:justify-center md:space-x-0 space-x-3' : 'space-x-3'}
                    ${isActive 
                      ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}
                  `}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className={`transition-opacity duration-300 opacity-100 whitespace-nowrap ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>{item.name}</span>
                </Link>
              );
            })}

            {/* More Analytics Collapsible Group (Hidden for Admin and Officer roles) */}
            {user?.role !== 'Admin' && user?.role !== 'Officer' && (
              <div className="pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    if (sidebarCollapsed) {
                      setSidebarCollapsed(false);
                      localStorage.setItem('sidebar_collapsed', 'false');
                    }
                    setMoreAnalyticsOpen(!moreAnalyticsOpen);
                  }}
                  title={sidebarCollapsed ? "More Analytics" : ""}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer
                    ${sidebarCollapsed ? 'md:justify-center' : ''}
                    ${isMoreAnalyticsActive
                      ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Sparkles size={18} className="shrink-0 text-emerald-400" />
                    <span className={`transition-opacity duration-300 opacity-100 whitespace-nowrap ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>
                      More Analytics
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${moreAnalyticsOpen ? 'rotate-180 text-emerald-400' : 'text-zinc-500'}`}
                    />
                  )}
                </button>

                {/* Submenu Items */}
                {moreAnalyticsOpen && !sidebarCollapsed && (
                  <div className="mt-1 ml-4 pl-3 border-l border-zinc-800 space-y-1 transition-all duration-200">
                    {moreAnalyticsItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
                            ${isActive 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent'}
                          `}
                        >
                          <Icon size={15} className="shrink-0 text-emerald-400" />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Secondary Items */}
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/audio-analysis' && location.pathname.startsWith('/audio-analysis'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.name : ''}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${sidebarCollapsed ? 'md:justify-center md:space-x-0 space-x-3' : 'space-x-3'}
                    ${isActive 
                      ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}
                  `}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className={`transition-opacity duration-300 opacity-100 whitespace-nowrap ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with user profile badge and logout */}
        <div className="p-4 border-t border-zinc-800">
          <div className={`flex items-center p-2 rounded-lg bg-zinc-950/40 mb-3 ${sidebarCollapsed ? 'md:justify-center md:space-x-0 space-x-3' : 'space-x-3'}`} title={sidebarCollapsed ? `${user.full_name} (${user.role})` : ''}>
            <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-emerald-500 shrink-0">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={`overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>
              <p className="text-sm font-semibold truncate leading-none mb-1">{user.full_name}</p>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-950/50 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Sign Out" : ""}
            className={`flex items-center justify-center py-2 px-4 rounded-lg bg-zinc-800 hover:bg-red-950/40 hover:text-red-400 border border-zinc-700 hover:border-red-900/30 text-zinc-400 text-sm font-semibold transition w-full ${sidebarCollapsed ? 'md:space-x-0 space-x-2' : 'space-x-2'}`}
          >
            <LogOut size={16} className="shrink-0" />
            <span className={`whitespace-nowrap ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden print:h-auto print:overflow-visible print:p-0 print:block">
        {/* Top Navbar */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 hidden md:flex items-center justify-between z-10 print:hidden relative">
          <div className="font-semibold text-lg text-zinc-300">
            {getBreadcrumbs()}
          </div>
          <div className="flex items-center space-x-6">
            {/* Real-time Alerts Notification Bell Popover */}
            <HeaderNotificationBell />

            {/* User details */}
            <div className="flex items-center space-x-3 border-l border-zinc-800 pl-6">
              <span className="text-sm text-zinc-400 font-medium">Signed in as <strong className="text-zinc-200">{user.full_name}</strong></span>
              <div className="h-8 w-8 rounded-full bg-emerald-900/40 border border-emerald-700/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
                {user.role ? user.role.substring(0, 2).toUpperCase() : 'US'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Work stage */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible print:bg-white print:block">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
