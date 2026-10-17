'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Pagination from '../../../shared/components/Pagination';
import {
  useMyOrders,
  useOrderDetail,
  useCancelOrder,
  useRequestRefund,
} from '../../orders/hooks/useOrders';
import {
  getOrderStatusInfo,
  getPaymentStatusInfo,
  isOrderCancellable,
  isRefundRequestable,
} from '../../orders/utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';
import OrderDetailModal from '../../orders/components/OrderDetailModal';

export default function MyOrdersList() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {
    orders,
    total,
    isLoadingOrders,
    isErrorOrders,
    ordersError,
    refetchOrders,
  } = useMyOrders({
    page,
    limit: 10,
    status_order: statusFilter || undefined,
  });

  const {
    data: selectedOrderDetail,
    isFetching: isFetchingOrderDetail,
    isError: isOrderDetailError,
    refetch: refetchOrderDetail,
  } = useOrderDetail(selectedOrder?.order_id);

  const cancelMutation = useCancelOrder();
  const refundMutation = useRequestRefund();

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

  const handleRequestRefund = (orderId) => {
    if (!window.confirm('Bạn muốn gửi yêu cầu hoàn tiền cho đơn PayOS này?')) return;

    const reason = window.prompt('Lý do hoàn tiền (không bắt buộc):', 'Khách hàng yêu cầu hoàn tiền') || '';
    refundMutation.mutate(
      { orderId, reason: reason.trim() },
      { onSuccess: () => setSelectedOrder(null) },
    );
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-sans font-[550] text-xl text-black dark:text-white uppercase tracking-tight">
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-[550] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-[550]'
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
      ) : isErrorOrders ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 px-5 py-8 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
          <p className="font-sans text-sm font-[550] text-rose-700 dark:text-rose-300">
            Không thể tải lịch sử đơn hàng.
          </p>
          <p className="mt-1 font-sans text-xs text-rose-600/80 dark:text-rose-400/80">
            {ordersError?.response?.data?.message || 'Vui lòng thử lại sau ít phút.'}
          </p>
          <button
            type="button"
            onClick={() => refetchOrders()}
            className="mt-4 rounded-full bg-black px-4 py-2 font-sans text-xs font-[550] uppercase tracking-wider text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
          >
            Thử lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-8">
          <EmptyState
            title="Chưa có đơn hàng nào"
            description="Bạn chưa có đơn đặt hàng nào trong mục này. Khám phá các mẫu Streetwear mới nhất ngay!"
            icon="solar:bag-smile-linear"
            actionLabel="Mua sắm ngay"
            onAction={() => router.push('/products')}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. Mobile Cards View (Visible on < md) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((ord) => {
              const orderId = ord.order_id || ord.id;
              const orderStatus = getOrderStatusInfo(ord.status_order);
              const paymentMethod = ord.payment_method || ord.payment?.payment_method || 'cod';
              const rawPaymentStatus = ord.status_payment || ord.payment?.status_payment;
              const paymentStatus = getPaymentStatusInfo(rawPaymentStatus, paymentMethod);
              const cancellable = isOrderCancellable(ord.status_order, rawPaymentStatus);
              const refundRequestable = isRefundRequestable(
                ord.status_order,
                paymentMethod,
                rawPaymentStatus,
                ord.refund_status || ord.refund_request?.status_refund_request,
              );

              return (
                <div
                  key={orderId}
                  className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-[550] text-sm text-black dark:text-white uppercase">
                      {ord.order_code || `#ORD-${orderId}`}
                    </span>
                    <span className={`inline-block text-[10px] font-sans font-[550] uppercase px-2.5 py-0.5 rounded-full border ${orderStatus.color}`}>
                      {orderStatus.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{new Date(ord.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                    <span className={`text-[10px] font-sans font-[550] uppercase px-2 py-0.5 rounded-full border ${paymentStatus.color}`}>
                      {ord.payment?.payment_method?.toUpperCase() || 'COD'} • {paymentStatus.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase">Tổng thanh toán</span>
                      <span className="font-sans font-[550] text-sm text-black dark:text-white">
                        {formatPriceVND(ord.total_order || ord.finalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-sans font-[550] text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                      >
                        Chi tiết
                      </button>
                      {cancellable && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(orderId)}
                          disabled={cancelMutation.isPending}
                        className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 font-sans font-[550] text-xs hover:bg-rose-50 cursor-pointer disabled:opacity-40"
                        >
                          Hủy
                        </button>
                      )}
                      {refundRequestable && (
                        <button
                          type="button"
                          onClick={() => handleRequestRefund(orderId)}
                          disabled={refundMutation.isPending}
                          className="px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/40 text-amber-600 font-sans font-[550] text-xs hover:bg-amber-50 cursor-pointer disabled:opacity-40"
                        >
                          Hoàn tiền
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Desktop Table View (Visible on >= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="pb-3 font-sans font-[550]">Mã đơn</th>
                  <th className="pb-3 font-sans font-[550]">Ngày đặt</th>
                  <th className="pb-3 font-sans font-[550]">Tổng thanh toán</th>
                  <th className="pb-3 font-sans font-[550]">Thanh toán</th>
                  <th className="pb-3 font-sans font-[550] text-center">Trạng thái</th>
                  <th className="pb-3 font-sans font-[550] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {orders.map((ord) => {
                  const orderId = ord.order_id || ord.id;
                  const orderStatus = getOrderStatusInfo(ord.status_order);
                  const paymentMethod = ord.payment_method || ord.payment?.payment_method || 'cod';
                  const rawPaymentStatus = ord.status_payment || ord.payment?.status_payment;
                  const paymentStatus = getPaymentStatusInfo(rawPaymentStatus, paymentMethod);
                  const cancellable = isOrderCancellable(ord.status_order, rawPaymentStatus);
                  const refundRequestable = isRefundRequestable(
                    ord.status_order,
                    paymentMethod,
                    rawPaymentStatus,
                    ord.refund_status || ord.refund_request?.status_refund_request,
                  );

                  return (
                    <tr key={orderId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-4 font-sans font-[550] text-black dark:text-white uppercase">
                        {ord.order_code || `#ORD-${orderId}`}
                      </td>
                      <td className="py-4 text-neutral-400">
                        {new Date(ord.created_at || Date.now()).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 font-sans font-[550] text-black dark:text-white">
                        {formatPriceVND(ord.total_order || ord.finalAmount)}
                      </td>
                      <td className="py-4">
                        <span className={`inline-block text-[10px] font-sans font-[550] uppercase px-2 py-0.5 rounded-full border ${paymentStatus.color}`}>
                          {ord.payment?.payment_method?.toUpperCase() || 'COD'}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-block text-[10px] font-sans font-[550] uppercase px-2.5 py-0.5 rounded-full border ${orderStatus.color}`}>
                          {orderStatus.label}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-700 dark:text-neutral-300 font-sans font-[550] transition-all cursor-pointer text-[11px]"
                          >
                            Chi tiết
                          </button>
                          {cancellable && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(orderId)}
                              disabled={cancelMutation.isPending}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-sans font-[550] transition-all cursor-pointer text-[11px] disabled:opacity-40"
                              title="Hủy đơn"
                            >
                              Hủy
                            </button>
                          )}
                          {refundRequestable && (
                            <button
                              type="button"
                              onClick={() => handleRequestRefund(orderId)}
                              disabled={refundMutation.isPending}
                              className="px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-sans font-[550] transition-all cursor-pointer text-[11px] disabled:opacity-40"
                              title="Yêu cầu hoàn tiền"
                            >
                              Hoàn tiền
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
          <Pagination
            totalItems={total}
            currentPage={page}
            limit={10}
            onPageChange={setPage}
            entityName="đơn hàng"
          />
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrderDetail || selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        isLoadingDetail={isFetchingOrderDetail && !selectedOrderDetail}
        detailError={isOrderDetailError && !selectedOrderDetail}
        onRetryDetail={refetchOrderDetail}
        onCancelOrder={handleCancelOrder}
        isCancelling={cancelMutation.isPending}
        onRequestRefund={handleRequestRefund}
        isRequestingRefund={refundMutation.isPending}
      />
    </div>
  );
}
