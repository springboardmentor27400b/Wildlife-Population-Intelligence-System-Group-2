import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-emerald-600 border-r-transparent border-b-transparent border-l-transparent border-slate-200 dark:border-forest-800 ${sizes[size]}`}
      />
    </div>
  );
};
export default Spinner;
