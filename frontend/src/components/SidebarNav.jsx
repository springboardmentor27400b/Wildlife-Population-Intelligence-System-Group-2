import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    MapPin,
    ClipboardList,
    Eye,
    Camera,
    Mic,
    Sparkles,
    Users,
    Trees,
    ShieldCheck,
    Activity,
    Database,
    FileText,
    User,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Leaf,
    BarChart2,
    Cpu,
    CheckCircle2,
    Compass,
    Layers
} from 'lucide-react';
import { api } from '../services/api';

const navSections = [
    {
        title: 'Overview',
        items: [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard },
            { name: 'Executive Analytics', path: '/executive-dashboard', icon: BarChart2 },
        ],
    },
    {
        title: 'Intelligence',
        items: [
            { name: 'AI Species Recognition', path: '/species', icon: Camera },
            { name: 'Audio Recognition', path: '/audio', icon: Mic },
            { name: 'Biodiversity', path: '/biodiversity', icon: Sparkles },
            { name: 'Population', path: '/population', icon: Users },
            { name: 'Habitat', path: '/habitat', icon: Trees },
            { name: 'Ecosystem', path: '/ecosystem', icon: Activity },
            { name: 'Conservation', path: '/conservation', icon: ShieldCheck },
        ],
    },
    {
        title: 'Spatial',
        items: [
            { name: 'GIS Map', path: '/gis', icon: MapPin },
        ],
    },
    {
        title: 'Operations',
        items: [
            { name: 'Observations', path: '/observations', icon: Eye },
            { name: 'Surveys', path: '/surveys', icon: ClipboardList },
            { name: 'Monitoring Sites', path: '/sites', icon: Compass },
            { name: 'Datasets', path: '/datasets', icon: Database },
            { name: 'Reports', path: '/reports', icon: FileText },
            { name: 'System Health', path: '/system-health', icon: Cpu },
            { name: 'Profile', path: '/profile', icon: User },
        ],
    },
];

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/profile', { headers: { Authorization: `Bearer ${token}` } })
                .then((res) => setUser(res.data))
                .catch(() => setUser(null));
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Helper to test active route matching
    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    // Find current page label for header
    let currentPageTitle = 'Dashboard';
    for (const section of navSections) {
        for (const item of section.items) {
            if (isActive(item.path)) {
                currentPageTitle = item.name;
                break;
            }
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out md:static md:z-auto ${
                    isMobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'
                } ${isCollapsed ? 'md:w-[72px]' : 'md:w-[260px]'}`}
            >
                {/* Sidebar Brand Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/50">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 no-underline transition-opacity duration-200 ${
                            isCollapsed ? 'justify-center w-full' : ''
                        }`}
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400/30 flex-shrink-0">
                            <Leaf className="h-5 w-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                                    Wildlife Intelligence
                                </span>
                                <span className="text-[11px] font-medium text-emerald-400 leading-tight truncate">
                                    Conservation Platform
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen(false)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation Sections */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
                    {navSections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            {!isCollapsed && (
                                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400/90 select-none">
                                    {section.title}
                                </div>
                            )}

                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        title={isCollapsed ? item.name : undefined}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 no-underline ${
                                            isCollapsed ? 'justify-center px-0' : ''
                                        } ${
                                            active
                                                ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-900/50 ring-1 ring-emerald-400/40'
                                                : 'text-slate-300 hover:bg-slate-800/80 hover:text-emerald-300'
                                        }`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                                active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                                            }`}
                                        />
                                        {!isCollapsed && (
                                            <span className="truncate">{item.name}</span>
                                        )}
                                        {active && !isCollapsed && (
                                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-200" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}

                    {/* Logout Button */}
                    <div className="space-y-1 pt-2 border-t border-slate-800/60">
                        <button
                            type="button"
                            onClick={logout}
                            title={isCollapsed ? 'Logout' : undefined}
                            className={`group w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all duration-200 no-underline cursor-pointer ${
                                isCollapsed ? 'justify-center px-0' : ''
                            }`}
                        >
                            <LogOut className="h-4 w-4 flex-shrink-0 text-rose-400 group-hover:scale-110 transition-transform duration-200" />
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </div>

                {/* Sidebar Desktop Toggle Footer */}
                <div className="hidden md:flex h-12 items-center justify-between border-t border-slate-800/80 px-4 bg-slate-950/40">
                    {!isCollapsed && (
                        <span className="text-[11px] text-slate-500 font-medium select-none">Production Platform</span>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all duration-200 shadow-xs cursor-pointer"
                        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </aside>

            {/* Main Layout Area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 shadow-xs backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        {/* Mobile Drawer Hamburger Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 md:hidden transition-colors"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                    Wildlife Population Intelligence System
                                </h1>
                                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/80">
                                    <CheckCircle2 className="h-3 w-3" /> Live
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 hidden sm:block">
                                Active Module: <span className="font-semibold text-emerald-700">{currentPageTitle}</span>
                            </p>
                        </div>
                    </div>

                    {/* User Profile Info & Logout Header Item */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/80 pl-2 pr-3 py-1 text-sm shadow-xs">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white shadow-xs text-xs">
                                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-800 leading-none">
                                    {user?.full_name || 'Researcher'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium leading-tight">
                                    {user?.role || 'Admin'}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={logout}
                            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-xs cursor-pointer"
                            title="Logout of system"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                {/* Page Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>

                {/* App Footer */}
                <footer className="border-t border-slate-200/80 bg-white/70 px-6 py-3.5 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <span className="font-semibold text-slate-700">Wildlife Intelligence System</span> • AI-Powered Conservation Platform
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <span>Population</span> • <span>Habitat</span> • <span>Conservation</span> • <span>Ecosystem</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

