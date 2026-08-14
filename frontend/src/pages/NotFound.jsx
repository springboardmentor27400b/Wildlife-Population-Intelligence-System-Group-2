import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-full mb-6 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900 animate-pulse">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100 mb-2">
        Access Denied or Page Not Found
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The resource you requested may have been deleted, moved, or your account role lacks the required authentication permissions to view it.
      </p>
      <Link to="/">
        <Button variant="primary">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
export default NotFound;
