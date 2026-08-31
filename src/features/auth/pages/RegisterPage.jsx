import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../../../shared/components/InputField';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import { useAuthStore } from '../../../app/store/authStore';
import { toast } from '../../../shared/utils/toast';
import api from '../../../shared/services/api';
import AuthLayout from '../../../app/layouts/AuthLayout';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.email) newErrors.email = 'Vui lòng nhập địa chỉ email';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      const data = res.data?.data || res.data;
      loginSuccess(data.token, data.user);
      toast.success('Đăng ký tài khoản thành công!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Tạo tài khoản mới
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Đăng ký để nhận voucher giảm 20% cho đơn hàng đầu tiên
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Họ và tên"
            name="fullName"
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            icon="solar:user-linear"
            required
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon="solar:letter-linear"
            required
          />

          <InputField
            label="Mật khẩu"
            name="password"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon="solar:lock-password-linear"
            required
          />

          <InputField
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon="solar:lock-check-linear"
            required
          />

          <PrimaryButton
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-lg shadow-brand-500/25"
          >
            Đăng ký tài khoản
          </PrimaryButton>
        </form>

        <p className="text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}