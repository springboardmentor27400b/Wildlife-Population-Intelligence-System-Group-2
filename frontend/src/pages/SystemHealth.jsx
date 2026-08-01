import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    Activity, Cpu, HardDrive, Database, Server, CheckCircle2,
    Clock, RefreshCw, Zap, ShieldCheck
} from 'lucide-react';

export default function SystemHealth() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/system/health');
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch system health', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
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
                        <Activity className="w-4 h-4" />
                        <span>System Diagnostics & Health</span>
                    </div>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Platform System Health</h1>
                    <p className="mt-2 max-w-2xl text-slate-300 text-sm">
                        Live server diagnostics, database status, AI model loading state, hardware utilization, and latency performance indicators.
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="inline-flex items-center space-x-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition self-start md:self-auto"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Run Diagnostics</span>
                </button>
            </div>

            {/* Diagnostic Grid Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {/* Database Status */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Status</span>
                        <Database className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-xl font-bold text-slate-800">{data.sqlite_status}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                        <div><b>Engine Status:</b> Connected</div>
                        <div><b>Storage Size:</b> {data.database_size_mb} MB</div>
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
                        <span className="text-xl font-bold text-slate-800">{data.api_status}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                        <div><b>Response Latency:</b> {data.performance.processing_time_ms} ms</div>
                        <div><b>Last Health Sync:</b> {data.metadata.last_sync}</div>
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
                        <span className="text-sm font-bold text-slate-800">{data.model_status}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                        <div><b>Detection Speed:</b> {data.performance.detection_speed_fps} FPS</div>
                        <div><b>Avg Inference:</b> {data.performance.avg_inference_sec} sec</div>
                    </div>
                </div>

                {/* CPU Utilization */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CPU Usage</span>
                        <Zap className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="mt-4 text-3xl font-extrabold text-slate-800">{data.cpu_usage_percent}%</div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${data.cpu_usage_percent}%` }}></div>
                    </div>
                </div>

                {/* Memory Utilization */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">RAM Memory</span>
                        <Activity className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="mt-4 text-3xl font-extrabold text-slate-800">{data.memory_usage_percent}%</div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${data.memory_usage_percent}%` }}></div>
                    </div>
                </div>

                {/* Storage Disk Usage */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Disk Storage</span>
                        <HardDrive className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="mt-4 text-3xl font-extrabold text-slate-800">{data.storage.used_gb} / {data.storage.total_gb} GB</div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${data.storage.used_percent}%` }}></div>
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
                            <span className="font-bold text-slate-800">{data.metadata.application_version}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Python Runtime:</span>
                            <span className="font-bold text-slate-800">{data.metadata.python_version}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Total Database Records:</span>
                            <span className="font-bold text-slate-800">{data.metadata.total_records}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Last Database Backup:</span>
                            <span className="font-bold text-slate-800">{data.metadata.last_backup}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">System Uptime / Sync:</span>
                            <span className="font-bold text-emerald-600">{data.metadata.last_sync}</span>
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
