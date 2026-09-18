import React from 'react';
import PropTypes from 'prop-types';

export function LoadingSpinner({ text = 'Loading data...', message, className = '' }) {
  const displayText = message || text;
  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`} role="status">
      <div className="relative mb-3">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
        <div
          className="absolute inset-0 w-10 h-10 rounded-full border-4 border-transparent border-b-amber-400 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
      </div>
      <p className="text-xs font-semibold text-slate-500 tracking-wide">{displayText}</p>
    </div>
  );
}

LoadingSpinner.propTypes = {
  text: PropTypes.string,
  message: PropTypes.string,
  className: PropTypes.string,
};

export const LoadingState = LoadingSpinner;

export function SkeletonCard({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card animate-pulse space-y-4"
        >
          <div className="h-40 bg-slate-100 rounded-xl w-full" />
          <div className="flex justify-between items-center">
            <div className="h-5 bg-slate-100 rounded w-1/3" />
            <div className="h-5 bg-slate-100 rounded-full w-1/4" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-100 rounded w-3/4" />
            <div className="h-3.5 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between">
            <div className="h-6 bg-slate-100 rounded w-1/3" />
            <div className="h-6 bg-slate-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

SkeletonCard.propTypes = {
  count: PropTypes.number,
};

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 animate-pulse space-y-3">
      <div className="h-10 bg-slate-100 rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-50 rounded-lg w-full" />
      ))}
    </div>
  );
}

SkeletonTable.propTypes = {
  rows: PropTypes.number,
};

export default LoadingSpinner;
