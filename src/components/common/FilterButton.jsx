import React from 'react';
import PropTypes from 'prop-types';

export function FilterButton({
  active = false,
  label = 'Filter',
  count,
  onClick,
  icon: Icon,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
        active
          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-sm shadow-primary-600/20 ring-2 ring-primary-500/30'
          : 'bg-white text-surface-600 hover:text-surface-900 border border-surface-200 hover:border-surface-300 hover:bg-surface-50 shadow-xs'
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            active ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-600'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

FilterButton.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string.isRequired,
  count: PropTypes.number,
  onClick: PropTypes.func,
  icon: PropTypes.elementType,
  className: PropTypes.string,
};

export default FilterButton;
