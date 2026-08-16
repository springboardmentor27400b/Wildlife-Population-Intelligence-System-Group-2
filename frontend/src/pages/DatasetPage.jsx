import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/ToastContext';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, FolderCheck, Scissors, BarChart3, Layers, Loader2 } from 'lucide-react';

const metricLabels = {
    total_images: { label: 'Total Images', icon: Layers },
    total_audio: { label: 'Total Audio', icon: Database },
    species_count: { label: 'Species Count', icon: FolderCheck },
    average_images_per_species: { label: 'Avg. Images / Species', icon: BarChart3 },
    duplicate_count: { label: 'Duplicate Files', icon: AlertTriangle },
    total_dataset_size: { label: 'Total Size', icon: Database },
    average_resolution: { label: 'Avg. Resolution', icon: Layers },
    corrupted_count: { label: 'Corrupted Files', icon: AlertTriangle },
};

export default function DatasetPage() {
    const [status, setStatus] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const { showSuccess, showError } = useToast();

    const loadData = async () => {
        try {
            const [statusRes, statsRes] = await Promise.all([
                api.get('/datasets/status'),
                api.get('/datasets/statistics')
            ]);
            setStatus(statusRes.data);
            setStatistics(statsRes.data);
        } catch (err) {
            console.error("Failed to load dataset status:", err);
            setMessage('Unable to contact the dataset service. Please check backend configuration.');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const runAction = async (endpoint, method = 'POST', successMsg = 'Action completed successfully.') => {
        setBusy(true);
        setMessage('');
        try {
            const res = method === 'GET' ? await api.get(`/datasets${endpoint}`) : await api.post(`/datasets${endpoint}`);
            const data = res.data;
            const msg = data.message || successMsg;
            setMessage(msg);
            showSuccess(msg);
            if (data.statistics) {
                setStatistics(data.statistics);
            }
            if (data.verification || data.datasets) {
                setStatus(prev => ({
                    ...prev,
                    datasets: data.datasets || data.verification,
                    verification: data.verification
                }));
            }
            await loadData();
        } catch (err) {
            console.error(`Action error ${endpoint}:`, err);
            const errDetail = err.response?.data?.detail || 'The dataset action could not be completed.';
            setMessage(errDetail);
            showError(errDetail);
        } finally {
            setBusy(false);
        }
    };

    const datasets = status?.datasets || status?.verification || {};
    const hasData = (statistics?.total_images || 0) + (statistics?.total_audio || 0) > 0;

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <section className="rounded-3xl bg-gradient-to-br from-indigo-800 via-slate-900 to-emerald-950 p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Milestone 2 • Management</p>
                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Wildlife Dataset Management</h1>
                        <p className="mt-2 max-w-2xl text-indigo-100/90 text-sm">
                            Validate source datasets, compute quality metrics, preprocess media files, and generate balanced train/validation/test splits.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15 text-xs">
                        <Database className="w-5 h-5 text-emerald-400" />
                        <div>
                            <p className="font-semibold">Dataset Status</p>
                            <p className="text-emerald-300">{hasData ? 'Verified & Active' : 'Dataset Folder Not Found'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    disabled={busy}
                    onClick={() => runAction('/verify', 'POST', 'Dataset verification completed successfully.')}
                    className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Verify Dataset</span>
                </button>

                <button
                    disabled={busy}
                    onClick={() => runAction('/preprocess', 'POST', 'Media preprocessing completed successfully.')}
                    className="inline-flex items-center space-x-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>Preprocess Dataset</span>
                </button>

                <button
                    disabled={busy}
                    onClick={() => runAction('/statistics', 'GET', 'Latest dataset statistics generated.')}
                    className="inline-flex items-center space-x-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-amber-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                    <span>Generate Statistics</span>
                </button>

                <button
                    disabled={busy}
                    onClick={() => runAction('/split', 'POST', 'Balanced train/validation/test splits generated successfully.')}
                    className="inline-flex items-center space-x-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-violet-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                    <span>Generate Splits</span>
                </button>
            </div>

            {/* Notification Banner */}
            {message && (
                <div role="status" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 shadow-sm flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {!hasData && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span>Dataset folder not found or empty. Please configure <code>DATASET_PATH</code> in <code>.env</code> or add data files.</span>
                </div>
            )}

            {/* Metric KPI Cards */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Object.entries(metricLabels).map(([key, item]) => {
                    const IconComponent = item.icon;
                    const value = statistics?.[key] ?? (busy ? '...' : 0);
                    return (
                        <div key={key} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                                <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                                    <IconComponent className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="mt-3 text-3xl font-extrabold text-slate-800">{value}</p>
                        </div>
                    );
                })}
            </section>

            {/* Dataset Status Table */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Dataset Repositories & Status</h2>
                        <p className="text-xs text-slate-500">Live monitoring of verified wildlife data sources</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="pb-3">Dataset Name</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Images</th>
                                <th className="pb-3">Audio</th>
                                <th className="pb-3">Species</th>
                                <th className="pb-3">Official Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Object.entries(datasets).length > 0 ? (
                                Object.entries(datasets).map(([name, item]) => {
                                    const isVerified = item.exists || item.status === 'Verified' || (item.image_count || 0) + (item.audio_count || 0) > 0;
                                    const sourceName = item.official_source || name.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
                                    const downloadUrl = item.official_download_page || 'https://www.gbif.org';

                                    return (
                                        <tr key={name} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3.5 font-medium capitalize text-slate-800">
                                                {name.replaceAll('_', ' ')}
                                            </td>
                                            <td className="py-3.5">
                                                <span className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    isVerified ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    <span>{isVerified ? 'Verified' : 'Dataset Not Found'}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 font-semibold text-slate-700">{item.image_count ?? item.images_count ?? 0}</td>
                                            <td className="py-3.5 font-semibold text-slate-700">{item.audio_count ?? 0}</td>
                                            <td className="py-3.5 font-semibold text-slate-700">{item.species_count ?? 0}</td>
                                            <td className="py-3.5">
                                                <a
                                                    className="inline-flex items-center space-x-1 text-indigo-600 font-medium hover:text-indigo-800 hover:underline text-xs"
                                                    href={downloadUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <span>{sourceName}</span>
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-6 text-center text-sm text-slate-500">
                                        Loading dataset status or no datasets detected...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
