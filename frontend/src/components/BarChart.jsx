export default function BarChart({ data }) {
    const maxValue = Math.max(...data.map((item) => item.value), 1);
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-800">Daily detections</h3>
            <div className="mt-4 flex items-end gap-3">
                {data.map((item) => (
                    <div key={item.label} className="flex-1 text-center">
                        <div className="rounded-t-xl bg-emerald-600" style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '12px' }} />
                        <div className="mt-2 text-xs text-slate-600">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
