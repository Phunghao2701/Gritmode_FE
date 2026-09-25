/**
 * shared/utils/formatNumber.js
 * Helper formatters dùng chung cho toàn hệ thống.
 */

/**
 * Format large number with K/M suffix
 * @param {number} n
 * @returns {string}  e.g. 1200 → "1.2K", 1500000 → "1.5M"
 */
export function formatCount(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/**
 * Format growth delta with sign
 * @param {number} delta
 * @returns {string}  e.g. 5 → "+5", -3 → "-3", 0 → "—"
 */
export function formatGrowth(delta) {
  if (delta == null || isNaN(delta)) return '—';
  if (delta > 0) return `+${formatCount(delta)}`;
  if (delta < 0) return `${formatCount(delta)}`;
  return '—';
}

/**
 * Formats numeric price into VND currency string
 * @param {number|string} amount
 * @returns {string} e.g. "550.000 ₫"
 */
export function formatPriceVND(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
}

