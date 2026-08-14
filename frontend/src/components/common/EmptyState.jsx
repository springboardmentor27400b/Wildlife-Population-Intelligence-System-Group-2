import React from 'react';
import { Leaf } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  title = 'No records found',
  message = 'Get started by creating a new entry.',
  actionText,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-slate-100 dark:bg-forest-850 p-4 rounded-full mb-4 text-slate-400 dark:text-slate-500">
        <Leaf className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 font-outfit">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
        {message}
      </p>
      {actionText && onActionClick && (
        <Button variant="primary" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
