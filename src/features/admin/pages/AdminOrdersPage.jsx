'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAdminOrders } from '../hooks/useAdmin';
import Icon from '../../../shared/components/Icon';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Pagination from '../../../shared/components/Pagination';
import { getOrderStatusInfo } from '../../orders/utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';
import AdminPageHeader from '../components/AdminPageHeader';

const OrderDetailModal = dynamic(() => import('../components/OrderDetailModal'), {
  ssr: false,
  loading: () => null,
});

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
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
    total,
    confirmOrder,
    processOrder,
    shipOrder,
    completeOrder,
    cancelOrder,
    isActionPending,
  } = useAdminOrders({
    search: debouncedSearch.trim() || undefined,
    status_order: statusFilter || undefined,
    payment_method: paymentMethodFilter || undefined,
    status_payment: paymentStatusFilter || undefined,
    page,
    limit: 10,
  });

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      <AdminPageHeader
        eyebrow="Danh sách đơn hàng"
        title={`Quản lý đơn hàng (${total})`}
        description="Xử lý trạng thái đơn, thanh toán và các yêu cầu giao hàng."
      />

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
          isActionPending={isActionPending}
        />
      )}
    </div>
  );
}
