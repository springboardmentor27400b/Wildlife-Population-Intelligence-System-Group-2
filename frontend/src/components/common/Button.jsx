import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-forest-800 dark:hover:bg-forest-700 dark:text-slate-200 border border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-transparent',
    outline: 'bg-transparent border border-slate-300 hover:bg-slate-100 text-slate-700 dark:border-forest-700 dark:text-slate-300 dark:hover:bg-forest-900'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && Icon && <Icon className="w-4 h-4 mr-1.5" />}
      {children}
    </button>
  );
};
export default Button;
