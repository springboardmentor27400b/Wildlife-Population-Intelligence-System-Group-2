import React from 'react';
import { getStatusColor } from '../../utils/helpers';

export const Badge = ({ children, status, className = '' }) => {
  const colorClass = status ? getStatusColor(status) : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
};
export default Badge;
