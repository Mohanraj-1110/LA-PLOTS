import React from 'react';
import PropTypes from 'prop-types';
import { PackageOpen, Plus } from 'lucide-react';

export function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  icon: Icon = PackageOpen,
  action,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-card ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-primary-600" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {action && <div>{action}</div>}
      
      {!action && actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  action: PropTypes.node,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export default EmptyState;
