/**
 * useVoucherValidation & useAdminVouchers Hooks
 */
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { validateVoucherApi, getAdminVouchersApi } from '../apis/voucher.api';
import { normalizeVoucherCode } from '../utils/voucher.utils';
import { toast } from '../../../shared/utils/toast';

export const useVoucherValidation = ({ onAppliedSuccess, onRemoved } = {}) => {
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [voucherError, setVoucherError] = useState(null);

  const applyVoucher = useCallback(
    async (code) => {
      const normalized = normalizeVoucherCode(code);
      if (!normalized) {
        toast.error('Vui lòng nhập mã ưu đãi.');
        return { success: false, error: 'Mã không được để trống' };
      }

      setIsValidating(true);
      setVoucherError(null);

      try {
        const res = await validateVoucherApi(normalized);
        const data = res.data?.data || res.data;
        setAppliedVoucher(data);
        toast.success(`Đã áp dụng mã "${data.code_voucher}" thành công!`);
        if (onAppliedSuccess) onAppliedSuccess(data);
        return { success: true, data };
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc không áp dụng được.';
        setVoucherError(msg);
        toast.error(msg);
        return { success: false, error: msg, status };
      } finally {
        setIsValidating(false);
      }
    },
    [onAppliedSuccess]
  );

  const revalidateVoucher = useCallback(
    async (code = appliedVoucher?.code_voucher) => {
      if (!code) return;
      try {
        const res = await validateVoucherApi(code);
        const data = res.data?.data || res.data;
        setAppliedVoucher(data);
        if (onAppliedSuccess) onAppliedSuccess(data);
      } catch {
        // If voucher becomes invalid upon cart changes, silently remove
        setAppliedVoucher(null);
        toast.warning('Mã ưu đãi trước đó không còn thỏa mãn điều kiện giỏ hàng.');
        if (onRemoved) onRemoved();
      }
    },
    [appliedVoucher, onAppliedSuccess, onRemoved]
  );

  const removeVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setVoucherError(null);
    toast.info('Đã gỡ bỏ mã giảm giá.');
    if (onRemoved) onRemoved();
  }, [onRemoved]);

  return {
    appliedVoucher,
    setAppliedVoucher,
    isValidating,
    voucherError,
    applyVoucher,
    revalidateVoucher,
    removeVoucher,
  };
};

export const useAdminVouchers = (params = {}) => {
  return useQuery({
    queryKey: ['admin-vouchers', params],
    queryFn: async () => {
      const res = await getAdminVouchersApi(params);
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 3,
  });
};
