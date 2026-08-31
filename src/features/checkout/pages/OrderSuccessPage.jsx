import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyOrderByIdApi } from '../apis/checkout.api';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { formatPriceVND } from '../../products/utils/product.utils';
import { useAuthStore } from '../../../app/store/authStore';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      if (!orderId || !isAuthenticated) return null;
      try {
        const res = await getMyOrderByIdApi(orderId);
        return res.data?.data || res.data;
      } catch {
        return null;
      }
    },
    enabled: !!orderId && isAuthenticated,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8">
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-4xl mx-auto">
        <Icon icon="solar:check-circle-bold" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Xác nhận thành công
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-black dark:text-white uppercase tracking-tight">
          Cảm ơn bạn đã đặt hàng!
        </h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          Đơn hàng của bạn đã được ghi nhận vào hệ thống Gritmode và đang được chuẩn bị để vận chuyển sớm nhất.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400">Mã đơn hàng</span>
            <p className="font-mono font-black text-sm text-black dark:text-white uppercase mt-0.5">
              {order?.order_code || `#ORD-${orderId}`}
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black">
            ĐANG XỬ LÝ
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <LoadingSkeleton height="1.5rem" />
            <LoadingSkeleton height="1.5rem" width="70%" />
          </div>
        ) : order ? (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-neutral-500">
              <span>Người nhận:</span>
              <span className="font-bold text-black dark:text-white">{order.receiver_name_order_address || order.email_order}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Phương thức thanh toán:</span>
              <span className="font-bold text-black dark:text-white uppercase">
                {order.payment?.payment_method || 'COD'}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Tổng thanh toán:</span>
              <span className="font-display font-black text-sm text-black dark:text-white">
                {formatPriceVND(order.total_order)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <PrimaryButton
          onClick={() => navigate('/products')}
          className="w-full sm:w-auto px-8 py-3.5 uppercase tracking-widest text-xs font-black rounded-2xl shadow-xl"
        >
          Tiếp tục mua sắm
        </PrimaryButton>

        {isAuthenticated && (
          <Link
            to="/profile"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-black uppercase tracking-widest text-black dark:text-white transition-all text-center"
          >
            Xem lịch sử đơn hàng
          </Link>
        )}
      </div>
    </div>
  );
}
