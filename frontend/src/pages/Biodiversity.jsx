import { useEffect, useState } from 'react';
import AnalyticsCards from '../components/AnalyticsCards';
import SpeciesDistributionChart from '../components/SpeciesDistributionChart';
import DailyTrendChart from '../components/DailyTrendChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import ConfidenceChart from '../components/ConfidenceChart';
import TopSpeciesTable from '../components/TopSpeciesTable';
import DetectionTimeline from '../components/DetectionTimeline';
import AIPageLayout from '../components/AIPageLayout';

export default function Biodiversity() {
    const [summary, setSummary] = useState(null);
    const [confidenceTrend, setConfidenceTrend] = useState([]);
    const [dailyVelocity, setDailyVelocity] = useState([]);
    const [monthlyVelocity, setMonthlyVelocity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [summaryRes, confRes, dailyRes, monthlyRes] = await Promise.all([
                    fetch('/api/ai/biodiversity', { headers }),
                    fetch('/api/biodiversity/confidence-trend', { headers }),
                    fetch('/api/biodiversity/daily-velocity', { headers }),
                    fetch('/api/biodiversity/monthly-velocity', { headers })
                ]);

                let summaryData = null;
                if (summaryRes.ok) {
                    summaryData = await summaryRes.json();
                    setSummary(summaryData);
                } else {
                    setError("Failed to fetch biodiversity summary.");
                }

                if (confRes.ok) {
                    const cData = await confRes.json();
                    setConfidenceTrend(cData);
                } else if (summaryData?.confidence_trend) {
                    setConfidenceTrend(summaryData.confidence_trend);
                }

                if (dailyRes.ok) {
                    const dData = await dailyRes.json();
                    setDailyVelocity(dData);
                } else if (summaryData?.daily_trends) {
                    setDailyVelocity(summaryData.daily_trends);
                }

                if (monthlyRes.ok) {
                    const mData = await monthlyRes.json();
                    setMonthlyVelocity(mData);
                } else if (summaryData?.monthly_trends) {
                    setMonthlyVelocity(summaryData.monthly_trends);
                }
            } catch (err) {
                console.error("Biodiversity data fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <div className="text-xl font-medium text-slate-500 animate-pulse">Loading Biodiversity Analytics...</div>
            </div>
        );
    }

    if (error && !summary) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <div className="rounded-xl bg-red-50 p-6 text-red-600 border border-red-200">Error: {error}</div>
            </div>
        );
    }

    const effectiveConfidenceTrend = (confidenceTrend && confidenceTrend.length > 0) 
        ? confidenceTrend 
        : (summary?.confidence_trend || []);

    const effectiveDailyVelocity = (dailyVelocity && dailyVelocity.length > 0) 
        ? dailyVelocity 
        : (summary?.daily_trends || summary?.daily_trend || []);

    const effectiveMonthlyVelocity = (monthlyVelocity && monthlyVelocity.length > 0) 
        ? monthlyVelocity 
        : (summary?.monthly_trends || summary?.monthly_trend || summary?.detection_trends || []);

    return (
        <AIPageLayout
            title="Biodiversity Analytics"
            description="Monitor ecological richness, population diversity, and detection velocity across sensor networks."
        >
            {/* Top Cards */}
            <AnalyticsCards summary={summary} />

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 text-lg font-semibold text-slate-900">Species Distribution</h3>
                    <SpeciesDistributionChart data={summary?.species_distribution} />
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Detection Confidence Trend</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                            80%–99% AI Accuracy
                        </span>
                    </div>
                    <ConfidenceChart data={effectiveConfidenceTrend} />
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Daily Detection Velocity</h3>
                        <span className="text-xs bg-sky-100 text-sky-800 font-semibold px-2.5 py-1 rounded-full border border-sky-200">
                            Last 30 Days
                        </span>
                    </div>
                    <DailyTrendChart data={effectiveDailyVelocity} />
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Monthly Comparative Velocity</h3>
                        <span className="text-xs bg-violet-100 text-violet-800 font-semibold px-2.5 py-1 rounded-full border border-violet-200">
                            Jan–Jul 2026
                        </span>
                    </div>
                    <MonthlyTrendChart data={effectiveMonthlyVelocity} />
                </div>
            </div>

            {/* Tables and Activity Timeline */}
            <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Top Detected Species</h3>
                    </div>
                    <TopSpeciesTable data={summary?.top_detected_species} />
                </div>
                
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 text-lg font-semibold text-slate-900">Recent Activity</h3>
                    <DetectionTimeline data={summary?.detection_timeline} />
                </div>
            </div>
        </AIPageLayout>
    );
}
