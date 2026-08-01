import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonthlyTrendChart({ data }) {
    if (!data || data.length === 0) {
        return <div className="text-slate-400 flex h-64 items-center justify-center font-medium">No monthly detection data available</div>;
    }

    const chartData = data.map(item => ({
        month: item.month || item.month_code || 'N/A',
        detections: item.detections !== undefined ? item.detections : (item.count !== undefined ? item.count : 0)
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.7}/>
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [value, 'Total Detections']}
                    />
                    <Area type="monotone" dataKey="detections" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#monthlyGradient)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
