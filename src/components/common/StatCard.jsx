import React from 'react';
import PropTypes from 'prop-types';
import { FileText } from 'lucide-react';

export function StatCard({
  title,
  label,
  value,
  subtitle,
  detail,
  icon: Icon = FileText,
  trend,
  trendLabel = 'vs last month',
  color = 'emerald',
  onClick,
  className = '',
}) {
  const displayTitle = title || label;
  const displaySubtitle = subtitle || detail;

  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-500/40',
      accent: 'text-emerald-600 dark:text-emerald-400',
      topBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-500/40',
      accent: 'text-emerald-600 dark:text-emerald-400',
      topBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-500/40',
      accent: 'text-indigo-600 dark:text-indigo-400',
      topBar: 'bg-gradient-to-r from-indigo-500 to-blue-500',
      glow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.18)]',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-300 dark:hover:border-blue-500/40',
      accent: 'text-blue-600 dark:text-blue-400',
      topBar: 'bg-gradient-to-r from-blue-500 to-cyan-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.18)]',
    },
    cyan: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
      border: 'hover:border-cyan-300 dark:hover:border-cyan-500/40',
      accent: 'text-cyan-600 dark:text-cyan-400',
      topBar: 'bg-gradient-to-r from-cyan-500 to-teal-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.18)]',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-500/40',
      accent: 'text-amber-600 dark:text-amber-400',
      topBar: 'bg-gradient-to-r from-amber-500 to-orange-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.18)]',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-500/40',
      accent: 'text-purple-600 dark:text-purple-400',
      topBar: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      glow: 'group-hover:shadow-[0_0_20px_rgba(139,92,246,0.18)]',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-500/40',
      accent: 'text-rose-600 dark:text-rose-400',
      topBar: 'bg-gradient-to-r from-rose-500 to-pink-500',
      glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.18)]',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400',
      border: 'hover:border-red-300 dark:hover:border-red-500/40',
      accent: 'text-red-600 dark:text-red-400',
      topBar: 'bg-gradient-to-r from-red-500 to-rose-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(239,68,68,0.18)]',
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      border: 'hover:border-slate-300 dark:hover:border-slate-700',
      accent: 'text-slate-600 dark:text-slate-300',
      topBar: 'bg-gradient-to-r from-slate-400 to-slate-500',
      glow: 'group-hover:shadow-[0_0_20px_rgba(148,163,184,0.15)]',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all duration-300 group overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${scheme.border} ${scheme.glow} ${className}`}
    >
      {/* Top subtle color indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.topBar} opacity-80 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 truncate">
            {displayTitle}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-none mb-1">
            {value}
          </h3>
          {displaySubtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{displaySubtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold px-2 py-0.5 rounded-lg ${
              Number(trend) > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                : Number(trend) < 0
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {Number(trend) > 0 ? `+${trend}%` : `${trend}%`}
          </span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  detail: PropTypes.string,
  icon: PropTypes.elementType,
  trend: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  trendLabel: PropTypes.string,
  color: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default StatCard;
