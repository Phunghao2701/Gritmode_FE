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

export const useOrderPayment = (orderId, options = {}) => {
  const query = useQuery({
    queryKey: ['order-payment', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await getOrderPaymentApi(orderId);
      return res.data?.data || res.data;
    },
    enabled: !!orderId && (options.enabled ?? true),
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
    mutationFn: (orderId) => createPayOSPaymentApi(orderId),
    onSuccess: (res, orderId) => {
      toast.success('Đã tạo liên kết thanh toán payOS mới.');
      const newPayment = res.data?.data || res.data;
      if (newPayment) {
        queryClient.setQueryData(['order-payment', String(orderId)], newPayment);
        queryClient.setQueryData(['order-payment', Number(orderId)], newPayment);
      }
      queryClient.invalidateQueries({ queryKey: ['order-payment', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể tạo link thanh toán payOS.');
    },
  });
};

export const useCancelPayOSPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => cancelPayOSPaymentApi(orderId),
    onSuccess: (res, orderId) => {
      toast.success('Đã hủy link thanh toán payOS.');
      queryClient.invalidateQueries({ queryKey: ['order-payment', orderId] });
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
