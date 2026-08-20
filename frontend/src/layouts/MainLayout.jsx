import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Leaf, UserCircle, Settings, LogOut, LayoutDashboard, Menu, X, Users, Activity, Map, Camera, AlertCircle, Trees, MapPin, UploadCloud, ClipboardList, FileText, Bell, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rolePermissions } from '../config/rolePermissions';
import NotificationBell from '../components/NotificationBell';
import GlobalSearch from '../components/GlobalSearch';
import { Search } from 'lucide-react';
import ScrollToTop from '../components/ui/ScrollToTop';

const iconMap = {
  LayoutDashboard, UserCircle, Settings, Users, Activity, Map, Camera, AlertCircle, Trees, MapPin, UploadCloud, ClipboardList, FileText, ShieldAlert, ShieldCheck, Sparkles, Leaf, Bell
};


const MainLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mainScrollRef = React.useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll active sidebar item into view
  useEffect(() => {
    const activeItem = document.getElementById('active-sidebar-item');
    const sidebarNav = document.getElementById('sidebar-nav');
    
    if (activeItem && sidebarNav) {
      const navRect = sidebarNav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      
      // If item is above the visible area or below the visible area, scroll it into view smoothly
      if (itemRect.top < navRect.top || itemRect.bottom > navRect.bottom) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'System Audit Logs', path: '/audit-logs', icon: 'ShieldAlert' },
    { name: 'Wildlife Surveys', path: '/surveys', icon: 'Map' },
    { name: 'Monitoring Sites', path: '/sites', icon: 'MapPin' },
    { name: 'Sensor Devices', path: '/devices', icon: 'Camera' },
    { name: 'Field Uploads', path: '/uploads', icon: 'UploadCloud' },
    { name: 'Observation Records', path: '/observations', icon: 'ClipboardList' },
    { name: 'AI Species Recognition', path: '/predictions', icon: 'Camera' },
    { name: 'Bioacoustic Analysis', path: '/audio-predictions', icon: 'Activity' },
    { name: 'Species Identification Engine', path: '/species-identification', icon: 'Activity' },
    { name: 'Biodiversity Analytics', path: '/biodiversity-analytics', icon: 'FileText' },
    { name: 'Wildlife Monitoring Reports', path: '/wildlife-reports', icon: 'FileText' },
    { name: 'Population Intelligence', path: '/population-intelligence', icon: 'Activity' },
    { name: 'Habitat Intelligence', path: '/habitat-intelligence', icon: 'Map' },
    { 
      name: (
        <span className="flex flex-col text-left leading-tight justify-center py-1">
          <span>Conservation</span>
          <span>Recommendation Engine</span>
        </span>
      ), 
      path: '/conservation-recommendations', 
      icon: Leaf 
    },
    { name: 'Ecosystem Health',             path: '/ecosystem-health',             icon: 'Sparkles' },
    { name: 'Wildlife Dashboard',      path: '/wildlife-dashboard',  icon: 'LayoutDashboard' },
    { name: 'Reports & Exports (Legacy)',      path: '/reports',     icon: 'FileText' },
    { name: 'Testing & Validation', path: '/testing-validation', icon: 'ShieldCheck' },
    { name: 'Wildlife Map',            path: '/map',         icon: 'Map' },
    { name: 'Notifications',           path: '/notifications', icon: 'Bell' },
    { name: 'Profile', path: '/profile', icon: 'UserCircle' },
    { name: 'Settings', path: '/settings', icon: 'Settings' }
  ];

  const getRoleName = (roleObj) => {
    if (!roleObj) return "";
    return typeof roleObj === 'string' ? roleObj : (roleObj.name || roleObj.role_name || "");
  };
  const isAdmin = getRoleName(user?.role).toLowerCase() === "administrator";

  const visibleNavItems = navItems.filter(item => {
    if (item.path === '/audit-logs') {
      return isAdmin;
    }
    return true;
  });

  const renderSidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <Leaf className="text-primary h-8 w-8" />
        <span className="font-bold text-xl text-foreground">WPIS</span>
      </div>
      
      <nav id="sidebar-nav" className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 relative">
        <AnimatePresence>
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                id={isActive ? "active-sidebar-item" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="relative block"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-bg"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start gap-3 h-12 rounded-xl transition-all relative z-10 group ${isActive ? 'text-primary font-semibold' : 'text-foreground/80 hover:bg-green-50 hover:text-green-700 dark:hover:bg-gray-800 dark:hover:text-white'}`}
                >
                  {Icon && <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-green-700'}`} />}
                  <span>{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </AnimatePresence>
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-border group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="ring-2 ring-white dark:ring-gray-800 shadow-sm group-hover:shadow-md transition-shadow">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-green-600 text-white font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-foreground">{user?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mt-1">{user?.role || 'User'}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full gap-2 text-gray-500 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg h-10 transition-colors" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Desktop Sidebar (Floating Style) */}
      <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] my-4 ml-4 rounded-2xl bg-white dark:bg-card border border-border shadow-sm soft-shadow z-20">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <Leaf className="text-primary h-6 w-6" />
          <span className="font-bold text-lg">WPIS</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setSearchOpen(true)}
            className="p-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <NotificationBell />
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-foreground">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white dark:bg-card shadow-2xl z-50 flex flex-col"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="h-6 w-6" />
                </button>
              </div>
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main ref={mainScrollRef} className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden pt-16 md:pt-0 relative scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scroll-smooth">
        <div className="hidden md:flex w-full px-10 pt-6 pb-2 justify-end items-center gap-3 shrink-0">
          <button 
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-muted-foreground rounded-full text-sm font-medium transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
          >
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <kbd className="ml-2 px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-border rounded text-[10px] font-sans shadow-sm">Ctrl K</kbd>
          </button>
          <NotificationBell />
        </div>
        {/* Background Decorative Blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="px-4 md:px-8 pb-8 max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
          <div className="bg-[#F5F7FA] dark:bg-gray-900/50 flex-1 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
            {children}
          </div>
        </div>
        <ScrollToTop scrollContainerRef={mainScrollRef} />
      </main>
    </div>
  );
};

export default MainLayout;
