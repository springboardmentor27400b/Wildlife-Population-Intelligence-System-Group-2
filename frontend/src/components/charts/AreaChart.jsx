import React from 'react';

export const AreaChart = ({ data = [], height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400 dark:text-slate-500">
        No chart data available
      </div>
    );
  }

  const values = data.map(d => d.count);
  const maxVal = Math.max(...values, 5);
  const totalPoints = data.length;
  
  const paddingX = 40;
  const paddingY = 20;
  const width = 500;
  const chartHeight = height - paddingY * 2;
  const chartWidth = width - paddingX * 2;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingX + (index / (totalPoints - 1 || 1)) * chartWidth;
    const y = paddingY + chartHeight - (d.count / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Construct path string
  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // Area path (closed at the bottom)
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingY + chartHeight - ratio * chartHeight;
          const label = Math.round(ratio * maxVal);
          return (
            <g key={idx} className="opacity-40">
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#e2e8f0"
                className="dark:stroke-forest-800"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                className="text-[9px] fill-slate-400 dark:fill-slate-500 font-sans"
                textAnchor="end"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaD && (
          <path
            d={areaD}
            fill="url(#area-gradient)"
            className="opacity-20"
          />
        )}

        {/* Main Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Highlight points */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#ffffff"
              stroke="#10b981"
              strokeWidth="2"
            />
            <title>{`${p.date}: ${p.count} sightings`}</title>
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((p, idx) => {
          // Render only a few labels to avoid overlap
          if (points.length > 5 && idx % 2 !== 0) return null;
          return (
            <text
              key={idx}
              x={p.x}
              y={height - 2}
              className="text-[9px] fill-slate-400 dark:fill-slate-500 font-sans"
              textAnchor="middle"
            >
              {p.date}
            </text>
          );
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
export default AreaChart;
