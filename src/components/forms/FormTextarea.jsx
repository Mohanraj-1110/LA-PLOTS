import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

export const FormTextarea = forwardRef(function FormTextarea(
  {
    label,
    error,
    helperText,
    required = false,
    className = '',
    id,
    rows = 3,
    ...props
  },
  ref
) {
  const areaId = id || (label ? `area-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={areaId} className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        className={`w-full p-3 bg-white text-slate-900 border text-sm rounded-xl transition-all shadow-2xs placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-none ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
        }`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] font-medium text-rose-600 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

FormTextarea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  rows: PropTypes.number,
};
