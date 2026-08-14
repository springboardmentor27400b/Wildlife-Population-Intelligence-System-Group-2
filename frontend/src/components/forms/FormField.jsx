import React from 'react';

export const FormField = React.forwardRef(({
  label,
  name,
  type = 'text',
  error,
  placeholder,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-350"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        name={name}
        id={name}
        type={type}
        placeholder={placeholder}
        className={`block w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-forest-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 ${
          error
            ? 'border-rose-450 focus:ring-rose-500 focus:border-rose-500'
            : 'border-slate-300 dark:border-forest-800 focus:ring-emerald-500 focus:border-emerald-500'
        }`}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-500 font-medium">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
export default FormField;
