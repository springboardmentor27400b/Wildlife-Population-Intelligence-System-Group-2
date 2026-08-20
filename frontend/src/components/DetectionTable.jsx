import { formatISTDate, formatISTTime } from '../utils/dateTime';
import { resolveAssetUrl } from '../services/api';

function formatConfidence(value) {
    if (value === undefined || value === null || value === '') {
        return 'N/A';
    }
    const num = Number(String(value).replace('%', '').trim());
    if (Number.isNaN(num)) {
        return String(value);
    }
    if (num >= 0 && num <= 1) {
        return `${Math.round(num * 100)}%`;
    }
    return `${Math.round(num)}%`;
}

function getStatusBadgeClass(status) {
    if (!status) return 'bg-slate-100 text-slate-800';
    const s = status.toLowerCase();
    if (s.includes('endangered') || s.includes('critical')) return 'bg-red-100 text-red-800 border-red-200';
    if (s.includes('vulnerable')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s.includes('threatened')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
}

export default function DetectionTable({ rows = [] }) {
    const uniqueRows = [];
    const seenKeys = new Set();

    for (const row of rows) {
        const key = row.id ? `id-${row.id}` : `${row.species}-${row.created_at}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueRows.push(row);
        }
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 text-lg">Detection History & Observation Log</h3>
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-slate-700">Thumbnail</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Species</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Scientific Name</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Confidence</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Date (IST)</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Time (IST)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {uniqueRows.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                                No detection history records found. Upload an image or audio to run AI recognition.
                            </td>
                        </tr>
                    ) : (
                        uniqueRows.map((row, idx) => {
                            const dateStr = formatISTDate(row.created_at);
                            const timeStr = formatISTTime(row.created_at);
                            
                            const defaultThumb = '/api/datasets_static/species_images/default_wildlife.png';

                            
                            return (
                                <tr key={row.id ? `row-${row.id}` : `row-${idx}`} className="even:bg-slate-50 hover:bg-slate-100 transition">
                                    <td className="px-4 py-2">
                                        {row.detection_type === 'Audio' ? (
                                            <div className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded text-slate-400 text-lg border border-slate-200">
                                                🎵
                                            </div>
                                        ) : (
                                            <img 
                                                src={resolveAssetUrl(row.thumbnail) || resolveAssetUrl(defaultThumb)} 
                                                alt="thumb" 
                                                onError={(e) => { e.target.onerror = null; e.target.src = resolveAssetUrl(defaultThumb); }}
                                                className="h-10 w-10 object-cover rounded shadow-sm border border-slate-200" 
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 font-medium">
                                        {row.detection_type === 'Audio' ? (
                                            <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-xs font-semibold">Audio</span>
                                        ) : (
                                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-semibold">Image</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-emerald-800">{row.species}</td>
                                    <td className="px-4 py-3 text-slate-600 italic">{row.scientific_name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-slate-700">{formatConfidence(row.confidence)}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs font-medium">{dateStr}</td>
                                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{timeStr}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
