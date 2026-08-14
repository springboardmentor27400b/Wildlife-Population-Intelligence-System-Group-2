import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`relative rounded-md shadow-sm w-full max-w-xs ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-forest-800 rounded-lg bg-white dark:bg-forest-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
        placeholder={placeholder}
      />
    </div>
  );
};
export default SearchBar;
