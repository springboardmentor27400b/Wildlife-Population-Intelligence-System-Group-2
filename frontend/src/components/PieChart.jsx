export default function PieChart({ data }) {
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-800">Species distribution</h3>
            <div className="mt-4 space-y-2">
                {data.map((item) => (
                    <div key={item.name}>
                        <div className="flex justify-between text-sm text-slate-700">
                            <span>{item.name}</span>
                            <span>{item.value}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${(item.value / total) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
