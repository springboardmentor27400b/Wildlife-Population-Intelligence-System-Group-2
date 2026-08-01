import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ConfidenceChart({ data }) {
    if (!data || data.length === 0) {
        return <div className="text-slate-400 flex h-64 items-center justify-center font-medium">No confidence trend data available</div>;
    }

    // Standardize data keys
    const chartData = data.map(item => ({
        date: item.date || item.range || item.month || 'N/A',
        confidence: item.avg_confidence !== undefined ? item.avg_confidence : (item.confidence !== undefined ? item.confidence : (item.count || 0))
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} unit="%" />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value}%`, 'Avg AI Confidence']}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="confidence" 
                        stroke="#059669" 
                        strokeWidth={3} 
                        activeDot={{ r: 7, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }} 
                        dot={{ r: 4, fill: '#059669', strokeWidth: 1 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
