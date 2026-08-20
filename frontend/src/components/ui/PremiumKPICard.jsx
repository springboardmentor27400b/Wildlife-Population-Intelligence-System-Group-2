import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import AnimatedNumber from './AnimatedNumber';
import Tooltip from './tooltip';

const PremiumKPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  sparklineData, 
  colorClass = "text-green-500", 
  bgClass = "bg-green-100",
  sparklineColor = "#22c55e"
}) => {
  // Format data for Recharts if provided as a simple array of numbers
  const formattedData = sparklineData?.map((val, index) => ({ value: val, index })) || [];

  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g,"")) : value;
  const isString = typeof value === 'string';
  const prefix = isString && value.match(/^[^0-9-]/) ? value.match(/^[^0-9-]/)[0] : "";
  const suffix = isString && value.match(/[^0-9.]+$/) ? value.match(/[^0-9.]+$/)[0] : "";
  const isNumber = !isNaN(numericValue) && numericValue !== null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all relative overflow-hidden group h-full"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${bgClass} transition-colors group-hover:bg-opacity-80`}>
          {Icon && <Icon className={`w-6 h-6 ${colorClass}`} />}
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${trend > 0 ? 'bg-green-50 text-green-600' : trend < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
            {trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : trend < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 mb-2">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
          <Tooltip content={<div className="text-center"><p className="font-semibold mb-1">{title}</p><p className="text-[10px] text-gray-300">Last updated: Just now</p></div>} position="top">
            <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
          </Tooltip>
        </div>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {isNumber ? (
            <AnimatedNumber value={numericValue} prefix={prefix} suffix={suffix} />
          ) : (
            value
          )}
        </p>
        {subtitle && <p className="text-sm text-gray-400 mt-2">{subtitle}</p>}
      </div>

      {/* Mini Sparkline Chart in the background aligned to bottom */}
      {formattedData.length > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-24 opacity-20 group-hover:opacity-40 transition-opacity z-0 pointer-events-none translate-y-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={sparklineColor} 
                strokeWidth={3} 
                dot={false}
                isAnimationActive={true}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default PremiumKPICard;
