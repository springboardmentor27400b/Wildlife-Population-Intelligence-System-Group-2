import React from 'react';

export const PieChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400 dark:text-slate-500">
        No chart data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const colors = [
    'stroke-emerald-500',
    'stroke-blue-500',
    'stroke-amber-500',
    'stroke-purple-500',
    'stroke-rose-500',
    'stroke-indigo-500',
  ];
  const bgColors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-indigo-500',
  ];

  // Donut values
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const segments = data.map((item, idx) => {
    const percentage = total > 0 ? (item.count / total) * 100 : 0;
    const strokeLength = (percentage / 100) * circumference;
    const strokeOffset = circumference - currentOffset;
    
    // Increment accumulated offset
    currentOffset += strokeLength;

    return {
      ...item,
      percentage,
      strokeLength,
      strokeOffset,
      colorClass: colors[idx % colors.length],
      bgColorClass: bgColors[idx % bgColors.length]
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative w-36 h-36 flex-shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            className="stroke-slate-100 dark:stroke-forest-850"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, idx) => (
            <circle
              key={idx}
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              className={`${seg.colorClass} transition-all duration-500`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={seg.strokeOffset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase">Total</span>
          <span className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100">{total}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-2">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate max-w-[80%]">
              <span className={`w-2.5 h-2.5 rounded-full ${seg.bgColorClass} flex-shrink-0`} />
              <span className="text-slate-600 dark:text-slate-350 truncate">{seg.habitat_type}</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {seg.count} ({seg.percentage.toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PieChart;
