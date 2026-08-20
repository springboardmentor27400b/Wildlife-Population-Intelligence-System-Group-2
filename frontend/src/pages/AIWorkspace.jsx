import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Camera,
    Mic,
    Users,
    Trees,
    ShieldCheck,
    Activity,
    LayoutDashboard,
    Download,
    Cpu,
    CheckCircle2
} from 'lucide-react';
import { api, resolveAssetUrl } from '../services/api';
import { StatCard } from '../components/SharedComponents';

import SpeciesRecognition from './SpeciesRecognition';
import AudioRecognition from './AudioRecognition';
import Biodiversity from './Biodiversity';
import PopulationIntelligence from './PopulationIntelligence';
import HabitatIntelligence from './HabitatIntelligence';
import Conservation from './Conservation';
import EcosystemAnalytics from './EcosystemAnalytics';
import IntelligenceDashboard from './IntelligenceDashboard';

const workspaceTabs = [
    { id: 'overview', name: 'AI Dashboard', path: '/intelligence', icon: LayoutDashboard },
    { id: 'species', name: 'Species Recognition', path: '/species', icon: Camera },
    { id: 'audio', name: 'Audio Recognition', path: '/audio', icon: Mic },
    { id: 'biodiversity', name: 'Biodiversity', path: '/biodiversity', icon: Sparkles },
    { id: 'population', name: 'Population Intelligence', path: '/population', icon: Users },
    { id: 'habitat', name: 'Habitat Intelligence', path: '/habitat', icon: Trees },
    { id: 'conservation', name: 'Conservation', path: '/conservation', icon: ShieldCheck },
    { id: 'ecosystem', name: 'Ecosystem Health', path: '/ecosystem', icon: Activity },
];

export default function AIWorkspace() {
    const location = useLocation();
    const navigate = useNavigate();
    const [quickStats, setQuickStats] = useState(null);

    // Map URL path to active tab
    const getTabFromPath = (pathname) => {
        if (pathname === '/species') return 'species';
        if (pathname === '/audio') return 'audio';
        if (pathname === '/biodiversity') return 'biodiversity';
        if (pathname === '/population') return 'population';
        if (pathname === '/habitat') return 'habitat';
        if (pathname === '/conservation') return 'conservation';
        if (pathname === '/ecosystem') return 'ecosystem';
        return 'overview';
    };

    const activeTab = getTabFromPath(location.pathname);

    useEffect(() => {
        api.get('/intelligence/dashboard')
            .then((res) => setQuickStats(res.data))
            .catch(() => setQuickStats(null));
    }, []);

    return (
        <div className="space-y-6">
            {/* Top AI Workspace Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl ring-1 ring-emerald-500/20">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                            <Cpu className="h-3.5 w-3.5" /> Single Unified AI Workspace • Live System
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                            AI Population & Ecosystem Intelligence Workspace
                        </h1>
                        <p className="max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                            Integrated bioacoustics (AST), computer vision (YOLOv8), population forecasting, habitat assessment, and automated conservation recommendations.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={resolveAssetUrl('/api/intelligence/export/pdf')}
                            download
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors no-underline"
                        >
                            <Download className="h-4 w-4" /> Export Intelligence PDF
                        </a>
                        <a
                            href={resolveAssetUrl('/api/intelligence/export/csv')}
                            download
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors no-underline"
                        >
                            <Download className="h-4 w-4" /> Export CSV
                        </a>
                    </div>
                </div>

                {/* Quick AI KPI Metrics Bar */}
                {quickStats && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
                        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800">
                            <p className="text-[11px] font-medium text-slate-400">Total Population</p>
                            <p className="text-lg font-bold text-white mt-0.5">
                                {quickStats.population?.total_population || 309}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800">
                            <p className="text-[11px] font-medium text-slate-400">Habitats Assessed</p>
                            <p className="text-lg font-bold text-emerald-400 mt-0.5">
                                {quickStats.habitat?.total_habitats || 4} Zones
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800">
                            <p className="text-[11px] font-medium text-slate-400">AI Recommendations</p>
                            <p className="text-lg font-bold text-sky-400 mt-0.5">
                                {quickStats.conservation?.length || 1} Active
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800">
                            <p className="text-[11px] font-medium text-slate-400">Ecosystem Grade</p>
                            <p className="text-lg font-bold text-amber-400 mt-0.5">
                                {quickStats.ecosystem?.grade || 'Moderate'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Workspace Navigation Tabs Bar */}
                <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-4">
                    {workspaceTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => navigate(tab.path)}
                                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                                    active
                                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className={`h-4 w-4 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Dynamic Active Tab Content Panel */}
            <div className="transition-all duration-200">
                {activeTab === 'overview' && <IntelligenceDashboard />}
                {activeTab === 'species' && <SpeciesRecognition />}
                {activeTab === 'audio' && <AudioRecognition />}
                {activeTab === 'biodiversity' && <Biodiversity />}
                {activeTab === 'population' && <PopulationIntelligence />}
                {activeTab === 'habitat' && <HabitatIntelligence />}
                {activeTab === 'conservation' && <Conservation />}
                {activeTab === 'ecosystem' && <EcosystemAnalytics />}
            </div>
        </div>
    );
}
