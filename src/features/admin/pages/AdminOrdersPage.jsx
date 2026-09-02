import React, { useState } from 'react';
import { useAdminOrders } from '../hooks/useAdmin';
import OrderDetailModal from '../components/OrderDetailModal';
import Icon from '../../../shared/components/Icon';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Pagination from '../../../shared/components/Pagination';
import {
  getOrderStatusInfo,
  getPaymentStatusInfo,
} from '../../orders/utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {
    orders,
    isLoading,
    total,
    pagination,
    confirmOrder,
    processOrder,
    shipOrder,
    completeOrder,
    cancelOrder,
    isActionPending,
  } = useAdminOrders({
    search: search.trim() || undefined,
    status_order: statusFilter || undefined,
    payment_method: paymentMethodFilter || undefined,
    status_payment: paymentStatusFilter || undefined,
    page,
    limit: 20,
  });

  const totalPages = pagination?.total_pages || 1;

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

  const handleActionSuccess = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
            Order Fulfillment
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white mt-1">
            Quản lý đơn hàng ({total})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Theo dõi vòng đời đơn hàng, xác nhận đơn COD / payOS, chuẩn bị hàng, giao hàng và hoàn tất.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Payment Method Filter */}
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="">Phương thức: Tất cả</option>
              <option value="cod">COD (Tiền mặt)</option>
              <option value="payos">payOS (VietQR)</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-sm'
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
                    <th className="pb-3 font-black">Mã đơn</th>
                    <th className="pb-3 font-black">Khách hàng / SĐT</th>
                    <th className="pb-3 font-black">Ngày đặt</th>
                    <th className="pb-3 font-black">Tổng tiền</th>
                    <th className="pb-3 font-black">Thanh toán</th>
                    <th className="pb-3 font-black text-center">Trạng thái</th>
                    <th className="pb-3 font-black text-right">Thao tác</th>
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
                      const paymentStatus = getPaymentStatusInfo(ord.status_payment || ord.payment?.status_payment);
                      const isGuest = !ord.user && !ord.user_id;

                      return (
                        <tr key={orderId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-mono font-black text-black dark:text-white uppercase">
                                {ord.order_code || `#ORD-${orderId}`}
                              </span>
                              <span className="text-[9px] text-neutral-400 font-bold uppercase">
                                {isGuest ? 'Khách vãng lai' : 'Thành viên'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="font-bold text-black dark:text-white line-clamp-1">{ord.email_order}</p>
                            <p className="text-neutral-400 font-mono text-[11px]">{ord.phone_order || 'N/A'}</p>
                          </td>
                          <td className="py-4 text-neutral-400">
                            {new Date(ord.created_at || Date.now()).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-4 font-black text-black dark:text-white">
                            {formatPriceVND(ord.total_order || ord.finalAmount)}
                          </td>
                          <td className="py-4">
                            <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${paymentStatus.color}`}>
                              {paymentMethod === 'payos' ? 'CHUYỂN KHOẢN' : paymentMethod === 'cod' ? 'COD' : 'CHƯA XÁC ĐỊNH'} • {paymentStatus.label}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${orderStatus.color}`}>
                              {orderStatus.label}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-[11px] text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Icon icon="solar:eye-linear" />
                              <span>Xử lý</span>
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
              limit={20}
              onPageChange={setPage}
              entityName="đơn hàng"
            />
          </div>
        )}
      </div>

      {/* Order Detail & Actions Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onConfirm={(orderId) => confirmOrder(orderId, { onSuccess: handleActionSuccess })}
          onProcess={(orderId) => processOrder(orderId, { onSuccess: handleActionSuccess })}
          onShip={(orderId) => shipOrder(orderId, { onSuccess: handleActionSuccess })}
          onComplete={(orderId) => completeOrder(orderId, { onSuccess: handleActionSuccess })}
          onCancel={({ orderId, reason }) => cancelOrder({ orderId, reason }, { onSuccess: handleActionSuccess })}
          isActionPending={isActionPending}
        />
      )}
    </div>
  );
}
