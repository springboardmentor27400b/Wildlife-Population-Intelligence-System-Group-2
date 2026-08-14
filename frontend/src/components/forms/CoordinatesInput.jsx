import React from 'react';
import FormField from './FormField';

export const CoordinatesInput = ({
  latRegister,
  lonRegister,
  latError,
  lonError,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full ${className}`}>
      <FormField
        label="Latitude (-90 to 90)"
        type="number"
        step="any"
        error={latError}
        placeholder="e.g. 23.45678"
        {...latRegister}
      />
      <FormField
        label="Longitude (-180 to 180)"
        type="number"
        step="any"
        error={lonError}
        placeholder="e.g. 80.12345"
        {...lonRegister}
      />
    </div>
  );
};
export default CoordinatesInput;
