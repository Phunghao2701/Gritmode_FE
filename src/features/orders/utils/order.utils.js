/**
 * Order Domain Utilities
 * Provides status mappings, labels, and cancellation eligibility rules.
 */

export const ORDER_STATUS_MAP = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  shipping: {
    label: 'Đang giao hàng',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  completed: {
    label: 'Giao thành công',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
};

export const PAYMENT_STATUS_MAP = {
  pending: {
    label: 'Chờ thanh toán',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  paid: {
    label: 'Đã thanh toán',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  expired: {
    label: 'Hết hạn',
    color: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  },
  failed: {
    label: 'Thất bại',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  },
};

export const getOrderStatusInfo = (status) => {
  const normalized = String(status || '').toLowerCase();
  return (
    ORDER_STATUS_MAP[normalized] || {
      label: status || 'Không xác định',
      color: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
    }
  );
};

export const getPaymentStatusInfo = (status, paymentMethod = '') => {
  const normalized = String(status || '').toLowerCase();
  if (PAYMENT_STATUS_MAP[normalized]) {
    return PAYMENT_STATUS_MAP[normalized];
  }
  if (!status || status === 'null' || status === 'undefined' || normalized === 'unknown') {
    if (String(paymentMethod).toLowerCase() === 'cod') {
      return {
        label: 'Chờ thanh toán khi nhận',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    }
    return {
      label: 'Chờ thanh toán',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    };
  }
  return {
    label: status,
    color: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  };
};

/**
 * Checks if order is eligible for self-cancellation (Customer)
 * @param {string} orderStatus
 * @param {string} paymentStatus
 * @returns {boolean}
 */
export const isOrderCancellable = (orderStatus, paymentStatus) => {
  const normOrderStatus = String(orderStatus || '').toLowerCase();
  const normPaymentStatus = String(paymentStatus || '').toLowerCase();

  // Only pending and confirmed orders can be cancelled by user
  if (!['pending', 'confirmed'].includes(normOrderStatus)) {
    return false;
  }

  // If payment has already completed (paid), self-cancellation is restricted
  if (normPaymentStatus === 'paid') {
    return false;
  }

  return true;
};

/**
 * Determines allowed Admin transition actions based on status
 * @param {string} orderStatus
 * @param {string} paymentMethod
 * @param {string} paymentStatus
 * @returns {Array<'confirm'|'processing'|'shipping'|'complete'|'cancel'>}
 */
export const getAllowedAdminOrderActions = (orderStatus, paymentMethod, paymentStatus) => {
  const status = String(orderStatus || '').toLowerCase();
  const method = String(paymentMethod || '').toLowerCase();
  const payStatus = String(paymentStatus || '').toLowerCase();

  switch (status) {
    case 'pending': {
      const actions = ['cancel'];
      // Can confirm if COD or if payOS is paid
      if (method === 'cod' || payStatus === 'paid') {
        actions.unshift('confirm');
      }
      return actions;
    }
    case 'confirmed':
      return ['processing', 'cancel'];
    case 'processing':
      return ['shipping', 'cancel'];
    case 'shipping':
      return ['complete'];
    default:
      return [];
  }
};
