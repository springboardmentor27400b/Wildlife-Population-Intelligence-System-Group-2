import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  const elements = Array.from({ length: count });
  return (
    <>
      {elements.map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-slate-200 dark:bg-forest-800 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};
export default Skeleton;
