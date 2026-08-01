import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DailyTrendChart({ data }) {
    if (!data || data.length === 0) {
        return <div className="text-slate-400 flex h-64 items-center justify-center font-medium">No daily detection data available</div>;
    }

    const chartData = data.map(item => ({
        date: item.date || item.day || 'N/A',
        detections: item.detections !== undefined ? item.detections : (item.count !== undefined ? item.count : 0)
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [value, 'Detections']}
                    />
                    <Bar dataKey="detections" fill="#0284c7" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={index % 2 === 0 ? '#0284c7' : '#0369a1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
