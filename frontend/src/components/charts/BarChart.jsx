import React from 'react';

export const BarChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400 dark:text-slate-500">
        No chart data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-4">
      {data.map((item, idx) => {
        const percentage = (item.count / maxVal) * 100;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="truncate max-w-[80%]">{item.species}</span>
              <span>{item.count}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-forest-850 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${percentage}%` }}
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default BarChart;
