/**
 * Formats a number as Indian Currency (INR / ₹) with proper Indian numbering grouping.
 * @param {number|string} amount
 * @param {boolean} [showSymbol=true]
 * @returns {string} e.g. "₹24,50,000"
 */
export function formatCurrency(amount, showSymbol = true) {
  const num = Number(amount);
  if (isNaN(num)) return showSymbol ? '₹0' : '0';

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = absNum.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return `${isNegative ? '-' : ''}${showSymbol ? '₹' : ''}${formatted}`;
}

/**
 * Formats a number in compact Indian real-estate notation (Lakhs / Crores).
 * @param {number|string} amount
 * @param {boolean} [showSymbol=true]
 * @returns {string} e.g. "₹24.5 L" or "₹1.45 Cr"
 */
export function formatCompactCurrency(amount, showSymbol = true) {
  const num = Number(amount);
  if (isNaN(num)) return showSymbol ? '₹0' : '0';

  const isNegative = num < 0;
  const abs = Math.abs(num);
  const symbol = showSymbol ? '₹' : '';

  if (abs >= 10000000) {
    const cr = (abs / 10000000).toFixed(2);
    return `${isNegative ? '-' : ''}${symbol}${cr} Cr`;
  }
  if (abs >= 100000) {
    const lk = (abs / 100000).toFixed(2);
    return `${isNegative ? '-' : ''}${symbol}${lk} L`;
  }
  if (abs >= 1000) {
    const k = (abs / 1000).toFixed(1);
    return `${isNegative ? '-' : ''}${symbol}${k} K`;
  }

  return `${isNegative ? '-' : ''}${symbol}${abs}`;
}

/**
 * Formats rate per square foot.
 * @param {number|string} rate
 * @returns {string} e.g. "₹2,400 / sq.ft"
 */
export function formatRatePerSqft(rate) {
  const num = Number(rate);
  if (isNaN(num)) return '₹0 / sq.ft';
  return `${formatCurrency(num)} / sq.ft`;
}

/**
 * Formats square footage with standard units.
 * @param {number|string} sqft
 * @returns {string} e.g. "1,200 sq.ft"
 */
export function formatSqft(sqft) {
  const num = Number(sqft);
  if (isNaN(num)) return '0 sq.ft';
  return `${num.toLocaleString('en-IN')} sq.ft`;
}
