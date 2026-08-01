import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

export default function SpeciesDistributionChart({ data }) {
    if (!data || data.length === 0) return <div className="text-gray-500 flex h-full items-center justify-center">No data available</div>;

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="species" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name) => [value, name === 'count' ? 'Detections' : 'Avg Confidence']}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="count" position="right" style={{ fill: '#6b7280', fontSize: '12px' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
