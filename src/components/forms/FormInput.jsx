import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

export const FormInput = forwardRef(function FormInput(
  {
    label,
    error,
    helperText,
    icon: Icon,
    suffix,
    prefix,
    required = false,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500">
            {prefix}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full py-2.5 bg-white text-slate-900 border text-sm rounded-xl transition-all shadow-2xs placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-10' : prefix ? 'pl-8' : 'pl-3.5'
          } ${suffix ? 'pr-12' : 'pr-3.5'} ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
          }`}
          {...props}
        />

        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
            {suffix}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-rose-600 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

FormInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.elementType,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  type: PropTypes.string,
};
