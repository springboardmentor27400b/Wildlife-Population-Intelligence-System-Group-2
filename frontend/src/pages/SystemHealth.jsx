import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    Activity, Cpu, HardDrive, Database, Server, CheckCircle2,
    Clock, RefreshCw, Zap, ShieldCheck, AlertCircle
} from 'lucide-react';

export default function SystemHealth() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const loadData = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await api.get('/system/health');
            setData(res.data);
            setError(null);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch system health', err);
            setError('Failed to refresh real-time hardware diagnostics from server.');
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        loadData(false);
        // Auto-refresh real-time system metrics every 3 seconds
        const timer = setInterval(() => {
            loadData(true);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    if (loading && !data) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-32 rounded-3xl bg-slate-200"></div>
                <div className="grid gap-4 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl bg-slate-200"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-slate-800 via-slate-900 to-black p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span>Real-Time Server Diagnostics</span>
                    </div>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Platform System Health</h1>
                    <p className="mt-2 max-w-2xl text-slate-300 text-sm">
                        Live hardware utilization (CPU, RAM, Disk Storage), database engine status, AI inference speed, and system telemetry metrics.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={() => loadData(false)}
                        className="inline-flex items-center space-x-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition self-start md:self-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh Metrics</span>
                    </button>
                    <span className="text-xs text-slate-400">
                        Auto-syncing every 3s • Last: {lastUpdated.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {error && (
                <div className="flex items-center space-x-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-600 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Diagnostic Grid Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {/* 1. Real-Time CPU Utilization */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CPU Usage</span>
                            <Zap className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-3xl font-extrabold text-slate-800">{data?.cpu_usage_percent}%</span>
                            <span className="text-xs font-semibold text-slate-500">Live CPU Load</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${
                                    data?.cpu_usage_percent > 80 ? 'bg-red-500' : data?.cpu_usage_percent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(2, data?.cpu_usage_percent || 0))}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 2. Real-Time RAM Utilization */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">RAM Memory</span>
                            <Activity className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-3xl font-extrabold text-slate-800">{data?.memory_usage_percent}%</span>
                            <span className="text-xs font-semibold text-slate-500">
                                {data?.ram?.used_gb || 0} / {data?.ram?.total_gb || 0} GB
                            </span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${
                                    data?.memory_usage_percent > 85 ? 'bg-red-500' : 'bg-indigo-600'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(2, data?.memory_usage_percent || 0))}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 3. Real-Time Disk Storage */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Disk Storage</span>
                            <HardDrive className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-800">
                                {data?.storage?.used_gb} / {data?.storage?.total_gb} GB
                            </span>
                            <span className="text-xs font-bold text-teal-600">
                                {data?.storage?.used_percent}% Used
                            </span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(2, data?.storage?.used_percent || 0))}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Database Status */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Status</span>
                        <Database className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-xl font-bold text-slate-800">{data?.sqlite_status}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                        <div><b>Engine Status:</b> Connected</div>
                        <div><b>Storage Size:</b> {data?.database_size_mb} MB</div>
                    </div>
                </div>

                {/* API Status */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FastAPI Server</span>
                        <Server className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-xl font-bold text-slate-800">{data?.api_status}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                        <div><b>Response Latency:</b> {data?.performance?.processing_time_ms} ms</div>
                        <div><b>Last Health Sync:</b> {data?.metadata?.last_sync}</div>
                    </div>
                </div>

                {/* AI Models Status */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Inference Pipeline</span>
                        <Cpu className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-slate-800">{data?.model_status}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                        <div><b>Detection Speed:</b> {data?.performance?.detection_speed_fps} FPS</div>
                        <div><b>Avg Inference:</b> {data?.performance?.avg_inference_sec} sec</div>
                    </div>
                </div>
            </div>

            {/* Platform Information Table */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Platform & Deployment Information</h3>
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Application Version:</span>
                            <span className="font-bold text-slate-800">{data?.metadata?.application_version}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Python Runtime:</span>
                            <span className="font-bold text-slate-800">{data?.metadata?.python_version}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Total Database Records:</span>
                            <span className="font-bold text-slate-800">{data?.metadata?.total_records}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Last Database Backup:</span>
                            <span className="font-bold text-slate-800">{data?.metadata?.last_backup}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">System Uptime / Sync:</span>
                            <span className="font-bold text-emerald-600">{data?.metadata?.last_sync}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Overall System Status:</span>
                            <span className="font-bold text-emerald-600">Operational (100% Healthy)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
