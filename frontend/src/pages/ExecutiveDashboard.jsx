import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    RadialBarChart, RadialBar, ComposedChart, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    ShieldCheck, Users, Trees, Activity, AlertTriangle, Cpu,
    Target, Sparkles, TrendingUp, Download, RefreshCw, BarChart2, Loader2
} from 'lucide-react';
import { useToast } from '../components/ToastContext';

export default function ExecutiveDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);
    const { showSuccess, showError } = useToast();

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/analytics/executive');
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load executive analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const exportPDF = async () => {
        try {
            setExporting(true);
            const response = await api.get('/reports/export/pdf', { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Wildlife_Executive_Report.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showSuccess('Executive PDF Report generated & downloaded successfully!');
        } catch (err) {
            console.error('PDF Export Exception:', err);
            showError('Failed to generate PDF Report. Please check backend connection.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-32 rounded-3xl bg-slate-200"></div>
                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl bg-slate-200"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                <h3 className="font-bold text-lg">Failed to Load Executive Dashboard</h3>
                <p className="mt-2 text-sm">{error}</p>
                <button onClick={loadData} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white font-semibold">
                    Retry Loading
                </button>
            </div>
        );
    }

    const { kpis, charts } = data;

    const kpiCards = [
        { label: 'Total Wildlife Species', val: kpis.total_species, icon: Sparkles, color: 'from-emerald-600 to-teal-700' },
        { label: 'Total Population', val: kpis.total_population.toLocaleString(), icon: Users, color: 'from-sky-600 to-blue-700' },
        { label: 'Protected Habitats', val: kpis.protected_habitats, icon: Trees, color: 'from-emerald-700 to-green-800' },
        { label: 'Conservation Score', val: `${kpis.conservation_score}/100`, icon: ShieldCheck, color: 'from-purple-600 to-indigo-700' },
        { label: 'Threatened Species', val: kpis.threatened_species, icon: AlertTriangle, color: 'from-amber-600 to-orange-700' },
        { label: 'AI Detection Accuracy', val: `${kpis.ai_accuracy}%`, icon: Cpu, color: 'from-teal-600 to-emerald-700' },
        { label: 'Avg Habitat Health', val: `${kpis.avg_habitat_health}%`, icon: Activity, color: 'from-indigo-600 to-blue-700' },
        { label: 'Observation Coverage', val: `${kpis.observation_coverage}%`, icon: Target, color: 'from-emerald-600 to-cyan-700' },
        { label: 'Detection Confidence', val: `${kpis.detection_confidence}%`, icon: ShieldCheck, color: 'from-blue-600 to-indigo-700' },
        { label: 'Model Accuracy', val: `${kpis.model_accuracy}%`, icon: Cpu, color: 'from-violet-600 to-purple-700' },
        { label: 'Monthly Growth', val: `+${kpis.monthly_growth}%`, icon: TrendingUp, color: 'from-emerald-600 to-green-700' },
        { label: 'Environmental Risk', val: `${kpis.environmental_risk}%`, icon: AlertTriangle, color: 'from-rose-600 to-red-700' },
    ];

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-700/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                        <BarChart2 className="w-4 h-4" />
                        <span>Executive Intelligence Overview</span>
                    </div>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Executive Wildlife Intelligence Dashboard</h1>
                    <p className="mt-2 max-w-2xl text-emerald-100/80 text-sm">
                        Real-time KPI metrics, population analytics, habitat quality indicators, and AI model performance metrics.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={loadData}
                        className="inline-flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={exportPDF}
                        disabled={exporting}
                        className="inline-flex items-center space-x-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {exporting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span>Export PDF</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 12 KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
                {kpiCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={i}
                            className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                                <div className={`rounded-xl bg-gradient-to-br ${card.color} p-2 text-white shadow-sm`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3 text-3xl font-extrabold text-slate-800 tracking-tight">{card.val}</div>
                        </div>
                    );
                })}
            </div>

            {/* 12 Interactive Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. Population Trend */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">1. Population Trend (6-Month Velocity)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.population_trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Line type="monotone" dataKey="population" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Species Distribution */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">2. Species Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.species_distribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="species" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Habitat Health */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">3. Habitat Quality Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.habitat_health}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="habitat" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="health" name="Health Score" fill="#10b981" />
                                <Bar dataKey="water" name="Water Score" fill="#0284c7" />
                                <Bar dataKey="vegetation" name="Vegetation" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Conservation Status */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">4. Conservation Priority Distribution</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={charts.conservation_status} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={4} label>
                                    {charts.conservation_status.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. Monthly Detections */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">5. Monthly Detection Velocity</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.monthly_detections}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="images" name="Image Detections" stackId="1" stroke="#059669" fill="#10b981" />
                                <Area type="monotone" dataKey="audio" name="Audio Calls" stackId="1" stroke="#0284c7" fill="#38bdf8" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. AI Accuracy Model Evolution */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">6. AI Model Accuracy Evolution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.ai_accuracy}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="version" stroke="#64748b" fontSize={12} />
                                <YAxis domain={[70, 100]} stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="yolo_accuracy" name="YOLOv8 Accuracy" stroke="#7c3aed" strokeWidth={3} />
                                <Line type="monotone" dataKey="audio_accuracy" name="Audio Librosa Accuracy" stroke="#059669" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 7. Confidence Trend */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">7. Detection Confidence Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.confidence_trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                                <YAxis domain={[80, 100]} stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Line type="monotone" dataKey="avg_confidence" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 8. Population Forecast */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">8. 12-Month Population Forecast</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={charts.population_forecast}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="historical" name="Historical Count" fill="#059669" radius={[6, 6, 0, 0]} />
                                <Line type="monotone" dataKey="projected" name="Projected Growth" stroke="#d97706" strokeWidth={3} strokeDasharray="4 4" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 9. Threat Distribution */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">9. Environmental Threat Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.threat_distribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis dataKey="threat" type="category" stroke="#64748b" fontSize={12} width={130} />
                                <Tooltip />
                                <Bar dataKey="level" fill="#dc2626" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 10. Protected Area Coverage */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">10. Protected Area Monitoring Coverage</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.protected_area_coverage}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="site" stroke="#64748b" fontSize={11} interval={0} angle={-10} textAnchor="end" />
                                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="coverage_pct" name="Coverage %" fill="#0d9488" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 11. Observation Timeline */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">11. Observation Velocity Timeline</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.observation_timeline}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Line type="step" dataKey="count" name="Sighting Count" stroke="#4f46e5" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 12. Survey Completion */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">12. Survey Completion Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.survey_completion}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="sector" stroke="#64748b" fontSize={12} />
                                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="completed" name="Completed Surveys" fill="#059669" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="target" name="Target Objective" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
