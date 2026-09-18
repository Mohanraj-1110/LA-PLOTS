import React from 'react';
import PropTypes from 'prop-types';

const STATUS_CONFIGS = {
  // Plot statuses
  available: {
    label: 'Available',
    bg: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/60',
    dot: 'bg-emerald-500',
  },
  reserved: {
    label: 'Reserved',
    bg: 'bg-amber-100/90 text-amber-800 border-amber-300/60',
    dot: 'bg-amber-500',
  },
  sold: {
    label: 'Sold',
    bg: 'bg-rose-100/90 text-rose-800 border-rose-300/60',
    dot: 'bg-rose-500',
  },
  blocked: {
    label: 'Blocked',
    bg: 'bg-slate-200/90 text-slate-800 border-slate-300',
    dot: 'bg-slate-500',
  },

  // Customer / Lead statuses
  new: {
    label: 'New Lead',
    bg: 'bg-blue-100/90 text-blue-800 border-blue-300/60',
    dot: 'bg-blue-500',
  },
  interested: {
    label: 'Interested',
    bg: 'bg-teal-100/90 text-teal-800 border-teal-300/60',
    dot: 'bg-teal-500',
  },
  'site visit': {
    label: 'Site Visit',
    bg: 'bg-purple-100/90 text-purple-800 border-purple-300/60',
    dot: 'bg-purple-500',
  },
  negotiation: {
    label: 'Negotiation',
    bg: 'bg-amber-100/90 text-amber-800 border-amber-300/60',
    dot: 'bg-amber-500',
  },
  booked: {
    label: 'Booked',
    bg: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/60',
    dot: 'bg-emerald-500',
  },
  'follow-up': {
    label: 'Follow-up',
    bg: 'bg-indigo-100/90 text-indigo-800 border-indigo-300/60',
    dot: 'bg-indigo-500',
  },
  converted: {
    label: 'Converted',
    bg: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/60',
    dot: 'bg-emerald-500',
  },
  lost: {
    label: 'Lost',
    bg: 'bg-slate-100 text-slate-600 border-slate-300',
    dot: 'bg-slate-400',
  },

  // Appointment statuses
  upcoming: {
    label: 'Upcoming',
    bg: 'bg-blue-100 text-blue-800 border-blue-300/60',
    dot: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300/60',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-100 text-rose-800 border-rose-300/60',
    dot: 'bg-rose-500',
  },
  rescheduled: {
    label: 'Rescheduled',
    bg: 'bg-amber-100 text-amber-800 border-amber-300/60',
    dot: 'bg-amber-500',
  },

  // Payment statuses
  partial: {
    label: 'Partial Payment',
    bg: 'bg-amber-100 text-amber-800 border-amber-300/60',
    dot: 'bg-amber-500',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-rose-100 text-rose-800 border-rose-300/60',
    dot: 'bg-rose-500',
  },
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300/60',
    dot: 'bg-emerald-500',
  },

  // Roles
  admin: {
    label: 'Admin',
    bg: 'bg-purple-100 text-purple-800 border-purple-300/60',
    dot: 'bg-purple-500',
  },
  agent: {
    label: 'Agent',
    bg: 'bg-blue-100 text-blue-800 border-blue-300/60',
    dot: 'bg-blue-500',
  },
  customer: {
    label: 'Customer',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300/60',
    dot: 'bg-emerald-500',
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
