export default function TopSpeciesTable({ data }) {
    if (!data || data.length === 0) return <div className="text-gray-500 py-4 text-center">No data available</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="px-4 py-3 font-semibold rounded-tl-lg">Rank</th>
                        <th className="px-4 py-3 font-semibold">Species</th>
                        <th className="px-4 py-3 font-semibold">Scientific Name</th>
                        <th className="px-4 py-3 font-semibold text-right">Detections</th>
                        <th className="px-4 py-3 font-semibold text-right">Confidence</th>
                        <th className="px-4 py-3 font-semibold rounded-tr-lg">Last Detected</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item) => (
                        <tr key={item.rank} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900">#{item.rank}</td>
                            <td className="px-4 py-3 font-medium text-violet-700">{item.species}</td>
                            <td className="px-4 py-3 italic text-gray-500">{item.scientific_name}</td>
                            <td className="px-4 py-3 text-right font-medium">{item.detections}</td>
                            <td className="px-4 py-3 text-right">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.average_confidence >= 0.9 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {(item.average_confidence * 100).toFixed(1)}%
                                </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{item.last_detected}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
