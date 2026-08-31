/**
 * useOrders, useOrderDetail, useCancelOrder & useGuestOrder Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyOrdersApi,
  getMyOrderByIdApi,
  cancelMyOrderApi,
  lookupGuestOrderApi,
  cancelGuestOrderApi,
} from '../apis/order.api';
import { toast } from '../../../shared/utils/toast';

export const useMyOrders = (params = {}) => {
  const query = useQuery({
    queryKey: ['my-orders', params],
    queryFn: async () => {
      const res = await getMyOrdersApi(params);
      const raw = res.data?.data || res.data;
      if (Array.isArray(raw)) {
        return {
          items: raw,
          pagination: { page: 1, limit: raw.length, total: raw.length, total_pages: 1 },
        };
      }
      return {
        items: raw?.items || [],
        pagination: raw?.pagination || {
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 10,
          total: raw?.items?.length || 0,
          total_pages: 1,
        },
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
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
  };
};

export const useOrderDetail = (orderId) => {
  return useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await getMyOrderByIdApi(orderId);
      return res.data?.data || res.data;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => cancelMyOrderApi(orderId),
    onSuccess: (res, orderId) => {
      toast.success('Hủy đơn hàng thành công.');
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng này.');
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
