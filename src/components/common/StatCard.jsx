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
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300',
      accent: 'text-emerald-600',
    },
    green: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300',
      accent: 'text-emerald-600',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-300',
      accent: 'text-blue-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-300',
      accent: 'text-amber-600',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'hover:border-purple-300',
      accent: 'text-purple-600',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-300',
      accent: 'text-rose-600',
    },
    red: {
      bg: 'bg-red-50 text-red-600',
      border: 'hover:border-red-300',
      accent: 'text-red-600',
    },
    slate: {
      bg: 'bg-slate-100 text-slate-600',
      border: 'hover:border-slate-300',
      accent: 'text-slate-600',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 group ${
        onClick ? 'cursor-pointer' : ''
      } ${scheme.border} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate">
            {displayTitle}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight leading-none mb-1">
            {value}
          </h3>
          {displaySubtitle && (
            <p className="text-xs text-slate-500 mt-1 truncate">{displaySubtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold px-1.5 py-0.5 rounded-md ${
              Number(trend) > 0
                ? 'bg-emerald-50 text-emerald-700'
                : Number(trend) < 0
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {Number(trend) > 0 ? `+${trend}%` : `${trend}%`}
          </span>
          <span className="text-slate-400 font-normal">{trendLabel}</span>
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
