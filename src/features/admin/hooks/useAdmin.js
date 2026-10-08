/**
 * Admin React Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminStatsApi,
  getAdminDashboardOverviewApi,
  getAdminOrdersApi,
  getAdminOrderByIdApi,
  confirmAdminOrderApi,
  processAdminOrderApi,
  shipAdminOrderApi,
  completeAdminOrderApi,
  cancelAdminOrderApi,
  getAdminInventoryApi,
  updateVariantInventoryApi,
  getAdminProductsApi,
  getAdminProductMetaApi,
  createAdminFullProductApi,
  updateAdminProductApi,
  deleteAdminProductApi,
  archiveAdminProductApi,
  getAdminCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getAdminUsersApi,
  getAdminUserByIdApi,
  blockAdminUserApi,
  unblockAdminUserApi,
  setAdminUserInactiveApi,
} from '../apis/admin.api';
import { toast } from '../../../shared/utils/toast';
import {
  CACHE_STALE_TIME,
  invalidateAdminOperationalQueries,
} from '../../../shared/services/cachePolicy';
import { requireApiArray, requireApiObject } from '../../../shared/services/responseContract';
import { broadcastQueryInvalidation } from '../../../shared/services/queryClient';

export const useAdminDashboardOverview = () => {
  return useQuery({
    queryKey: ['admin-dashboard-overview'],
    staleTime: CACHE_STALE_TIME.adminDashboard,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    queryFn: async () => {
      const res = await getAdminDashboardOverviewApi();
      return requireApiObject(res, 'Tổng quan dashboard');
    },
  });
};

export const useAdminProductMeta = () => {
  return useQuery({
    queryKey: ['admin-products-meta'],
    staleTime: 1000 * 60 * 10, // 10 min cache
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await getAdminProductMetaApi();
      const raw = requireApiObject(res, 'Metadata sản phẩm');
      if (!Array.isArray(raw.categories) || !Array.isArray(raw.collections)) throw new Error('Metadata sản phẩm không hợp lệ');
      return raw;
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    staleTime: CACHE_STALE_TIME.adminDashboard,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    queryFn: async () => {
      const res = await getAdminStatsApi();
      return requireApiObject(res, 'Thống kê quản trị');
    },
  });
};

export const useAdminOrders = (params = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-orders', params],
    staleTime: CACHE_STALE_TIME.adminOrders,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      const res = await getAdminOrdersApi(params);
      const raw = requireApiObject(res, 'Đơn hàng quản trị');
      if (!Array.isArray(raw.items) || !raw.pagination) throw new Error('Đơn hàng quản trị không hợp lệ');
      return { ...raw, total: raw.pagination.total };
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (orderId) => confirmAdminOrderApi(orderId),
    onSuccess: () => {
      toast.success('Đã xác nhận đơn hàng thành công!');
      invalidateAdminOperationalQueries(queryClient);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể xác nhận đơn hàng'),
  });

  const processMutation = useMutation({
    mutationFn: (orderId) => processAdminOrderApi(orderId),
    onSuccess: () => {
      toast.success('Đã chuyển đơn hàng sang trạng thái đang xử lý / chuẩn bị hàng!');
      invalidateAdminOperationalQueries(queryClient);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể chuyển trạng thái'),
  });

  const shipMutation = useMutation({
    mutationFn: (orderId) => shipAdminOrderApi(orderId),
    onSuccess: () => {
      toast.success('Đã bàn giao đơn hàng cho đơn vị vận chuyển!');
      invalidateAdminOperationalQueries(queryClient);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể chuyển trạng thái'),
  });

  const completeMutation = useMutation({
    mutationFn: (orderId) => completeAdminOrderApi(orderId),
    onSuccess: () => {
      toast.success('Đã hoàn tất đơn hàng thành công!');
      invalidateAdminOperationalQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể hoàn tất đơn hàng'),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }) => cancelAdminOrderApi(orderId, reason),
    onSuccess: () => {
      toast.success('Đã hủy đơn hàng thành công!');
      invalidateAdminOperationalQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng'),
  });

  return {
    ...query,
    orders: query.data?.items || [],
    pagination: query.data?.pagination || {},
    total: query.data?.total || 0,
    confirmOrder: confirmMutation.mutate,
    processOrder: processMutation.mutate,
    shipOrder: shipMutation.mutate,
    completeOrder: completeMutation.mutate,
    cancelOrder: cancelMutation.mutate,
    isActionPending:
      confirmMutation.isPending ||
      processMutation.isPending ||
      shipMutation.isPending ||
      completeMutation.isPending ||
      cancelMutation.isPending,
  };
};

export const useAdminOrderDetail = (orderId) => {
  return useQuery({
    queryKey: ['admin-order-detail', orderId],
    staleTime: CACHE_STALE_TIME.orderDetail,
    refetchOnMount: false,
    refetchOnReconnect: true,
    queryFn: async () => {
      if (!orderId) return null;
      const res = await getAdminOrderByIdApi(orderId);
      return requireApiObject(res, 'Chi tiết đơn hàng quản trị');
    },
    enabled: !!orderId,
  });
};

export const useAdminInventory = (params = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-inventory', params],
    staleTime: 1000 * 60 * 2, // 2 min cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: true,
    queryFn: async () => {
      const res = await getAdminInventoryApi(params);
      const raw = requireApiObject(res, 'Tồn kho quản trị');
      if (!Array.isArray(raw.items) || !raw.pagination) throw new Error('Tồn kho quản trị không hợp lệ');
      return { ...raw, total: raw.pagination.total };
    },
  });

  const outOfStockCountQuery = useQuery({
    queryKey: ['admin-inventory-out-of-stock-count', params.search || ''],
    staleTime: 1000 * 30,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: true,
    queryFn: async () => {
      const res = await getAdminInventoryApi({
        search: params.search,
        out_of_stock: true,
        page: 1,
        limit: 1,
      });
      const raw = requireApiObject(res, 'Số lượng tồn kho hết hàng');
      if (!raw.pagination || !Number.isFinite(Number(raw.pagination.total))) throw new Error('Số lượng tồn kho hết hàng không hợp lệ');
      return Number(raw.pagination.total);
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ variantId, quantityStock }) =>
      updateVariantInventoryApi(variantId, quantityStock),
    onSuccess: () => {
      toast.success('Cập nhật số lượng tồn kho thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-out-of-stock-count'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-detail'] });
      broadcastQueryInvalidation([
        ['admin-inventory'],
        ['admin-inventory-out-of-stock-count'],
        ['products'],
        ['product-detail'],
      ]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Không thể cập nhật tồn kho'),
  });

  return {
    ...query,
    inventory: query.data?.items || [],
    pagination: query.data?.pagination || {},
    total: query.data?.total || 0,
    outOfStockTotal: outOfStockCountQuery.data,
    isOutOfStockCountLoading: outOfStockCountQuery.isLoading,
    isOutOfStockCountError: outOfStockCountQuery.isError,
    updateStock: updateStockMutation.mutate,
    isUpdatingStock: updateStockMutation.isPending,
  };
};

export const useAdminProducts = (params = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-products', params],
    staleTime: 1000 * 60 * 2, // 2 min cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: true,
    queryFn: async () => {
      const res = await getAdminProductsApi(params);
      const raw = requireApiObject(res, 'Sản phẩm quản trị');
      if (!Array.isArray(raw.items) || !raw.pagination) throw new Error('Sản phẩm quản trị không hợp lệ');
      return { ...raw, total: raw.pagination.total };
    },
  });

  const createMutation = useMutation({
    mutationFn: createAdminFullProductApi,
    onSuccess: () => {
      toast.success('Tạo sản phẩm mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      broadcastQueryInvalidation([
        ['admin-products'],
        ['products'],
        ['product-detail'],
        ['admin-inventory'],
      ]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi tạo sản phẩm'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, data }) => updateAdminProductApi(productId, data),
    onSuccess: () => {
      toast.success('Cập nhật sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      broadcastQueryInvalidation([
        ['admin-products'],
        ['products'],
        ['product-detail'],
        ['admin-inventory'],
      ]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật sản phẩm'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProductApi,
    onSuccess: () => {
      toast.success('Đã ngừng hiển thị sản phẩm');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      broadcastQueryInvalidation([
        ['admin-products'],
        ['products'],
        ['product-detail'],
        ['admin-inventory'],
      ]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi xóa sản phẩm'),
  });

  const archiveMutation = useMutation({
    mutationFn: archiveAdminProductApi,
    onSuccess: () => {
      toast.success('Đã archive sản phẩm');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-detail'] });
      broadcastQueryInvalidation([
        ['admin-products'],
        ['products'],
        ['product-detail'],
        ['admin-inventory'],
      ]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể archive sản phẩm'),
  });

  return {
    ...query,
    products: query.data?.items || [],
    pagination: query.data?.pagination || {},
    total: query.data?.total || 0,
    createProduct: createMutation.mutate,
    createProductAsync: createMutation.mutateAsync,
    isCreatingProduct: createMutation.isPending,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    archiveProduct: archiveMutation.mutate,
  };
};

export const useAdminCategories = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-categories'],
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: true,
    queryFn: async () => {
      const res = await getAdminCategoriesApi();
      return requireApiArray(res, 'Danh mục quản trị');
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      toast.success('Tạo danh mục mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-public-tree'] });
      broadcastQueryInvalidation([
        ['admin-categories'],
        ['categories-public-tree'],
      ]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi tạo danh mục'),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategoryApi(id, data),
    onSuccess: () => {
      toast.success('Cập nhật danh mục thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-public-tree'] });
      broadcastQueryInvalidation([
        ['admin-categories'],
        ['categories-public-tree'],
      ]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật danh mục'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      toast.success('Xóa danh mục thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-public-tree'] });
      broadcastQueryInvalidation([
        ['admin-categories'],
        ['categories-public-tree'],
      ]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi xóa danh mục'),
  });

  return {
    ...query,
    categories: query.data || [],
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
  };
};

export const useAdminUsers = (params = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-users', params],
    staleTime: 1000 * 30, // 30s cache
    queryFn: async () => {
      const res = await getAdminUsersApi(params);
      const raw = requireApiObject(res, 'Người dùng quản trị');
      if (!Array.isArray(raw.items) || !raw.pagination) throw new Error('Người dùng quản trị không hợp lệ');
      return { ...raw, total: raw.pagination.total };
    },
  });

  const blockMutation = useMutation({
    mutationFn: (userId) => blockAdminUserApi(userId),
    onSuccess: () => {
      toast.success('Đã khóa tài khoản người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể khóa tài khoản này'),
  });

  const unblockMutation = useMutation({
    mutationFn: (userId) => unblockAdminUserApi(userId),
    onSuccess: () => {
      toast.success('Đã mở khóa tài khoản người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể mở khóa tài khoản này'),
  });

  const setInactiveMutation = useMutation({
    mutationFn: (userId) => setAdminUserInactiveApi(userId),
    onSuccess: () => {
      toast.success('Đã vô hiệu hóa tài khoản người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể vô hiệu hóa tài khoản này'),
  });

  return {
    ...query,
    users: query.data?.items || [],
    pagination: query.data?.pagination || {},
    total: query.data?.total || 0,
    blockUser: blockMutation.mutate,
    unblockUser: unblockMutation.mutate,
    setUserInactive: setInactiveMutation.mutate,
    isUserActionPending:
      blockMutation.isPending || unblockMutation.isPending || setInactiveMutation.isPending,
  };
};

export const useAdminUserDetail = (userId) => {
  return useQuery({
    queryKey: ['admin-user-detail', userId],
    staleTime: 1000 * 60, // 1 min cache
    queryFn: async () => {
      if (!userId) return null;
      const res = await getAdminUserByIdApi(userId);
      return requireApiObject(res, 'Chi tiết người dùng quản trị');
    },
    enabled: !!userId,
  });
};
