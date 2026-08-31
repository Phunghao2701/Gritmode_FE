/**
 * Payment Domain Utilities
 * Provides countdown timers, payment status labels, and method info.
 */

export const formatCountdown = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const calculateRemainingSeconds = (expiredAt) => {
  if (!expiredAt) return 0;
  const expiryTime = new Date(expiredAt).getTime();
  const now = Date.now();
  const diffMs = expiryTime - now;
  return Math.max(0, Math.floor(diffMs / 1000));
};

export const PAYMENT_METHODS = {
  cod: {
    id: 'cod',
    name: 'COD',
    title: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán tiền mặt cho shipper khi nhận kiện hàng.',
    icon: 'solar:hand-money-linear',
  },
  payos: {
    id: 'payos',
    name: 'payOS',
    title: 'Chuyển khoản VietQR tức thì (payOS)',
    description: 'Quét mã VietQR thanh toán nhanh qua ứng dụng ngân hàng.',
    icon: 'solar:qr-code-linear',
  },
};

export const getPaymentMethodInfo = (method) => {
  const normalized = String(method || '').toLowerCase();
  return (
    PAYMENT_METHODS[normalized] || {
      id: normalized,
      name: method || 'Khác',
      title: method || 'Phương thức thanh toán',
      icon: 'solar:card-2-linear',
    }
  );
};
