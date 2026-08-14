import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Milestone,
  MapPin,
  Camera,
  Volume2,
  Eye,
  User,
  Shield,
  LogOut,
  BookOpen,
  Sprout,
  TrendingUp,
  Compass,
  Map,
  Heart,
  Bell
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const sections = [
    {
      title: 'WILDLIFE MONITORING',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Surveys', path: '/surveys', icon: Milestone },
        { name: 'Monitoring Sites', path: '/monitoring-sites', icon: MapPin },
        { name: 'Camera Traps', path: '/camera-traps', icon: Camera },
        { name: 'Audio Sensors', path: '/audio-sensors', icon: Volume2 },
        { name: 'Observations', path: '/observations', icon: Eye },
        { name: 'Notifications', path: '/notifications', icon: Bell },
        { name: 'Reports', path: '/reports', icon: BookOpen }
      ]
    },
    {
      title: 'AI SPECIES INTELLIGENCE',
      items: [
        { name: 'Species Recognition', path: '/species-recognition', icon: Camera },
        { name: 'Audio Analysis', path: '/audio-analysis', icon: Volume2 }
      ]
    },
    {
      title: 'WILDLIFE INTELLIGENCE',
      items: [
        { name: 'Population Analytics', path: '/research-trends', icon: TrendingUp },
        { name: 'AI Ecological Intelligence', path: '/ecological', icon: Sprout },
        { name: 'Habitat Intelligence', path: '/habitat', icon: Compass },
        { name: 'Spatial Map', path: '/map', icon: Map },
        { name: 'Conservation Recommendation', path: '/conservation', icon: Shield },
        { name: 'Ecosystem Health', path: '/ecosystem-health', icon: Heart }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200 dark:border-forest-850 bg-white dark:bg-forest-900 transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center gap-3.5 px-6 border-b border-slate-100 dark:border-forest-850">
            <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <div className="leading-none">
              <span className="text-sm font-bold font-outfit text-slate-800 dark:text-slate-100">
                WILDLIFE
              </span>
              <p className="text-[10px] text-slate-455 font-semibold tracking-widest">
                INTELLIGENCE
              </p>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="flex-1 px-4 py-5 space-y-5 overflow-y-auto">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <div className="px-3">
                  <span className="text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase block">
                    {section.title}
                  </span>
                  <div className="h-[1px] bg-slate-100 dark:bg-forest-850/50 mt-1 mb-1.5" />
                </div>
                <div className="space-y-0.5 pl-1.5">
                  {section.items.map((item, idx) => (
                    <NavLink
                      key={idx}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 768) toggleSidebar();
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
                            : 'text-slate-655 dark:text-slate-350 hover:bg-emerald-50/50 hover:text-emerald-700 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400'
                        }`
                      }
                    >
                      <item.icon className="w-4.5 h-4.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Footer Profile & Logout */}
          <div className="p-4 border-t border-slate-100 dark:border-forest-850 bg-slate-50/50 dark:bg-forest-950/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-350 flex items-center justify-center font-bold text-sm select-none">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none">
                  {user?.full_name}
                </p>
                <span className="text-[10px] text-slate-455 dark:text-slate-500 font-medium truncate block mt-0.5">
                  {user?.role}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link to="/profile" className="flex-1">
                <button className="w-full text-center py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-forest-850 dark:hover:bg-forest-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors">
                  Profile
                </button>
              </Link>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-[10px] font-bold text-rose-600 transition-colors flex items-center justify-center"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
