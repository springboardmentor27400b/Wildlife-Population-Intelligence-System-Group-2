import React from 'react';

const SkeletonLoader = ({ type = 'card' }) => {
  const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
  );

  if (type === 'kpi') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden h-[160px]">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100"></div>
          <div className="w-16 h-6 rounded-full bg-gray-100"></div>
        </div>
        <div className="w-24 h-4 bg-gray-100 rounded mb-3"></div>
        <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
        <div className="w-32 h-3 bg-gray-100 rounded"></div>
        <Shimmer />
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden h-[400px] flex flex-col">
        <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
        <div className="w-64 h-4 bg-gray-100 rounded mb-8"></div>
        <div className="flex-1 w-full bg-gray-50 rounded-xl border border-gray-100 flex items-end p-4 gap-2">
          {/* Simulated bars for chart skeleton */}
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 bg-gray-200 rounded-t-md" style={{ height: `${(i % 3) * 20 + 30}%` }}></div>
          ))}
        </div>
        <Shimmer />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
          <div className="w-64 h-4 bg-gray-100 rounded"></div>
        </div>
        <div className="p-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-full bg-gray-100"></div>
              <div className="flex-1">
                <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-48 h-3 bg-gray-100 rounded"></div>
              </div>
              <div className="w-24 h-6 bg-gray-100 rounded-full"></div>
            </div>
          ))}
        </div>
        <Shimmer />
      </div>
    );
  }

  // Default card variant
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="w-1/3 h-6 bg-gray-200 rounded mb-4"></div>
      <div className="w-full h-4 bg-gray-100 rounded mb-2"></div>
      <div className="w-5/6 h-4 bg-gray-100 rounded mb-2"></div>
      <div className="w-4/6 h-4 bg-gray-100 rounded"></div>
      <Shimmer />
    </div>
  );
};

export default SkeletonLoader;


