/**
 * Profile & Address Custom Hooks for Gritmode
 * Powered by @tanstack/react-query and synchronized with authStore
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfileApi,
  updateProfileApi,
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
  changePasswordApi,
} from '../apis/profile.api';
import { useAuthStore } from '../../../app/store/authStore';
import { toast } from '../../../shared/utils/toast';

/**
 * Hook quản lý thông tin tài khoản cá nhân
 */
export const useProfile = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, setUser } = useAuthStore();

  const profileQuery = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await getProfileApi();
      const userData = res.data?.data || res.data;
      if (userData) {
        // Đồng bộ với global auth state
        setUser(userData);
      }
      return userData;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 phút
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (res) => {
      const updatedUser = res.data?.data || res.data;
      if (updatedUser) {
        setUser(updatedUser);
      }
      toast.success('Cập nhật thông tin tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (err) => {
      const status = err.response?.status;
      if (status === 409) {
        toast.error('Số điện thoại này đã được sử dụng bởi tài khoản khác.');
      } else {
        toast.error(err.response?.data?.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
      }
    },
  });

  return {
    ...profileQuery,
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
  };
};

/**
 * Hook quản lý sổ địa chỉ nhận hàng
 */
export const useAddresses = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const addressesQuery = useQuery({
    queryKey: ['user-addresses'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const res = await getAddressesApi();
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: createAddressApi,
    onSuccess: () => {
      toast.success('Thêm địa chỉ giao hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể tạo địa chỉ mới. Vui lòng kiểm tra lại.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAddressApi(id, data),
    onSuccess: () => {
      toast.success('Cập nhật địa chỉ thành công!');
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật địa chỉ.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddressApi,
    onSuccess: () => {
      toast.success('Đã xóa địa chỉ!');
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể xóa địa chỉ.');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddressApi,
    onSuccess: () => {
      toast.success('Đã thay đổi địa chỉ mặc định!');
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể đặt địa chỉ mặc định.');
    },
  });

  const addresses = addressesQuery.data || [];
  const defaultAddress = addresses.find((addr) => addr.is_default) || null;

  return {
    ...addressesQuery,
    addresses,
    defaultAddress,
    isLoadingAddresses: addressesQuery.isLoading,
    createAddress: createMutation.mutate,
    createAddressAsync: createMutation.mutateAsync,
    isCreatingAddress: createMutation.isPending,
    updateAddress: (id, data) => updateMutation.mutate({ id, data }),
    updateAddressAsync: (id, data) => updateMutation.mutateAsync({ id, data }),
    isUpdatingAddress: updateMutation.isPending,
    deleteAddress: deleteMutation.mutate,
    isDeletingAddress: deleteMutation.isPending,
    setDefaultAddress: setDefaultMutation.mutate,
    isSettingDefaultAddress: setDefaultMutation.isPending,
  };
};

/**
 * Hook đổi mật khẩu tài khoản
 */
export const useChangePassword = () => {
  const mutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.response?.data?.error?.message;
      if (err.response?.status === 400 || err.response?.status === 401) {
        toast.error(msg || 'Mật khẩu hiện tại không chính xác.');
      } else {
        toast.error(msg || 'Không thể đổi mật khẩu. Vui lòng thử lại sau.');
      }
    },
  });

  return {
    changePassword: mutation.mutate,
    changePasswordAsync: mutation.mutateAsync,
    isChangingPassword: mutation.isPending,
    error: mutation.error,
  };
};

