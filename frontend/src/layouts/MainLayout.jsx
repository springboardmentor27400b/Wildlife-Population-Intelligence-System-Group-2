import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Leaf, UserCircle, Settings, LogOut, LayoutDashboard, Menu, X, Users, Activity, Map, Camera, AlertCircle, Trees, MapPin, UploadCloud, ClipboardList, FileText, Bell, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rolePermissions } from '../config/rolePermissions';
import NotificationBell from '../components/NotificationBell';

const iconMap = {
  LayoutDashboard, UserCircle, Settings, Users, Activity, Map, Camera, AlertCircle, Trees, MapPin, UploadCloud, ClipboardList, FileText, ShieldAlert
};

const MainLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { name: 'Reports & Exports (Legacy)',      path: '/reports',     icon: 'FileText' },
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

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <Leaf className="text-primary h-8 w-8" />
        <span className="font-bold text-xl text-foreground">WPIS</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = iconMap[item.icon];
          
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant="ghost" 
                className={`w-full justify-start gap-3 h-12 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/15 font-semibold' : 'hover:bg-primary/5 text-foreground/80'}`}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span>{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="ring-2 ring-white dark:ring-gray-800 shadow-sm">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-foreground">{user?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5 opacity-75">{user?.role || 'User'}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive rounded-lg h-10" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      
      {/* Desktop Sidebar (Floating Style) */}
      <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] my-4 ml-4 rounded-2xl bg-white dark:bg-card border border-border shadow-sm soft-shadow z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <Leaf className="text-primary h-6 w-6" />
          <span className="font-bold text-lg">WPIS</span>
        </div>
        <div className="flex items-center gap-1">
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
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0 relative">
        <div className="hidden md:flex absolute top-6 right-10 z-50">
          <NotificationBell />
        </div>
        {/* Background Decorative Blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
