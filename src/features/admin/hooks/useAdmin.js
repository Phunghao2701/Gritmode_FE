/**
 * Admin React Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminStatsApi,
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
  getAdminAuditLogsApi,
  getAdminAuditLogByIdApi,
} from '../apis/admin.api';
import { toast } from '../../../shared/utils/toast';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        const res = await getAdminStatsApi();
        return res.data?.data || res.data;
      } catch {
        return {
          revenueThisMonth: 0,
          revenueChange: '0%',
          totalOrders: 0,
          ordersChange: '0%',
          totalProducts: 0,
          productsChange: '0',
          totalUsers: 0,
          usersChange: '0%',
          lowStockCount: 0,
        };
      }
    },
  });
};

export const useAdminOrders = (params = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-orders', params],
    queryFn: async () => {
      const res = await getAdminOrdersApi(params);
      const raw = res.data?.data || res.data;
      if (Array.isArray(raw)) return { items: raw, total: raw.length, pagination: { page: 1, limit: raw.length, total: raw.length, total_pages: 1 } };
      return {
        items: raw?.items || raw?.orders || [],
        pagination: raw?.pagination || { page: 1, limit: 20, total: raw?.items?.length || 0, total_pages: 1 },
        total: raw?.pagination?.total || raw?.items?.length || 0,
      };
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (orderId) => confirmAdminOrderApi(orderId),
    onSuccess: () => {
      toast.success('Đã xác nhận đơn hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể xác nhận đơn hàng'),
  });

  const processMutation = useMutation({
    mutationFn: (orderId) => processAdminOrderApi(orderId),
    onSuccess: () => {
      toast.success('Đã chuyển đơn hàng sang trạng thái đang xử lý / chuẩn bị hàng!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể chuyển trạng thái'),
  });

  const shipMutation = useMutation({
    mutationFn: (orderId) => shipAdminOrderApi(orderId),
    onSuccess: () => {
      toast.success('Đã bàn giao đơn hàng cho đơn vị vận chuyển!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể chuyển trạng thái'),
  });

  const completeMutation = useMutation({
    mutationFn: (orderId) => completeAdminOrderApi(orderId),
    onSuccess: () => {
      toast.success('Đã hoàn tất đơn hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể hoàn tất đơn hàng'),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }) => cancelAdminOrderApi(orderId, reason),
    onSuccess: () => {
      toast.success('Đã hủy đơn hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
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
    queryFn: async () => {
      if (!orderId) return null;
      const res = await getAdminOrderByIdApi(orderId);
      return res.data?.data || res.data;
    },
    enabled: !!orderId,
  });
};

export const useAdminInventory = (params = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-inventory', params],
    queryFn: async () => {
      const res = await getAdminInventoryApi(params);
      const raw = res.data?.data || res.data;
      if (Array.isArray(raw)) return { items: raw, total: raw.length };
      return {
        items: raw?.items || [],
        pagination: raw?.pagination || { total: raw?.items?.length || 0 },
        total: raw?.pagination?.total || raw?.items?.length || 0,
      };
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ variantId, quantityStock }) =>
      updateVariantInventoryApi(variantId, quantityStock),
    onSuccess: () => {
      toast.success('Cập nhật số lượng tồn kho thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Không thể cập nhật tồn kho'),
  });

  return {
    ...query,
    inventory: query.data?.items || [],
    pagination: query.data?.pagination || {},
    total: query.data?.total || 0,
    updateStock: updateStockMutation.mutate,
    isUpdatingStock: updateStockMutation.isPending,
  };
};

export const useAdminProducts = (params = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-products', params],
    queryFn: async () => {
      const res = await getAdminProductsApi(params);
      const raw = res.data?.data || res.data;
      if (Array.isArray(raw)) return { items: raw, total: raw.length };
      return {
        items: raw?.items || [],
        pagination: raw?.pagination || { total: raw?.items?.length || 0 },
        total: raw?.pagination?.total || raw?.items?.length || 0,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: createAdminFullProductApi,
    onSuccess: () => {
      toast.success('Tạo sản phẩm mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi tạo sản phẩm'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, data }) => updateAdminProductApi(productId, data),
    onSuccess: () => {
      toast.success('Cập nhật sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật sản phẩm'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProductApi,
    onSuccess: () => {
      toast.success('Xóa sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
    queryFn: async () => {
      const res = await getAdminCategoriesApi();
      return res.data?.data || res.data || [];
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      toast.success('Tạo danh mục mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-public-tree'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi tạo danh mục'),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategoryApi(id, data),
    onSuccess: () => {
      toast.success('Cập nhật danh mục thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-public-tree'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật danh mục'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      toast.success('Xóa danh mục thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-public-tree'] });
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
    queryFn: async () => {
      const res = await getAdminUsersApi(params);
      const raw = res.data?.data || res.data;
      if (Array.isArray(raw)) return { items: raw, total: raw.length, pagination: { page: 1, limit: raw.length, total: raw.length, total_pages: 1 } };
      return {
        items: raw?.items || raw?.users || [],
        pagination: raw?.pagination || { page: 1, limit: 20, total: raw?.items?.length || 0, total_pages: 1 },
        total: raw?.pagination?.total || raw?.items?.length || 0,
      };
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
    queryFn: async () => {
      if (!userId) return null;
      const res = await getAdminUserByIdApi(userId);
      return res.data?.data || res.data;
    },
    enabled: !!userId,
  });
};

export const useAdminAuditLogs = (params = {}) => {
  const query = useQuery({
    queryKey: ['admin-audit-logs', params],
    queryFn: async () => {
      const res = await getAdminAuditLogsApi(params);
      const raw = res.data?.data || res.data;
      if (Array.isArray(raw)) return { items: raw, total: raw.length, pagination: { page: 1, limit: raw.length, total: raw.length, total_pages: 1 } };
      return {
        items: raw?.items || raw?.logs || [],
        pagination: raw?.pagination || { page: 1, limit: 20, total: raw?.items?.length || 0, total_pages: 1 },
        total: raw?.pagination?.total || raw?.items?.length || 0,
      };
    },
  });

  return {
    ...query,
    logs: query.data?.items || [],
    pagination: query.data?.pagination || {},
    total: query.data?.total || 0,
  };
};

export const useAdminAuditLogDetail = (auditLogId) => {
  return useQuery({
    queryKey: ['admin-audit-log-detail', auditLogId],
    queryFn: async () => {
      if (!auditLogId) return null;
      const res = await getAdminAuditLogByIdApi(auditLogId);
      return res.data?.data || res.data;
    },
    enabled: !!auditLogId,
  });
};
