import React from 'react';

export const SelectField = React.forwardRef(({
  label,
  name,
  options = [],
  error,
  placeholder = 'Select an option',
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
      <select
        ref={ref}
        name={name}
        id={name}
        className={`block w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-forest-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 ${
          error
            ? 'border-rose-450 focus:ring-rose-500 focus:border-rose-500'
            : 'border-slate-300 dark:border-forest-800 focus:ring-emerald-500 focus:border-emerald-500'
        }`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt, idx) => (
          <option
            key={idx}
            value={opt.value !== undefined ? opt.value : opt}
          >
            {opt.label !== undefined ? opt.label : opt}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-rose-500 font-medium">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

SelectField.displayName = 'SelectField';
export default SelectField;
