import React from 'react';
import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';

export function FloatingActionButton({ onClick, ariaLabel = 'Add New', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`fab-button fixed bottom-20 right-5 z-40 lg:hidden w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer ring-4 ring-white ${className}`}
    >
      <Plus className="w-6 h-6 stroke-[2.5]" />
    </button>
  );
}

FloatingActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
};
