import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const Pagination = ({
  page,
  pageSize,
  total,
  onPageChange
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  const startEntry = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-forest-800 bg-white dark:bg-forest-900">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startEntry}</span> to{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{endEntry}</span> of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span> entries
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Page {page} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
export default Pagination;
