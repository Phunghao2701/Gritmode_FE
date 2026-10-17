'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAdminOrders, useAdminRefundRequests } from '../hooks/useAdmin';
import Icon from '../../../shared/components/Icon';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Pagination from '../../../shared/components/Pagination';
import { getOrderStatusInfo } from '../../orders/utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';
import AdminPageHeader from '../components/AdminPageHeader';
import ErrorState from '../../../shared/components/ErrorState';

const OrderDetailModal = dynamic(() => import('../components/OrderDetailModal'), {
  ssr: false,
  loading: () => null,
});

const REFUND_STATUS_TABS = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'completed', label: 'Đã hoàn tiền' },
  { value: '', label: 'Tất cả' },
];

const REFUND_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  completed: 'Đã hoàn tiền',
  rejected: 'Từ chối',
};

const formatAdminDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [activeView, setActiveView] = useState('orders');
  const [refundStatus, setRefundStatus] = useState('pending');
  const [refundPage, setRefundPage] = useState(1);
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const notificationOrderId = searchParams.get('orderId');

  useEffect(() => {
    if (notificationOrderId) {
      setSelectedOrder({ order_id: notificationOrderId });
    }
  }, [notificationOrderId]);

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    if (notificationOrderId) router.replace('/admin/orders', { scroll: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    orders,
    isLoading,
    isError,
    refetch,
    total,
    confirmOrder,
    processOrder,
    shipOrder,
    completeOrder,
    cancelOrder,
    completeRefund,
    isActionPending,
  } = useAdminOrders({
    search: debouncedSearch.trim() || undefined,
    status_order: statusFilter || undefined,
    payment_method: paymentMethodFilter || undefined,
    status_payment: paymentStatusFilter || undefined,
    page,
    limit: 10,
  }, { enabled: activeView === 'orders' });

  const {
    refundRequests,
    total: refundTotal,
    pagination: refundPagination,
    isLoading: isLoadingRefunds,
    isError: isRefundError,
    refetch: refetchRefunds,
  } = useAdminRefundRequests({
    status: refundStatus || undefined,
    page: refundPage,
    limit: 10,
  }, { enabled: activeView === 'refunds' });

  if (isError && !isLoading) {
    return <ErrorState onRetry={refetch} title="Không thể tải danh sách đơn hàng" />;
  }

  const tabs = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'completed', label: 'Hoàn tất' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  const handleTabChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleRefundStatusChange = (val) => {
    setRefundStatus(val);
    setRefundPage(1);
  };

  const handleCompleteRefund = ({ refundRequestId, providerReference, adminNote }) => {
    completeRefund(
      { refundRequestId, providerReference, adminNote },
      { onSuccess: () => setSelectedOrder(null) },
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <AdminPageHeader
        eyebrow={activeView === 'orders' ? 'Danh sách đơn hàng' : 'Thanh toán'}
        title={activeView === 'orders' ? `Quản lý đơn hàng (${total})` : `Yêu cầu hoàn tiền (${refundTotal})`}
        description={activeView === 'orders'
          ? 'Xử lý trạng thái đơn, thanh toán và các yêu cầu giao hàng.'
          : 'Theo dõi và xác nhận các khoản hoàn tiền thủ công cho đơn PayOS.'}
      />

      <div className="flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveView('orders')}
          className={`rounded-full px-4 py-2 font-sans text-xs font-[550] uppercase tracking-wider transition-all ${
            activeView === 'orders'
              ? 'bg-black text-white shadow-sm dark:bg-white dark:text-black'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-black dark:hover:bg-neutral-900 dark:hover:text-white'
          }`}
        >
          Đơn hàng
        </button>
        <button
          type="button"
          onClick={() => setActiveView('refunds')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-[550] uppercase tracking-wider transition-all ${
            activeView === 'refunds'
              ? 'bg-black text-white shadow-sm dark:bg-white dark:text-black'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-black dark:hover:bg-neutral-900 dark:hover:text-white'
          }`}
        >
          Yêu cầu hoàn tiền
          {activeView === 'refunds' && refundTotal > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] dark:bg-black/15">
              {refundTotal}
            </span>
          )}
        </button>
      </div>

      {activeView === 'orders' ? (
        <>
      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative w-full md:w-96">
            <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, email, hoặc SĐT..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-sans text-xs font-normal text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:col-start-2 md:w-auto md:justify-self-end">
            {/* Payment Method Filter */}
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-sans text-xs font-[550] text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="">Phương thức: Tất cả</option>
              <option value="cod">COD (Tiền mặt)</option>
              <option value="payos">VIETQR</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-sans text-xs font-[550] text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="">Thanh toán: Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={`px-3.5 py-1.5 rounded-full font-sans text-xs font-[550] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <LoadingSkeleton key={n} height="55px" className="rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="pb-3 font-sans font-[550]">Mã đơn</th>
                    <th className="pb-3 font-sans font-[550]">Khách hàng / SĐT</th>
                    <th className="pb-3 font-sans font-[550]">Ngày đặt</th>
                    <th className="pb-3 font-sans font-[550]">Tổng tiền</th>
                    <th className="pb-3 font-sans font-[550]">Thanh toán</th>
                    <th className="pb-3 font-sans font-[550] text-center">Trạng thái</th>
                    <th className="pb-3 font-sans font-[550] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-400">
                        Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => {
                      const orderId = ord.order_id || ord.id;
                      const orderStatus = getOrderStatusInfo(ord.status_order);
                      const paymentMethod = ord.payment_method || ord.payment?.payment_method || null;
                      const normalizedStatus = String(ord.status_order || '').toLowerCase();
                      const canProcess = ['pending', 'confirmed', 'processing', 'shipping'].includes(normalizedStatus);
                      const createdAt = ord.created_at ? new Date(ord.created_at) : null;
                      const formattedCreatedAt = createdAt && !Number.isNaN(createdAt.getTime())
                        ? createdAt.toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—';

                      return (
                        <tr
                          key={orderId}
                          onClick={() => setSelectedOrder(ord)}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
                        >
                          <td className="py-4">
                            <span className="font-sans font-[550] text-black dark:text-white uppercase">
                              {ord.order_code || ord.code_order || `#ORD-${orderId}`}
                            </span>
                          </td>
                          <td className="py-4">
                            <p className="font-sans font-[550] text-black dark:text-white line-clamp-1">
                              {ord.receiver_name_order_address || ord.shipping_name || ord.user_name || ord.email_order || 'Khách hàng'}
                            </p>
                            <p className="font-sans text-[11px] text-neutral-400">
                              {ord.phone_order_address || ord.phone_order || ord.shipping_phone || 'N/A'}
                            </p>
                          </td>
                          <td className="py-4 font-sans text-neutral-400">
                            {formattedCreatedAt}
                          </td>
                          <td className="py-4 font-sans font-[550] text-black dark:text-white">
                            {formatPriceVND(ord.total_order ?? ord.finalAmount ?? ord.totalAmount ?? 0)}
                          </td>
                          <td className="py-4">
                            <span className="inline-block font-sans text-[10px] font-[550] uppercase px-2 py-0.5 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                              {paymentMethod === 'payos' ? 'VIETQR' : paymentMethod === 'cod' ? 'COD' : 'CHƯA XÁC ĐỊNH'}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-block font-sans text-[10px] font-[550] uppercase px-2.5 py-0.5 rounded-full border ${orderStatus.color}`}>
                              {orderStatus.label}
                            </span>
                          </td>
                          <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-sans font-[550] text-[11px] text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Icon icon="solar:eye-linear" />
                              <span>{canProcess ? 'Xử lý' : 'Xem chi tiết'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              totalItems={total}
              currentPage={page}
              limit={10}
              onPageChange={setPage}
              entityName="đơn hàng"
            />
          </div>
        )}
      </div>
        </>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-sans text-xs font-[550] uppercase tracking-widest text-neutral-400">
                Thanh toán
              </p>
              <h2 className="mt-1 font-sans text-xl font-[550] uppercase tracking-tight text-black dark:text-white">
                Yêu cầu hoàn tiền ({refundTotal})
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Theo dõi và xác nhận các khoản hoàn tiền thủ công cho đơn PayOS.
              </p>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {REFUND_STATUS_TABS.map((tab) => (
                <button
                  key={tab.value || 'all'}
                  type="button"
                  onClick={() => handleRefundStatusChange(tab.value)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 font-sans text-xs font-[550] uppercase tracking-wider transition-all ${
                    refundStatus === tab.value
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'border border-neutral-200 bg-white text-neutral-500 hover:text-black dark:border-neutral-800 dark:bg-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isRefundError && !isLoadingRefunds ? (
            <ErrorState onRetry={refetchRefunds} title="Không thể tải yêu cầu hoàn tiền" />
          ) : isLoadingRefunds ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <LoadingSkeleton key={n} height="64px" className="rounded-xl" />
              ))}
            </div>
          ) : refundRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 py-12 text-center text-sm text-neutral-400 dark:border-neutral-800">
              Không có yêu cầu hoàn tiền nào trong trạng thái này.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead className="border-b border-neutral-100 uppercase text-neutral-400 dark:border-neutral-800">
                    <tr>
                      <th className="pb-3 font-sans font-[550]">Đơn hàng</th>
                      <th className="pb-3 font-sans font-[550]">Khách hàng</th>
                      <th className="pb-3 font-sans font-[550]">Số tiền</th>
                      <th className="pb-3 font-sans font-[550]">Lý do</th>
                      <th className="pb-3 font-sans font-[550]">Trạng thái</th>
                      <th className="pb-3 text-right font-sans font-[550]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {refundRequests.map((request) => {
                      const requestStatus = String(request.status_refund_request || '').toLowerCase();
                      const canComplete = ['pending', 'processing'].includes(requestStatus);

                      return (
                        <tr key={request.refund_request_id} className="align-top">
                          <td className="py-4">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder({
                                order_id: request.order_id,
                                order_code: request.order_code,
                                refund_request: request,
                              })}
                              className="text-left font-sans font-[550] text-black underline-offset-2 hover:underline dark:text-white"
                            >
                              {request.order_code || `#ORD-${request.order_id}`}
                            </button>
                            <p className="mt-1 text-[11px] text-neutral-400">
                              {formatAdminDate(request.requested_at)}
                            </p>
                          </td>
                          <td className="py-4 text-neutral-500">
                            <p className="max-w-[210px] truncate text-black dark:text-white">{request.email_order || 'Khách hàng'}</p>
                            <p className="mt-1 text-[11px]">{request.phone_order || '—'}</p>
                          </td>
                          <td className="py-4 font-sans font-[550] text-black dark:text-white">
                            {formatPriceVND(request.total_order)}
                          </td>
                          <td className="max-w-[220px] py-4 text-neutral-500">
                            <span className="line-clamp-2">{request.reason || 'Không có lý do'}</span>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-[550] uppercase tracking-wider ${
                              requestStatus === 'completed'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}>
                              {REFUND_STATUS_LABELS[requestStatus] || requestStatus || 'Không xác định'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder({
                                  order_id: request.order_id,
                                  order_code: request.order_code,
                                  refund_request: request,
                                })}
                                className="rounded-xl bg-neutral-100 px-3 py-1.5 font-sans text-[11px] font-[550] text-neutral-700 transition-colors hover:bg-black hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-black"
                              >
                                Chi tiết
                              </button>
                              {canComplete && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const providerReference = window.prompt('Mã giao dịch hoàn tiền (nếu có):', request.provider_reference || '');
                                    if (providerReference === null) return;
                                    const adminNote = window.prompt('Ghi chú xử lý (không bắt buộc):', request.admin_note || '') || '';
                                    handleCompleteRefund({
                                      refundRequestId: request.refund_request_id,
                                      providerReference: providerReference.trim(),
                                      adminNote: adminNote.trim(),
                                    });
                                  }}
                                  disabled={isActionPending}
                                  className="rounded-xl bg-amber-600 px-3 py-1.5 font-sans text-[11px] font-[550] text-white transition-colors hover:bg-amber-700 disabled:opacity-40"
                                >
                                  Xác nhận hoàn
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
              <Pagination
                totalItems={refundTotal}
                currentPage={refundPage}
                limit={refundPagination.limit || 10}
                onPageChange={setRefundPage}
                entityName="yêu cầu hoàn tiền"
              />
            </>
          )}
        </div>
      )}

      {/* Order Detail Modal Popup */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={closeOrderDetail}
          onConfirm={(id) => confirmOrder(id, { onSuccess: closeOrderDetail })}
          onProcess={(id) => processOrder(id, { onSuccess: closeOrderDetail })}
          onShip={(id) => shipOrder(id, { onSuccess: closeOrderDetail })}
          onComplete={(id) => completeOrder(id, { onSuccess: closeOrderDetail })}
          onCancel={({ orderId, reason }) => cancelOrder({ orderId, reason }, { onSuccess: closeOrderDetail })}
          onCompleteRefund={({ refundRequestId, providerReference, adminNote }) => completeRefund(
            { refundRequestId, providerReference, adminNote },
            { onSuccess: closeOrderDetail },
          )}
          isActionPending={isActionPending}
        />
      )}
    </div>
  );
}
