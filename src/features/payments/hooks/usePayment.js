/**
 * usePayment Hooks
 * Polling payment status, payOS creation/retry, payment countdown.
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrderPaymentApi,
  createPayOSPaymentApi,
  cancelPayOSPaymentApi,
} from '../apis/payment.api';
import { calculateRemainingSeconds } from '../utils/payment.utils';
import { toast } from '../../../shared/utils/toast';
import { CACHE_STALE_TIME, invalidateOrderQueries } from '../../../shared/services/cachePolicy';
import { requireApiObject } from '../../../shared/services/responseContract';

export const useOrderPayment = (orderId, options = {}) => {
  const guestEmail = options.guestInfo?.email || '';
  const guestPhone = options.guestInfo?.phone || '';
  const detailToken = options.detailToken || '';

  const query = useQuery({
    queryKey: ['order-payment', orderId, guestEmail, guestPhone, detailToken ? 'signed' : 'unsigned'],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await getOrderPaymentApi(orderId, {
        email: guestEmail,
        phone: guestPhone,
      }, detailToken);
      return requireApiObject(res, 'Trạng thái thanh toán');
    },
    enabled: !!orderId && (options.enabled ?? true),
    staleTime: CACHE_STALE_TIME.payment,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (queryData) => {
      const payment = queryData?.state?.data;
      if (!payment) return 3000;

      // Only poll when payOS is pending or processing
      if (
        payment.payment_method === 'payos' &&
        ['pending', 'processing'].includes(payment.status_payment)
      ) {
        return 3000; // Poll every 3 seconds
      }

      // Stop polling on terminal statuses: paid, expired, failed, cancelled, refunded or COD
      return false;
    },
  });

  const payment = query.data || null;
  const isPaid = payment?.status_payment === 'paid';
  const isExpired = payment?.status_payment === 'expired';
  const isFailed = payment?.status_payment === 'failed';
  const isCancelled = payment?.status_payment === 'cancelled';
  const isPending = ['pending', 'processing'].includes(payment?.status_payment);

  return {
    ...query,
    payment,
    isPaymentReady: query.isFetchedAfterMount && Boolean(payment),
    isPaid,
    isExpired,
    isFailed,
    isCancelled,
    isPending,
  };
};

export const useCreatePayOSPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) => {
      const orderId = typeof input === 'object' ? input.orderId || input.order_id : input;
      const guestInfo = typeof input === 'object' ? input.guestInfo || {} : {};
      return createPayOSPaymentApi(orderId, guestInfo);
    },
    onSuccess: (res, input) => {
      const orderId = typeof input === 'object' ? input.orderId || input.order_id : input;
      toast.success('Đã tạo liên kết thanh toán VIETQR mới.');
      const newPayment = requireApiObject(res, 'Payment payOS');
      queryClient.setQueryData(['order-payment', String(orderId)], newPayment);
      queryClient.setQueryData(['order-payment', Number(orderId)], newPayment);
      invalidateOrderQueries(queryClient, orderId);
      queryClient.invalidateQueries({ queryKey: ['order-payment', String(orderId)] });
      queryClient.invalidateQueries({ queryKey: ['order-payment', Number(orderId)] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể tạo liên kết VIETQR.');
    },
  });
};

export const useCancelPayOSPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => cancelPayOSPaymentApi(orderId),
    onSuccess: (res, orderId) => {
      toast.success('Đã hủy liên kết VIETQR.');
      invalidateOrderQueries(queryClient, orderId);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể hủy link thanh toán.');
    },
  });
};

export const usePaymentCountdown = (expiredAt, onExpire) => {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemainingSeconds(expiredAt)
  );

  useEffect(() => {
    if (!expiredAt) {
      setRemainingSeconds(0);
      return;
    }

    const initialRem = calculateRemainingSeconds(expiredAt);
    setRemainingSeconds(initialRem);

    const interval = setInterval(() => {
      const rem = calculateRemainingSeconds(expiredAt);
      setRemainingSeconds(rem);

      if (rem <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredAt, onExpire]);

  return remainingSeconds;
};
