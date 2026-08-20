import { Leaf, PawPrint, Activity, Award } from 'lucide-react';

export default function AnalyticsCards({ summary }) {
    if (!summary || !summary.statistics) return null;
    const { statistics, total_species, most_common_species } = summary;

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                        <Leaf className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Species</p>
                        <h3 className="text-2xl font-bold text-gray-900">{total_species || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Species Richness</p>
                        <h3 className="text-2xl font-bold text-gray-900">{statistics.richness || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
                        <Award className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
                        <h3 className="text-2xl font-bold text-gray-900">{(statistics.average_confidence * 100).toFixed(1)}%</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                        <PawPrint className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Most Common</p>
                        <h3 className="text-lg font-bold text-gray-900 truncate max-w-[120px]">{most_common_species || 'N/A'}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
