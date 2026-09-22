import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function PageHeader({
  title,
  subtitle,
  description,
  badge,
  breadcrumbs = [],
  action,
  actions,
  className = '',
}) {
  const displaySubtitle = subtitle || description;
  const displayActions = actions || action;

  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 ${className}`}>
      <div className="min-w-0 flex-1">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-2" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label || idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[120px] sm:max-w-none"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[150px] sm:max-w-none">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-display">
            {title}
          </h1>
          {badge && <div>{badge}</div>}
        </div>

        {displaySubtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {displaySubtitle}
          </p>
        )}
      </div>

      {displayActions && (
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          {displayActions}
        </div>
      )}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  badge: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
    })
  ),
  action: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
};

export default PageHeader;
