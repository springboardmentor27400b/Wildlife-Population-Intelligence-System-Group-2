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

export default function SpeciesCard({ species, confidence, scientificName }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-lg font-semibold text-slate-800">{species}</div>
            <div className="mt-1 text-sm text-slate-600">{scientificName}</div>
            <div className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-700">Confidence {formatConfidence(confidence)}</div>
        </div>
    );
}
