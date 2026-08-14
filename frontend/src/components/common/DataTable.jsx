import React from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  actionText,
  onActionClick
}) => {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        actionText={actionText}
        onActionClick={onActionClick}
      />
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-forest-800 text-left text-sm">
        <thead className="bg-slate-50 dark:bg-forest-950/40 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-6 py-3.5 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-forest-900 divide-y divide-slate-100 dark:divide-forest-850 text-slate-700 dark:text-slate-200">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-slate-50/50 dark:hover:bg-forest-850/30 transition-colors"
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default DataTable;
