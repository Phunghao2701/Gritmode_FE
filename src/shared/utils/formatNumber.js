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
 * Truncate long string
 */
export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}
