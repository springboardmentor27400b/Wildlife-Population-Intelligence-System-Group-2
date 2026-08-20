import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
    'Least Concern': '#10b981', // Green
    'Near Threatened': '#3b82f6', // Blue
    'Vulnerable': '#f59e0b', // Yellow
    'Endangered': '#f97316', // Orange
    'Critically Endangered': '#ef4444', // Red
    'Unknown': '#64748b' // Gray
};

export default function ConservationChart({ data }) {
    if (!data || data.length === 0) return <div className="text-gray-500 flex h-full items-center justify-center">No data available</div>;

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="count"
                        nameKey="status"
                    >
                        {data.map((entry, index) => {
                            // Extract just the status name if it has (LC) appended
                            let key = entry.status;
                            if (key.includes('(')) key = key.split('(')[0].strip();
                            return <Cell key={`cell-${index}`} fill={STATUS_COLORS[key] || STATUS_COLORS['Unknown']} />;
                        })}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
