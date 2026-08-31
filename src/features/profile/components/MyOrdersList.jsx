import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Icon from '../../../shared/components/Icon';
import { useMyOrders, useCancelOrder } from '../../orders/hooks/useOrders';
import { getOrderStatusInfo, getPaymentStatusInfo, isOrderCancellable } from '../../orders/utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';
import OrderDetailModal from '../../orders/components/OrderDetailModal';

export default function MyOrdersList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { orders, total, totalPages, isLoadingOrders } = useMyOrders({
    page,
    limit: 10,
    status_order: statusFilter || undefined,
  });

  const cancelMutation = useCancelOrder();

  const tabs = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'completed', label: 'Hoàn tất' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  const handleTabChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      cancelMutation.mutate(orderId, {
        onSuccess: () => {
          setSelectedOrder(null);
        },
      });
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-black text-xl text-black dark:text-white uppercase tracking-tight">
            Lịch sử đơn hàng ({total})
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Danh sách các đơn hàng đã đặt tại Gritmode</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoadingOrders ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((n) => (
            <LoadingSkeleton key={n} height="60px" className="rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-8">
          <EmptyState
            title="Chưa có đơn hàng nào"
            description="Bạn chưa có đơn đặt hàng nào trong mục này. Khám phá các mẫu Streetwear mới nhất ngay!"
            icon="solar:bag-smile-linear"
            actionLabel="Mua sắm ngay"
            onAction={() => navigate('/products')}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="pb-3 font-black">Mã đơn</th>
                  <th className="pb-3 font-black">Ngày đặt</th>
                  <th className="pb-3 font-black">Tổng thanh toán</th>
                  <th className="pb-3 font-black">Thanh toán</th>
                  <th className="pb-3 font-black text-center">Trạng thái</th>
                  <th className="pb-3 font-black text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {orders.map((ord) => {
                  const orderId = ord.order_id || ord.id;
                  const orderStatus = getOrderStatusInfo(ord.status_order);
                  const paymentStatus = getPaymentStatusInfo(ord.payment?.status_payment);
                  const cancellable = isOrderCancellable(ord.status_order, ord.payment?.status_payment);

                  return (
                    <tr key={orderId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-4 font-mono font-black text-black dark:text-white uppercase">
                        {ord.order_code || `#ORD-${orderId}`}
                      </td>
                      <td className="py-4 text-neutral-400">
                        {new Date(ord.created_at || Date.now()).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 font-black text-black dark:text-white">
                        {formatPriceVND(ord.total_order || ord.finalAmount)}
                      </td>
                      <td className="py-4">
                        <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${paymentStatus.color}`}>
                          {ord.payment?.payment_method?.toUpperCase() || 'COD'}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${orderStatus.color}`}>
                          {orderStatus.label}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-700 dark:text-neutral-300 font-bold transition-all cursor-pointer text-[11px]"
                          >
                            Chi tiết
                          </button>
                          {cancellable && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(orderId)}
                              disabled={cancelMutation.isPending}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold transition-all cursor-pointer text-[11px] disabled:opacity-40"
                              title="Hủy đơn"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800 select-none">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-300 disabled:opacity-30 cursor-pointer"
              >
                Trước
              </button>
              <span className="text-xs font-bold text-neutral-500 px-2">
                Trang {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-300 disabled:opacity-30 cursor-pointer"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onCancelOrder={handleCancelOrder}
        isCancelling={cancelMutation.isPending}
      />
    </div>
  );
}
