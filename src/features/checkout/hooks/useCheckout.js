/**
 * useCheckout Hook
 * Handles order validation, voucher application, saved address prefill, and placing order.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../../app/store/cartStore';
import { useAuthStore } from '../../../app/store/authStore';
import { useAddresses } from '../../profile/hooks/useProfile';
import { createOrderApi } from '../apis/checkout.api';
import { validateVoucherApi } from '../../vouchers/apis/voucher.api';
import { toast } from '../../../shared/utils/toast';

export const useCheckout = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, resetCartState, fetchCart, updateQuantity, removeItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addresses, defaultAddress, isLoadingAddresses } = useAddresses();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    note: '',
    selectedAddressId: null,
  });

  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isPayOSModalOpen, setIsPayOSModalOpen] = useState(false);

  // Initialize or prefill from user profile / default address
  useEffect(() => {
    if (isAuthenticated) {
      if (defaultAddress) {
        setFormData((prev) => ({
          ...prev,
          fullName: defaultAddress.receiver_name_user_address || user?.full_name || prev.fullName,
          phone: defaultAddress.phone_user_address || user?.phone || prev.phone,
          email: user?.email || prev.email,
          province: defaultAddress.province_user_address || prev.province,
          district: defaultAddress.district_user_address || prev.district,
          ward: defaultAddress.ward_user_address || prev.ward,
          street: defaultAddress.address_line_user_address || prev.street,
          selectedAddressId: defaultAddress.user_address_id,
        }));
      } else if (user) {
        setFormData((prev) => ({
          ...prev,
          fullName: user.full_name || prev.fullName,
          phone: user.phone || prev.phone,
          email: user.email || prev.email,
        }));
      }
    }
  }, [isAuthenticated, user, defaultAddress]);

  // Revalidate voucher if cart items change
  useEffect(() => {
    if (!appliedVoucher) return;

    if (items.length === 0) {
      setAppliedVoucher(null);
      return;
    }

    const revalidate = async () => {
      try {
        const code = appliedVoucher.code_voucher;
        const res = await validateVoucherApi(code);
        const data = res.data?.data || res.data;
        setAppliedVoucher(data);
      } catch {
        setAppliedVoucher(null);
        toast.warning('Mã giảm giá đã bị gỡ bỏ do thay đổi giỏ hàng.');
      }
    };

    revalidate();
  }, [items.length]);

  const selectSavedAddress = (addr) => {
    if (!addr) {
      setFormData((prev) => ({
        ...prev,
        selectedAddressId: 'new',
        province: '',
        district: '',
        ward: '',
        street: '',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      fullName: addr.receiver_name_user_address,
      phone: addr.phone_user_address,
      province: addr.province_user_address || '',
      district: addr.district_user_address || '',
      ward: addr.ward_user_address || '',
      street: addr.address_line_user_address || '',
      selectedAddressId: addr.user_address_id,
    }));
  };

  const subtotal = getSubtotal();
  const shippingFee = 0;
  const discountAmount = appliedVoucher?.discount_amount ?? appliedVoucher?.discountAmount ?? 0;
  const finalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

const normalizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  let cleaned = phone.trim().replace(/[\s.-]/g, '');
  if (cleaned.startsWith('+84')) cleaned = '0' + cleaned.slice(3);
  else if (cleaned.startsWith('84') && cleaned.length === 11) cleaned = '0' + cleaned.slice(2);
  return cleaned;
};

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    const newErrors = {};
    const isUsingSavedAddress = isAuthenticated && typeof formData.selectedAddressId === 'number';

    if (!isUsingSavedAddress) {
      const cleanPhone = normalizePhone(formData.phone);
      if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
      if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
      else if (!/^0\d{9}$/.test(cleanPhone)) newErrors.phone = 'Số điện thoại phải gồm 10 chữ số (VD: 0901234567 hoặc +84901234567)';
      if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = 'Email không hợp lệ';
      if (!formData.province.trim()) newErrors.province = 'Vui lòng nhập Tỉnh/Thành phố';
      if (!formData.district.trim()) newErrors.district = 'Vui lòng nhập Quận/Huyện';
      if (!formData.ward.trim()) newErrors.ward = 'Vui lòng nhập Phường/Xã';
      if (!formData.street.trim()) newErrors.street = 'Vui lòng nhập địa chỉ cụ thể';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError || 'Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        payment_method: paymentMethod.toLowerCase(),
        voucher_code: appliedVoucher?.code_voucher || null,
        note_order: formData.note?.trim() || null,
      };

      if (isUsingSavedAddress) {
        orderPayload.user_address_id = formData.selectedAddressId;
        if (formData.phone) orderPayload.phone_order = normalizePhone(formData.phone);
      } else {
        const cleanPhone = normalizePhone(formData.phone);
        orderPayload.email_order = formData.email?.trim().toLowerCase();
        orderPayload.phone_order = cleanPhone;
        orderPayload.receiver_name_order_address = formData.fullName?.trim();
        orderPayload.phone_order_address = cleanPhone;
        orderPayload.address_line_order_address = formData.street?.trim();
        orderPayload.ward_order_address = formData.ward?.trim();
        orderPayload.district_order_address = formData.district?.trim();
        orderPayload.province_order_address = formData.province?.trim();
      }

      const res = await createOrderApi(orderPayload);
      const orderData = res.data?.data || res.data;

      // Reset cart upon successful order placement
      resetCartState();
      toast.success('Đặt hàng thành công!');

      // Directly navigate to finalized order page with embedded VietQR / order details
      navigate(orderData?.order_id ? `/order-success/${orderData.order_id}` : '/profile', {
        state: { order: orderData },
      });
    } catch (err) {
      const status = err.response?.status;
      const firstErrorMsg = err.response?.data?.errors?.[0]?.message;
      const apiMessage = firstErrorMsg || err.response?.data?.message;

      if (status === 409) {
        // Insufficient inventory or voucher exhausted
        toast.error(apiMessage || 'Có sản phẩm hết hàng hoặc mã giảm giá không còn hiệu lực.');
        fetchCart();
      } else if (status === 400) {
        toast.error(apiMessage || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
      } else {
        toast.error(apiMessage || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    items,
    formData,
    errors,
    paymentMethod,
    appliedVoucher,
    subtotal,
    shippingFee,
    discountAmount,
    finalAmount,
    isLoading: isSubmitting,
    isSubmitting,
    addresses,
    defaultAddress,
    isLoadingAddresses,
    isAuthenticated,
    createdOrderId,
    isPayOSModalOpen,
    setIsPayOSModalOpen,
    selectSavedAddress,
    handleChange,
    setPaymentMethod,
    setAppliedVoucher,
    handlePlaceOrder,
    updateQuantity,
    removeItem,
  };
};
