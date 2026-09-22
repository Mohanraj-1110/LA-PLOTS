import React from 'react';
import PropTypes from 'prop-types';

const STATUS_CONFIGS = {
  // Plot statuses
  available: {
    label: 'Available',
    bg: 'bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60 shadow-xs',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  reserved: {
    label: 'Reserved',
    bg: 'bg-amber-100/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60 shadow-xs',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  sold: {
    label: 'Sold',
    bg: 'bg-rose-100/90 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300/60 dark:border-rose-700/60 shadow-xs',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  blocked: {
    label: 'Blocked',
    bg: 'bg-slate-200/90 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    dot: 'bg-slate-500 dark:bg-slate-400',
  },

  // Customer / Lead statuses
  new: {
    label: 'New Lead',
    bg: 'bg-blue-100/90 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300/60 dark:border-blue-700/60',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  interested: {
    label: 'Interested',
    bg: 'bg-teal-100/90 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-300/60 dark:border-teal-700/60',
    dot: 'bg-teal-500 dark:bg-teal-400',
  },
  'site visit': {
    label: 'Site Visit',
    bg: 'bg-purple-100/90 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300/60 dark:border-purple-700/60',
    dot: 'bg-purple-500 dark:bg-purple-400',
  },
  negotiation: {
    label: 'Negotiation',
    bg: 'bg-amber-100/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  booked: {
    label: 'Booked',
    bg: 'bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  'follow-up': {
    label: 'Follow-up',
    bg: 'bg-indigo-100/90 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-300/60 dark:border-indigo-700/60',
    dot: 'bg-indigo-500 dark:bg-indigo-400',
  },
  converted: {
    label: 'Converted',
    bg: 'bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  lost: {
    label: 'Lost',
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },

  // Appointment statuses
  upcoming: {
    label: 'Upcoming',
    bg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300/60 dark:border-blue-700/60',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300/60 dark:border-rose-700/60',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  rescheduled: {
    label: 'Rescheduled',
    bg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },

  // Payment statuses
  partial: {
    label: 'Partial Payment',
    bg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300/60 dark:border-rose-700/60',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },

  // Roles
  admin: {
    label: 'Admin',
    bg: 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300/60 dark:border-purple-700/60',
    dot: 'bg-purple-500 dark:bg-purple-400',
  },
  agent: {
    label: 'Agent',
    bg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300/60 dark:border-blue-700/60',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  customer: {
    label: 'Customer',
    bg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
};

export function StatusBadge({ status, className = '', showDot = true }) {
  if (!status) return null;

  const raw = String(status).trim();
  const normalizedKey = raw.toLowerCase();
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: raw,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      <span>{config.label}</span>
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
  className: PropTypes.string,
  showDot: PropTypes.bool,
};

export default StatusBadge;
