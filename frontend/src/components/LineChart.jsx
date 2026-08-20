export default function LineChart({ data }) {
    const points = data.map((item, index) => `${index * 60},${100 - item.value * 10}`).join(' ');
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-800">Monthly trend</h3>
            <svg viewBox="0 0 240 100" className="mt-4 h-40 w-full">
                <line x1="0" x2="240" y1="100" y2="100" stroke="#cbd5e1" />
                <polyline fill="none" stroke="#059669" strokeWidth="3" points={points} />
            </svg>
        </div>
    );
}
