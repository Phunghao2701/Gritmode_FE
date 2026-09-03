/**
 * useAuth Hook — Gritmode Passwordless Email OTP
 *
 * Tất cả business logic authentication tập trung tại đây.
 * Component không được tự gọi API auth, tự lưu token, hay tự cập nhật user.
 *
 * Actions:
 *  - requestOtp(email)        → Gửi OTP đến Email
 *  - verifyOtp(email, otp)    → Xác thực OTP, login/create user
 *  - logout()                 → Đăng xuất
 *  - restoreAuth()            → Khôi phục session khi App reload
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../../shared/utils/toast';
import { useAuthStore } from '../../../app/store/authStore';
import { useOtpStore } from '../store/otpStore';
import { useCartStore } from '../../../app/store/cartStore';
import {
  requestOtpApi,
  verifyOtpApi,
  logoutApi,
  getMeApi,
} from '../apis/auth.api';
import { tokenService } from '../services/token.service';
import { clearPrivateQueryCache } from '../../../shared/services/queryClient';

export default function useAuth() {
  const navigate = useNavigate();

  // Auth store
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const { setInitialized, setAuthLoading, clearAuth } =
    useAuthStore.getState();

  // OTP store
  const otpState = useOtpStore((s) => s);
  const {
    setOtpRequested,
    setRequesting,
    setVerifying,
    setError: setOtpError,
    resetOtp,
  } = useOtpStore.getState();

  // Cart store (cho guest token)
  const { clearGuestToken } = useCartStore.getState();

  // -------------------------------------------------------
  // REQUEST OTP
  // -------------------------------------------------------
  const requestOtp = useCallback(
    async (email) => {
      if (otpState.isRequesting) return;

      setRequesting(true);
      setOtpError(null);

      try {
        const res = await requestOtpApi(email);
        const expiredIn = res.data?.data?.expired_in ?? 300;

        setOtpRequested({ email, expiredIn });
        toast.success('Mã OTP đã được gửi đến email của bạn!');
        return { success: true, expiredIn };
      } catch (err) {
        const status = err.response?.status;
        let msg;

        if (status === 429) {
          msg = 'Bạn đã gửi OTP quá nhiều lần. Vui lòng thử lại sau.';
        } else if (status === 400) {
          msg = 'Email không hợp lệ. Vui lòng kiểm tra lại.';
        } else {
          msg = err.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.';
        }

        setOtpError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setRequesting(false);
      }
    },
    [otpState.isRequesting, setRequesting, setOtpError, setOtpRequested]
  );

  // -------------------------------------------------------
  // VERIFY OTP
  // -------------------------------------------------------
  const verifyOtp = useCallback(
    async (email, otp, redirectPath = '/') => {
      if (otpState.isVerifying) return;

      setVerifying(true);
      setOtpError(null);

      try {
        // Gửi guest_token nếu có để BE merge Cart
        const currentGuestToken = useCartStore.getState().guestToken;
        const res = await verifyOtpApi({
          email,
          otp,
          guest_token: currentGuestToken || undefined,
        });

        const data = res.data?.data;
        const { access_token, user: userData } = data;

        // Lưu tokens
        tokenService.setTokens({ access_token });

        // Cập nhật auth state — user data từ BE, không tự set role/status
        useAuthStore.getState().loginSuccess(userData);

        // Xóa OTP state tạm
        resetOtp();

        // Nếu có guest token → refetch cart từ BE (BE đã merge), rồi clear guest token
        if (currentGuestToken) {
          try {
            // Trigger refetch cart — import động để tránh circular dependency
            const cartModule = await import('../../cart/apis/cart.api');
            if (cartModule.getCartApi) {
              await cartModule.getCartApi();
              useCartStore.getState().clearCart?.();
              // Cart state sẽ được managed bởi cart feature hooks, đây chỉ clear guest
            }
          } catch {
            // Cart refetch fail không ảnh hưởng authentication
          }
          clearGuestToken();
        }

        const isNewUser = data.is_new_user;
        if (isNewUser) {
          toast.success('Chào mừng bạn đến với Gritmode! Hãy cập nhật thông tin cá nhân.');
        } else {
          toast.success('Đăng nhập thành công! Chào mừng bạn quay trở lại.');
        }

        navigate(redirectPath, { replace: true });
        return { success: true, isNewUser };
      } catch (err) {
        const status = err.response?.status;
        let msg;

        if (status === 401) {
          msg = 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.';
        } else if (status === 403) {
          msg = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.';
          // Không set authenticated, không clear guest token
        } else if (status === 429) {
          msg = 'Bạn đã thử OTP quá nhiều lần. Vui lòng yêu cầu OTP mới.';
        } else {
          msg = err.response?.data?.message || 'Xác thực thất bại. Vui lòng thử lại.';
        }

        setOtpError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setVerifying(false);
      }
    },
    [otpState.isVerifying, setVerifying, setOtpError, resetOtp, clearGuestToken, navigate]
  );

  // -------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Dù API lỗi vẫn phải clear local state
    } finally {
      clearPrivateQueryCache();
      tokenService.clearAllTokens();
      clearAuth();
      toast.info('Đã đăng xuất tài khoản.');
      navigate('/login');
    }
  }, [clearAuth, navigate]);

  // -------------------------------------------------------
  // RESTORE AUTH (khi App reload)
  // -------------------------------------------------------
  const restoreAuth = useCallback(async () => {
    setAuthLoading(true);

    try {
      // Luôn thử restore vì HttpOnly refresh cookie không thể được JS đọc.
      // Gọi /auth/me với access token hiện tại
      // api interceptor sẽ tự refresh nếu access token expired
      const res = await getMeApi();
      const userData = res.data?.data;

      if (userData) {
        useAuthStore.getState().loginSuccess(userData);
      }
    } catch {
      // Session invalid → Guest mode
      tokenService.clearAllTokens();
      clearAuth();
    } finally {
      setAuthLoading(false);
      setInitialized(true);
    }
  }, [setAuthLoading, setInitialized, clearAuth]);

  return {
    // State
    user,
    isAuthenticated,
    isInitialized,
    isAuthLoading,

    // OTP State
    otpState,

    // Actions
    requestOtp,
    verifyOtp,
    logout,
    restoreAuth,
  };
}
