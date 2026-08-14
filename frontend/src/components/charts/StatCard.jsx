import React from 'react';
import Card from '../common/Card';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  loading = false,
  className = ''
}) => {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 animate-pulse bg-slate-200 dark:bg-forest-800 rounded" />
          ) : (
            <h3 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100">
              {value}
            </h3>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          {description}
        </p>
      )}
    </Card>
  );
};
export default StatCard;
