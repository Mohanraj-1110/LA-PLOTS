/**
 * Date helper utilities for LA PLOTS
 */

/**
 * Formats an ISO date string or Date object to DD/MM/YYYY
 * @param {string|Date} dateVal
 * @returns {string} e.g. "18/09/2026"
 */
export function formatDate(dateVal) {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats date to a human readable format e.g. "18 Sep, 2026"
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatMediumDate(dateVal) {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats date and time e.g. "18 Sep 2026, 11:30 AM"
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatDateTime(dateVal) {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns a friendly relative time like "2 hours ago", "Yesterday", "In 3 days"
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatRelativeTime(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffDay === 0) {
    if (Math.abs(diffHour) < 1) {
      if (Math.abs(diffMin) < 1) return 'Just now';
      return diffMin > 0 ? `In ${diffMin} min` : `${Math.abs(diffMin)}m ago`;
    }
    return diffHour > 0 ? `In ${diffHour}h` : `${Math.abs(diffHour)}h ago`;
  }

  if (diffDay === 1) return 'Tomorrow';
  if (diffDay === -1) return 'Yesterday';

  if (diffDay > 1 && diffDay < 30) return `In ${diffDay} days`;
  if (diffDay < -1 && diffDay > -30) return `${Math.abs(diffDay)} days ago`;

  return formatMediumDate(dateVal);
}

/**
 * Checks if a given date is today
 * @param {string|Date} dateVal
 * @returns {boolean}
 */
export function isToday(dateVal) {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/**
 * Checks if date is in the future
 * @param {string|Date} dateVal
 * @returns {boolean}
 */
export function isFuture(dateVal) {
  if (!dateVal) return false;
  return new Date(dateVal).getTime() > Date.now();
}
