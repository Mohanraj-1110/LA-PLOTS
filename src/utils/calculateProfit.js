/**
 * Financial and area calculations for LA PLOTS
 */

/**
 * Calculates total plot price: Area (sq.ft) × Rate per sq.ft
 * @param {number|string} areaSqft
 * @param {number|string} ratePerSqft
 * @returns {number}
 */
export function calculatePlotTotal(areaSqft, ratePerSqft) {
  const area = parseFloat(areaSqft) || 0;
  const rate = parseFloat(ratePerSqft) || 0;
  return Math.round(area * rate);
}

/**
 * Calculates net profit from sale amount and cost amount
 * @param {number|string} saleAmount
 * @param {number|string} costAmount
 * @returns {number}
 */
export function calculateNetProfit(saleAmount, costAmount) {
  const sale = parseFloat(saleAmount) || 0;
  const cost = parseFloat(costAmount) || 0;
  return Math.round(sale - cost);
}

/**
 * Calculates profit margin percentage
 * @param {number|string} saleAmount
 * @param {number|string} costAmount
 * @returns {number} Percentage (e.g. 24.5)
 */
export function calculateProfitMargin(saleAmount, costAmount) {
  const sale = parseFloat(saleAmount) || 0;
  if (sale <= 0) return 0;
  const profit = calculateNetProfit(sale, costAmount);
  return parseFloat(((profit / sale) * 100).toFixed(1));
}
