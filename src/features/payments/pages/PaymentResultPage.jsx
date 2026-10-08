'use client';
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getMyOrderByIdApi } from '../../orders/apis/order.api';
import { useOrderPayment } from '../hooks/usePayment';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { getPaymentStatusInfo } from '../../orders/utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';
import ErrorState from '../../../shared/components/ErrorState';
import { requireApiObject } from '../../../shared/services/responseContract';
import { useAuthStore } from '../../../shared/store/authStore';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const orderId = searchParams.get('orderId') || searchParams.get('order_id');
  const isCancelledFlow = window.location.pathname.includes('cancel');

  const {
    data: guestOrder,
    isLoading: isGuestOrderLoading,
    isError: isGuestOrderError,
    refetch: refetchGuestOrder,
  } = useQuery({
    queryKey: ['order-payment-result-order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Thiếu mã đơn hàng');
      const res = await getMyOrderByIdApi(orderId);
      return requireApiObject(res, 'Chi tiết đơn hàng');
    },
    enabled: !!orderId && !isAuthenticated,
  });

  const {
    payment,
    isLoading: isPaymentLoading,
    isError: isPaymentError,
    refetch,
  } = useOrderPayment(orderId, {
    enabled: !!orderId && (
      isAuthenticated ||
      Boolean(guestOrder?.email_order && guestOrder?.phone_order)
    ),
    guestInfo: {
      email: guestOrder?.email_order,
      phone: guestOrder?.phone_order,
    },
  });

  const isLoading = isGuestOrderLoading || isPaymentLoading;
  const isError = isGuestOrderError || isPaymentError;
  const retry = () => {
    if (isGuestOrderError) refetchGuestOrder();
    if (isPaymentError) refetch();
  };

  const isPaid = payment?.status_payment === 'paid';
  const paymentStatus = payment ? getPaymentStatusInfo(payment.status_payment) : null;
  if (!orderId || isError) return <ErrorState onRetry={retry} title="Không thể tải trạng thái thanh toán" />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8 font-sans">
      {isLoading ? (
        <div className="space-y-4 max-w-md mx-auto">
          <LoadingSkeleton height="4rem" className="rounded-full w-16 mx-auto" />
          <LoadingSkeleton height="2rem" />
          <LoadingSkeleton height="1.5rem" width="60%" className="mx-auto" />
        </div>
      ) : isPaid ? (
        /* Success State */
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-4xl mx-auto">
            <Icon icon="solar:check-circle-bold" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Giao dịch thành công
          </span>
          <h1 className="font-sans font-black text-3xl sm:text-4xl text-black dark:text-white uppercase tracking-tight">
            Xác nhận thanh toán payOS
          </h1>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Đơn hàng #{orderId} đã được thanh toán thành công qua cổng payOS. Đơn hàng đang được chuyển sang bộ phận kho để đóng gói.
          </p>
        </div>
      ) : (
        /* Pending / Incomplete State */
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-4xl mx-auto">
            <Icon icon="solar:clock-circle-bold" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {isCancelledFlow ? 'Hủy phiên thanh toán' : 'Đang xử lý thanh toán'}
          </span>
          <h1 className="font-sans font-black text-3xl sm:text-4xl text-black dark:text-white uppercase tracking-tight">
            {isCancelledFlow ? 'Bạn đã hủy phiên payOS' : 'Chờ xác nhận giao dịch'}
          </h1>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {isCancelledFlow
              ? 'Phiên thanh toán trực tuyến đã được hủy. Đơn hàng của bạn vẫn được lưu trữ, bạn có thể thực hiện thanh toán lại hoặc chọn phương thức COD.'
              : 'Hệ thống đang kết nối với ngân hàng để ghi nhận giao dịch của bạn. Vui lòng giữ trang hoặc kiểm tra lại sau.'}
          </p>
        </div>
      )}

      {/* Payment Details Card */}
      {payment && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left space-y-3 shadow-sm text-xs">
          <div className="flex justify-between text-neutral-500">
            <span>Mã đơn hàng:</span>
            <span className="font-mono font-black text-black dark:text-white uppercase">#{orderId}</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Số tiền:</span>
            <span className="font-bold text-black dark:text-white">{formatPriceVND(payment.amount_payment)}</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Phương thức:</span>
            <span className="font-bold text-black dark:text-white uppercase">payOS hosted</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Trạng thái thanh toán:</span>
            <span className={`inline-block font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full border ${paymentStatus.color}`}>
              {paymentStatus.label}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <PrimaryButton
          onClick={() => router.push('/products')}
          variant={isPaid ? 'secondary' : 'primary'}
          className="w-full sm:w-auto px-8 py-3.5 uppercase tracking-widest text-xs font-black rounded-2xl"
        >
          Tiếp tục mua sắm
        </PrimaryButton>

        <Link
          href="/profile"
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-xs font-black uppercase tracking-widest text-black dark:text-white transition-all text-center"
        >
          Xem lịch sử đơn hàng
        </Link>
      </div>
    </div>
  );
}
