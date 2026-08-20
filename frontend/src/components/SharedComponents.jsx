import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Sparkles,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Info
} from 'lucide-react';

// 1. StatCard
export function StatCard({ title, value, change, changeType = 'positive', icon: Icon, color = 'emerald', subtitle }) {
    const colorClasses = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20',
        teal: 'bg-teal-50 text-teal-600 border-teal-100 ring-teal-500/20',
        sky: 'bg-sky-50 text-sky-600 border-sky-100 ring-sky-500/20',
        violet: 'bg-violet-50 text-violet-600 border-violet-100 ring-violet-500/20',
        amber: 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/20',
        rose: 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/20',
    };

    const iconStyle = colorClasses[color] || colorClasses.emerald;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
                    {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
                </div>
                {Icon && (
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ring-1 ${iconStyle} transition-transform duration-200 group-hover:scale-110`}>
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </div>
            {change && (
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
                    {changeType === 'positive' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 font-semibold border border-emerald-200/60">
                            <TrendingUp className="h-3.5 w-3.5" /> {change}
                        </span>
                    ) : changeType === 'negative' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-rose-700 font-semibold border border-rose-200/60">
                            <TrendingDown className="h-3.5 w-3.5" /> {change}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 font-medium border border-slate-200">
                            {change}
                        </span>
                    )}
                    <span className="text-slate-400">vs last period</span>
                </div>
            )}
        </div>
    );
}

// 2. ChartCard
export function ChartCard({ title, subtitle, action, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-shadow duration-200 hover:shadow-md ${className}`}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
                    {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div>{children}</div>
        </div>
    );
}

// 3. DataTable
export function DataTable({ columns, data, searchPlaceholder = "Filter records...", pageSize = 5 }) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);

    const filteredData = React.useMemo(() => {
        if (!searchTerm) return data || [];
        return (data || []).filter((row) =>
            Object.values(row).some(
                (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    const paginatedData = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <div className="text-xs text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{filteredData.length}</span> entries
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-4 py-3.5">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                                    {columns.map((col, cIdx) => (
                                        <td key={cIdx} className="px-4 py-3 text-slate-700 font-medium">
                                            {col.cell ? col.cell(row) : row[col.accessorKey]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                                    No records found matching query
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-1.5">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// 4. AIInsightCard
export function AIInsightCard({ title, category, priority = 'Medium', recommendation, reason, impact, confidence, species, habitat }) {
    const priorityStyles = {
        Critical: 'bg-rose-100 text-rose-800 border-rose-200 ring-rose-500/20',
        High: 'bg-amber-100 text-amber-800 border-amber-200 ring-amber-500/20',
        Medium: 'bg-sky-100 text-sky-800 border-sky-200 ring-sky-500/20',
        Low: 'bg-emerald-100 text-emerald-800 border-emerald-200 ring-emerald-500/20',
    };

    const badgeStyle = priorityStyles[priority] || priorityStyles.Medium;

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Sparkles className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{category || 'AI Recommendation'}</span>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${badgeStyle}`}>
                    {priority} Priority
                </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-2">{title}</h4>

            {recommendation && (
                <div className="mb-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 mb-1">Recommendation:</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{recommendation}</p>
                </div>
            )}

            {reason && (
                <div className="mb-2 text-xs text-slate-600">
                    <strong className="text-slate-700">Rationale: </strong>{reason}
                </div>
            )}

            {impact && (
                <div className="mb-3 text-xs text-slate-600">
                    <strong className="text-slate-700">Expected Impact: </strong>{impact}
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center gap-2">
                    {species && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">{species}</span>}
                    {habitat && <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 border border-teal-200/60">{habitat}</span>}
                </div>
                {confidence && (
                    <span className="text-[11px] font-medium text-slate-500">
                        Confidence: <strong className="text-emerald-600">{(confidence * 100).toFixed(0)}%</strong>
                    </span>
                )}
            </div>
        </div>
    );
}

// 5. LoadingState
export function LoadingState({ message = "Processing AI models & data..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-xs">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">{message}</p>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-pulse" />
            </div>
        </div>
    );
}

// 6. EmptyState
export function EmptyState({ icon: Icon = Info, title = "No data available", message = "Upload images/audio or seed data to view intelligence insights.", action }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-xs mb-3">
                <Icon className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">{title}</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
