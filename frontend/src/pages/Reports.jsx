import { useEffect, useState } from 'react';
import { api, resolveAssetUrl } from '../services/api';
import {
    FileText, Download, FileSpreadsheet, FileCode, CheckCircle2,
    ShieldCheck, Activity, Users, Trees, Sparkles
} from 'lucide-react';

export default function Reports() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadReport = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reports/advanced');
            setReport(res.data);
        } catch (err) {
            console.error('Failed to load advanced report', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    const exportFile = (format) => {
        window.open(resolveAssetUrl(`/api/reports/export/${format}`), '_blank');
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-32 rounded-3xl bg-slate-200"></div>
                <div className="h-64 rounded-2xl bg-slate-200"></div>
            </div>
        );
    }

    const { executive_summary, species_analysis, population_report, habitat_report, conservation_report, ecosystem_health, ai_detection_statistics } = report;

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="inline-flex items-center space-x-2 rounded-full bg-amber-600/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
                        <FileText className="w-4 h-4" />
                        <span>Multi-Format Reporting Engine</span>
                    </div>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Advanced Wildlife Intelligence Reports</h1>
                    <p className="mt-2 max-w-2xl text-amber-100/80 text-sm">
                        Generate and export multi-module analytical reports covering species taxonomy, population statistics, habitat quality, conservation actions, and ecosystem health.
                    </p>
                </div>

                {/* Export Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => exportFile('pdf')}
                        className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export PDF</span>
                    </button>
                    <button
                        onClick={() => exportFile('csv')}
                        className="inline-flex items-center space-x-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => exportFile('excel')}
                        className="inline-flex items-center space-x-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export Excel</span>
                    </button>
                    <button
                        onClick={() => exportFile('json')}
                        className="inline-flex items-center space-x-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition"
                    >
                        <FileCode className="w-4 h-4" />
                        <span>Export JSON</span>
                    </button>
                </div>
            </div>

            {/* Executive Summary Cards */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Executive Summary</h3>
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monitored Species</div>
                        <div className="mt-2 text-2xl font-extrabold text-slate-800">{executive_summary.total_species_monitored}</div>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Total Population</div>
                        <div className="mt-2 text-2xl font-extrabold text-emerald-700">{executive_summary.estimated_total_population.toLocaleString()}</div>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Healthy Habitats</div>
                        <div className="mt-2 text-2xl font-extrabold text-sky-700">{executive_summary.healthy_habitats} Zones</div>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Ecosystem Grade</div>
                        <div className="mt-2 text-2xl font-extrabold text-purple-700">{executive_summary.overall_health_score} ({executive_summary.ecosystem_grade})</div>
                    </div>
                </div>
            </div>

            {/* Population & Species Report Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Population Report */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Population Statistics Report</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                                <tr>
                                    <th className="p-3">Species</th>
                                    <th className="p-3">Est. Count</th>
                                    <th className="p-3">Growth</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {population_report.slice(0, 7).map((p, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                                        <td className="p-3 font-semibold text-slate-800">{p.species}</td>
                                        <td className="p-3 text-slate-700">{p.estimated_population}</td>
                                        <td className="p-3 text-emerald-600 font-bold">+{p.growth_rate}%</td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Conservation Action Items */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Conservation Interventions</h3>
                    <div className="space-y-3">
                        {conservation_report.slice(0, 4).map((c, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-sm">{c.title}</span>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${c.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {c.priority}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-600">{c.recommendation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
