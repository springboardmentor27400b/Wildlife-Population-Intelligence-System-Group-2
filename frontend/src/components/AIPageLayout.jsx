import React from 'react';

export default function AIPageLayout({ title, description, children }) {
  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Clean Page Title */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
