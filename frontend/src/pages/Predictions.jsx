import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Cpu, Target,
    CheckCircle2, ArrowRight
} from 'lucide-react';

export default function Predictions() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/predictions/analytics');
            setData(res.data);
        } catch (err) {
            console.error('Failed to load predictions analytics', err);
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
                <div className="grid gap-4 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl bg-slate-200"></div>
                    ))}
                </div>
            </div>
        );
    }

    const { kpis, charts, recommendations } = data;

    const cards = [
        { label: '6-Month Population Projection', val: kpis.population_6_months.toLocaleString(), sub: '+3.8% forecast growth', color: 'from-emerald-600 to-teal-700', icon: TrendingUp },
        { label: '1-Year Population Projection', val: kpis.population_1_year.toLocaleString(), sub: '+7.6% projected expansion', color: 'from-sky-600 to-blue-700', icon: Sparkles },
        { label: 'Habitat Degradation Rate', val: `${kpis.habitat_degradation_rate}%/yr`, sub: 'Low environmental loss', color: 'from-amber-600 to-orange-700', icon: AlertTriangle },
        { label: 'Species Recovery Index', val: `${kpis.species_recovery_index}%`, sub: 'High conservation stability', color: 'from-indigo-600 to-purple-700', icon: ShieldCheck },
    ];

    return (
        <div className="space-y-8">
            {/* Banner */}
            <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="inline-flex items-center space-x-2 rounded-full bg-purple-700/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-200">
                        <Cpu className="w-4 h-4" />
                        <span>AI Forecasting Engine</span>
                    </div>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight">AI Predictive Analytics & Forecasting</h1>
                    <p className="mt-2 max-w-2xl text-purple-100/80 text-sm">
                        Machine learning trajectory projections, population growth modeling, threat probability evaluation, and automated proactive conservation intervention strategies.
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                                <div className={`rounded-xl bg-gradient-to-br ${card.color} p-2 text-white shadow-sm`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-4 text-3xl font-extrabold text-slate-800 tracking-tight">{card.val}</div>
                            <div className="mt-2 text-xs font-medium text-emerald-600">{card.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Forecast Line Chart & Species Trajectory Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. Population Trend Forecast */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">12-Month Population Trajectory Forecast</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.timeline_forecast}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="actual" name="Historical Observed" stroke="#059669" fill="#10b981" />
                                <Area type="monotone" dataKey="predicted" name="AI Projected Growth" stroke="#7c3aed" fill="#a855f7" strokeDasharray="4 4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Species-Specific Projections */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Species Growth Trajectories</h3>
                    <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                        {charts.species_predictions.map((sp, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{sp.species}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        Current: <b>{sp.current}</b> • Growth Rate: <span className={sp.growth_rate >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>{sp.growth_rate}%</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Projected 1 Yr</div>
                                    <div className="text-base font-extrabold text-slate-800">{sp.projected_12m}</div>
                                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${sp.trajectory === 'Rising' ? 'bg-emerald-100 text-emerald-700' : sp.trajectory === 'Stable' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                        {sp.trajectory}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Actionable Recommendation Cards */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">AI Recommended Preventive Interventions</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 shadow-xs hover:shadow-sm transition">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg ${rec.urgency === 'Critical' ? 'bg-red-100 text-red-700' : rec.urgency === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {rec.urgency} Urgency
                                    </span>
                                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                                        {rec.confidence}% Confidence
                                    </span>
                                </div>
                                <h4 className="mt-3 font-bold text-slate-800 text-base leading-snug">{rec.title}</h4>
                                <p className="mt-2 text-xs text-slate-600 leading-relaxed"><b>Reason:</b> {rec.reason}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs font-medium text-emerald-700 flex items-center space-x-1">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span><b>Expected Impact:</b> {rec.impact}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
