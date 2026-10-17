/**
 * useOrders, useOrderDetail, useCancelOrder & useGuestOrder Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyOrdersApi,
  getMyOrderByIdApi,
  cancelMyOrderApi,
  requestMyRefundApi,
  lookupGuestOrderApi,
  cancelGuestOrderApi,
  requestGuestRefundApi,
} from '../apis/order.api';
import { toast } from '../../../shared/utils/toast';
import { CACHE_STALE_TIME, invalidateOrderQueries } from '../../../shared/services/cachePolicy';
import { requireApiObject } from '../../../shared/services/responseContract';

export const useMyOrders = (params = {}) => {
  const query = useQuery({
    queryKey: ['my-orders', params],
    queryFn: async () => {
      const res = await getMyOrdersApi(params);
      const raw = requireApiObject(res, 'Danh sách đơn hàng');
      if (!Array.isArray(raw.items) || !raw.pagination) throw new Error('Danh sách đơn hàng không hợp lệ');
      return raw;
    },
    staleTime: CACHE_STALE_TIME.orderList,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const items = query.data?.items || [];
  const pagination = query.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  };

  return {
    ...query,
    orders: items,
    pagination,
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.total_pages,
    isLoadingOrders: query.isLoading,
    isErrorOrders: query.isError,
    ordersError: query.error,
    refetchOrders: query.refetch,
  };
};

export const useOrderDetail = (orderId) => {
  return useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await getMyOrderByIdApi(orderId);
      return requireApiObject(res, 'Chi tiết đơn hàng');
    },
    enabled: !!orderId,
    staleTime: CACHE_STALE_TIME.orderDetail,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => cancelMyOrderApi(orderId),
    onSuccess: (res, orderId) => {
      toast.success('Hủy đơn hàng thành công.');
      invalidateOrderQueries(queryClient, orderId);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng này.');
    },
  });
};

export const useRequestRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }) => requestMyRefundApi(orderId, reason),
    onSuccess: (res, { orderId }) => {
      const alreadyRequested = res?.data?.data?.already_requested;
      toast.success(
        alreadyRequested
          ? 'Yêu cầu hoàn tiền của đơn hàng này đang được xử lý.'
          : 'Đã gửi yêu cầu hoàn tiền. Bộ phận hỗ trợ sẽ xử lý cho bạn.',
      );
      invalidateOrderQueries(queryClient, orderId);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu hoàn tiền cho đơn hàng này.');
    },
  });
};

export const useGuestOrderLookup = () => {
  return useMutation({
    mutationFn: (payload) => lookupGuestOrderApi(payload),
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không tìm thấy đơn hàng với thông tin đã nhập.');
    },
  });
};

export const useGuestCancelOrder = () => {
  return useMutation({
    mutationFn: ({ orderCode, payload }) => cancelGuestOrderApi(orderCode, payload),
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng này.');
    },
  });
};

export const useGuestRequestRefund = () => {
  return useMutation({
    mutationFn: ({ orderCode, payload }) => requestGuestRefundApi(orderCode, payload),
    onSuccess: (res) => {
      const alreadyRequested = res?.data?.data?.already_requested;
      toast.success(
        alreadyRequested
          ? 'Yêu cầu hoàn tiền của đơn hàng này đang được xử lý.'
          : 'Đã gửi yêu cầu hoàn tiền. Bộ phận hỗ trợ sẽ xử lý cho bạn.',
      );
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu hoàn tiền cho đơn hàng này.');
    },
  });
};
