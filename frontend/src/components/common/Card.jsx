import React from 'react';

export const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 rounded-xl shadow-sm overflow-hidden ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-150' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
export default Card;
