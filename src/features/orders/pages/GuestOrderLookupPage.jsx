'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import Breadcrumb from '../../../shared/components/Breadcrumb';
import { useGuestOrderLookup, useGuestCancelOrder } from '../hooks/useOrders';
import { getOrderStatusInfo, getPaymentStatusInfo, isOrderCancellable } from '../utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';
import { requireApiObject } from '../../../shared/services/responseContract';

export default function GuestOrderLookupPage() {
  const searchParams = useSearchParams();
  const orderCodeParam = searchParams.get('orderCode') || searchParams.get('order_code') || '';
  const [formData, setFormData] = useState({
    order_code: '',
    email: '',
    phone: '',
  });

  const [searchedOrder, setSearchedOrder] = useState(null);

  const lookupMutation = useGuestOrderLookup();
  const cancelMutation = useGuestCancelOrder();

  useEffect(() => {
    const normalizedOrderCode = orderCodeParam.trim().toUpperCase();
    if (!normalizedOrderCode) return;

    setFormData((prev) => ({
      ...prev,
      order_code: normalizedOrderCode,
    }));
  }, [orderCodeParam]);

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
          setSearchedOrder(requireApiObject(res, 'Đơn hàng'));
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
          onSuccess: () => {
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
  const paymentStatus = searchedOrder
    ? getPaymentStatusInfo(
      searchedOrder.payment?.status_payment,
      searchedOrder.payment?.payment_method
    )
    : null;
  const cancellable = searchedOrder ? isOrderCancellable(searchedOrder.status_order, searchedOrder.payment?.status_payment) : false;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white animate-fade-in">
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Hỗ trợ mua hàng' },
          { label: 'Tra cứu & theo dõi đơn hàng', current: true },
        ]}
      />

      <div className="text-center space-y-2">
        <h1 className="font-sans font-[550] text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white uppercase tracking-widest">
          Tra cứu đơn hàng
        </h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Nhập mã đơn hàng, email và số điện thoại đã dùng khi đặt hàng để kiểm tra trạng thái.
        </p>
      </div>

      {/* Lookup Form */}
      </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <div className="max-w-2xl mx-auto border-y border-neutral-200 dark:border-neutral-800 py-8 sm:py-10">
        <form onSubmit={handleLookup} className="space-y-4" aria-describedby="lookup-help">
          <div>
            <label htmlFor="guest-order-code" className="block text-xs font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
              Mã đơn hàng <span className="text-rose-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="guest-order-code"
              name="order_code"
              placeholder="VD: ORD-20261008-123456"
              value={formData.order_code}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-mono font-medium text-black dark:text-white uppercase focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="guest-order-email" className="block text-xs font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                Email đặt hàng <span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                type="email"
                id="guest-order-email"
                name="email"
                placeholder="Nhập email đã đặt hàng"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="guest-order-phone" className="block text-xs font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                Số điện thoại <span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                type="tel"
                id="guest-order-phone"
                name="phone"
                placeholder="Nhập số điện thoại đã đặt hàng"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          <PrimaryButton
            type="submit"
            isLoading={lookupMutation.isPending}
            className="w-full justify-center py-3.5 uppercase tracking-widest text-xs font-[550] rounded-2xl shadow-md mt-2"
          >
            Tra cứu đơn hàng
          </PrimaryButton>
        </form>
        {lookupMutation.isError && (
          <p role="alert" aria-live="assertive" className="mt-4 text-xs text-rose-600 dark:text-rose-400">
            {lookupMutation.error?.response?.data?.message || 'Không tìm thấy đơn hàng với thông tin đã nhập.'}
          </p>
        )}
        <p id="lookup-help" className="mt-4 text-[11px] leading-relaxed text-neutral-500">
          Thông tin này chỉ được dùng để xác thực và hiển thị đơn hàng của bạn.
        </p>
      </div>

      {/* Lookup Result Card */}
      {searchedOrder && (
        <div className="border-y border-neutral-200 dark:border-neutral-800 py-8 sm:py-10 space-y-6 max-w-2xl mx-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-[550] uppercase text-neutral-400">Kết quả tra cứu</span>
              <h3 className="font-mono font-[550] text-lg text-black dark:text-white uppercase mt-0.5">
                {searchedOrder.order_code}
              </h3>
              <p className="text-xs text-neutral-500">
                Đặt ngày {new Date(searchedOrder.created_at || Date.now()).toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-block text-[11px] font-[550] uppercase tracking-wider px-3 py-1 rounded-full border ${orderStatus.color}`}>
                {orderStatus.label}
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="py-4 border-y border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
            <span className="text-[10px] font-[550] uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Icon icon="solar:map-point-bold" />
              <span>Địa chỉ giao hàng</span>
            </span>
            <p className="font-[550] text-black dark:text-white">
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
            <span className="text-xs font-[550] uppercase tracking-wider text-neutral-500">
              Sản phẩm ({searchedOrder.items?.length || 0})
            </span>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800 text-xs">
              {(searchedOrder.items || []).map((item, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h5 className="font-[550] text-xs leading-snug text-black dark:text-white uppercase line-clamp-1">
                      {item.name_product_order_item || 'Sản phẩm'}
                    </h5>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {item.variant_order_item ? `${item.variant_order_item} • ` : ''}SL: {item.quantity_order_item || item.quantity}
                    </p>
                  </div>
                  <span className="font-[550] text-black dark:text-white shrink-0">
                    {formatPriceVND(item.total_order_item || item.price_order_item * item.quantity_order_item)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2 text-xs pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-neutral-500">
              <span>Phương thức thanh toán:</span>
              <span className="font-[550] text-black dark:text-white uppercase">
                {searchedOrder.payment?.payment_method || 'COD'} ({paymentStatus.label})
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm font-[550] text-black dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <span>Tổng thanh toán:</span>
              <span className="text-base font-sans font-[550]">{formatPriceVND(searchedOrder.total_order)}</span>
            </div>
          </div>

          {/* Cancel button if eligible */}
          {cancellable && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCancelGuestOrder}
                disabled={cancelMutation.isPending}
                className="w-full py-3 rounded-2xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-[550] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
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
    </div>
  );
}
