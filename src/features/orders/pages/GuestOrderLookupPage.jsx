import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import { useGuestOrderLookup, useGuestCancelOrder } from '../hooks/useOrders';
import { getOrderStatusInfo, getPaymentStatusInfo, isOrderCancellable } from '../utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';

export default function GuestOrderLookupPage() {
  const [formData, setFormData] = useState({
    order_code: '',
    email: '',
    phone: '',
  });

  const [searchedOrder, setSearchedOrder] = useState(null);

  const lookupMutation = useGuestOrderLookup();
  const cancelMutation = useGuestCancelOrder();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLookup = (e) => {
    e.preventDefault();
    if (!formData.order_code.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return;
    }

    lookupMutation.mutate(
      {
        order_code: formData.order_code.trim().toUpperCase(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },
      {
        onSuccess: (res) => {
          setSearchedOrder(res.data?.data || res.data);
        },
      }
    );
  };

  const handleCancelGuestOrder = () => {
    if (!searchedOrder) return;
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      cancelMutation.mutate(
        {
          orderCode: searchedOrder.order_code,
          payload: {
            email: formData.email.trim(),
            phone: formData.phone.trim(),
          },
        },
        {
          onSuccess: (res) => {
            setSearchedOrder((prev) => ({
              ...prev,
              status_order: 'cancelled',
            }));
          },
        }
      );
    }
  };

  const orderStatus = searchedOrder ? getOrderStatusInfo(searchedOrder.status_order) : null;
  const paymentStatus = searchedOrder ? getPaymentStatusInfo(searchedOrder.payment?.status_payment) : null;
  const cancellable = searchedOrder ? isOrderCancellable(searchedOrder.status_order, searchedOrder.payment?.status_payment) : false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
          Order Tracking
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-black dark:text-white uppercase tracking-tight">
          Tra cứu đơn hàng khách vãng lai
        </h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Nhập mã đơn hàng kèm theo email và số điện thoại đã sử dụng khi đặt hàng để kiểm tra trạng thái vận chuyển.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm max-w-2xl mx-auto">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
              Mã đơn hàng *
            </label>
            <input
              type="text"
              name="order_code"
              placeholder=""
              value={formData.order_code}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-mono font-bold text-black dark:text-white uppercase focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                Email đặt hàng *
              </label>
              <input
                type="email"
                name="email"
                placeholder=""
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="phone"
                placeholder=""
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          <PrimaryButton
            type="submit"
            isLoading={lookupMutation.isPending}
            className="w-full justify-center py-3.5 uppercase tracking-widest text-xs font-black rounded-2xl shadow-md mt-2"
          >
            Tra cứu đơn hàng
          </PrimaryButton>
        </form>
      </div>

      {/* Lookup Result Card */}
      {searchedOrder && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md space-y-6 max-w-2xl mx-auto">
          <div className="flex items-start justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-bold uppercase text-neutral-400">Kết quả tra cứu</span>
              <h3 className="font-mono font-black text-lg text-black dark:text-white uppercase mt-0.5">
                {searchedOrder.order_code}
              </h3>
              <p className="text-[11px] text-neutral-500">
                Đặt ngày {new Date(searchedOrder.created_at || Date.now()).toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${orderStatus.color}`}>
                {orderStatus.label}
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="p-4 rounded-2xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Icon icon="solar:map-point-bold" />
              <span>Địa chỉ giao hàng</span>
            </span>
            <p className="font-black text-black dark:text-white">
              {searchedOrder.address?.receiver_name_order_address || searchedOrder.email_order} — {searchedOrder.address?.phone_order_address || searchedOrder.phone_order}
            </p>
            <p className="text-neutral-500">
              {[
                searchedOrder.address?.address_line_order_address,
                searchedOrder.address?.ward_order_address,
                searchedOrder.address?.district_order_address,
                searchedOrder.address?.province_order_address,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
              Sản phẩm ({searchedOrder.items?.length || 0})
            </span>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-black p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs">
              {(searchedOrder.items || []).map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-black dark:text-white uppercase line-clamp-1">
                      {item.name_product_order_item || 'Sản phẩm'}
                    </h5>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {item.variant_order_item ? `${item.variant_order_item} • ` : ''}SL: {item.quantity_order_item || item.quantity}
                    </p>
                  </div>
                  <span className="font-black text-black dark:text-white">
                    {formatPriceVND(item.total_order_item || item.price_order_item * item.quantity_order_item)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2 text-xs pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between text-neutral-500">
              <span>Phương thức thanh toán:</span>
              <span className="font-bold text-black dark:text-white uppercase">
                {searchedOrder.payment?.payment_method || 'COD'} ({paymentStatus.label})
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-black dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <span>Tổng thanh toán:</span>
              <span className="text-base font-display">{formatPriceVND(searchedOrder.total_order)}</span>
            </div>
          </div>

          {/* Cancel button if eligible */}
          {cancellable && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCancelGuestOrder}
                disabled={cancelMutation.isPending}
                className="w-full py-3 rounded-2xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {cancelMutation.isPending ? (
                  <Icon icon="solar:spinner-linear" className="animate-spin" />
                ) : (
                  <Icon icon="solar:trash-bin-minimalistic-linear" />
                )}
                <span>Hủy đơn hàng này</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
