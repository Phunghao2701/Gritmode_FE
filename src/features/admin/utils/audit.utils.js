/**
 * Admin Audit Log Domain Utilities
 * Formats actions, entities, and diff snapshots.
 */

export const AUDIT_ACTIONS_MAP = {
  PRODUCT_CREATED: {
    label: 'Tạo sản phẩm mới',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  PRODUCT_UPDATED: {
    label: 'Cập nhật sản phẩm',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  PRODUCT_DELETED: {
    label: 'Xóa sản phẩm',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  INVENTORY_UPDATED: {
    label: 'Cập nhật tồn kho',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  ORDER_CONFIRMED: {
    label: 'Xác nhận đơn hàng',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  ORDER_PROCESSING: {
    label: 'Chuẩn bị hàng đơn',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  ORDER_SHIPPING: {
    label: 'Bàn giao giao hàng',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  ORDER_COMPLETED: {
    label: 'Hoàn tất đơn hàng',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  ORDER_CANCELLED: {
    label: 'Hủy đơn hàng',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  USER_BLOCKED: {
    label: 'Khóa tài khoản user',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  USER_UNBLOCKED: {
    label: 'Mở khóa tài khoản user',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  USER_SET_INACTIVE: {
    label: 'Vô hiệu hóa user',
    color: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  },
};

export const getAuditActionInfo = (action) => {
  const normalized = String(action || '').toUpperCase();
  return (
    AUDIT_ACTIONS_MAP[normalized] || {
      label: action || 'Hành động không xác định',
      color: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
    }
  );
};

export const formatEntityName = (entity) => {
  switch (String(entity || '').toLowerCase()) {
    case 'order':
      return 'Đơn hàng';
    case 'product':
      return 'Sản phẩm';
    case 'product_variant':
      return 'Biến thể sản phẩm';
    case 'inventory':
      return 'Tồn kho';
    case 'user':
      return 'Người dùng';
    case 'category':
      return 'Danh mục';
    case 'collection':
      return 'Bộ sưu tập';
    case 'voucher':
      return 'Mã giảm giá';
    default:
      return entity || 'Đối tượng';
  }
};
