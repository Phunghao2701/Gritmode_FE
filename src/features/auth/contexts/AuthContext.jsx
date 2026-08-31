import { useTranslation } from "react-i18next";
import { t } from "i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\contexts\AuthContext.jsx
 */
import { createContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi, getProfileApi, loginGoogleApi, updateProfileApi, deleteAccountApi } from '../api/auth.api';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from '../../../shared/utils/toast';
import { useAuthStore } from '../../../app/store/authStore';
import { useNavigate } from 'react-router-dom';
export const AuthContext = createContext(null);
export function AuthProvider({
  children
}) {
  const { t: _t } = useTranslation();
  const [user, setUser] = useState(null);
  const [googleRedirect, setGoogleRedirect] = useState("/");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const loginSuccess = useAuthStore(state => state.loginSuccess);
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async codeResponse => {
      console.log(t("auth.maCodeNhanDuoc"), codeResponse.code);
      try {
        const result = await loginGoogleApi(codeResponse.code);
        const body = result.data;
        if (body.code == "GOOGLE_LOGIN_SUCCESS") {
          toast.success(t("auth.dangNhapThanhCong"));
          loginSuccess(body.data.token);
          navigate(googleRedirect, {
            replace: true
          });
        } else {
          toast.error(t("auth.dangNhapThatBai"));
        }
      } catch (error) {
        console.error(error);
        toast.error(t("auth.dangNhapThatBai"));
      }
    },
    onError: error => {
      console.error(error);
      toast.error(t("auth.dangNhapThatBai"));
    }
  });

  //=====================/Define Function/=====================/

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProfileApi();
      if (response.data && response.data.success !== false) {
        setUser(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Thực hiện gọi API đăng nhập và xử lý lưu trữ token.
   * 
   * Hàm này được bọc bởi `useCallback` để tránh tạo lại hàm trong các lần render. 
   * Các bước thực hiện:
   * 1. Gọi `loginApi` với `email` và `password`.
   * 2. Nếu API trả về thành công:
   *    - Lấy token từ response.
   *    - Nếu `remember` là true (Ghi nhớ đăng nhập): Lưu token vào `localStorage` (tồn tại lâu dài).
   *    - Nếu `remember` là false: Lưu token vào `sessionStorage` (mất khi đóng trình duyệt).
   *    - Gọi callback `loginSuccess` (từ zustand store) để cập nhật trạng thái đã đăng nhập vào global store.
   * 3. Nếu API trả về lỗi hoặc format không đúng: Ném ra lỗi và bắt tại khối `catch` để set state `error`.
   *
   * @async
   * @function login
   * @param {string} email - Địa chỉ email của người dùng.
   * @param {string} password - Mật khẩu của người dùng.
   * @param {boolean} remember - Cờ xác định có lưu trạng thái đăng nhập lâu dài không (true = localStorage, false = sessionStorage).
   * @param {Function} loginSuccess - Hàm callback từ AuthStore để cập nhật token vào global state.
   * @returns {Promise<Object>} Trả về object dữ liệu từ response của API (nếu thành công).
   * @throws {Error} Ném lỗi nếu quá trình đăng nhập thất bại (sai thông tin, lỗi mạng, v.v.).
   */
  const login = useCallback(async (email, password, remember) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginApi({
        email,
        password,
        remember
      });
      if (response.data && response.data.success !== false) {
        const token = response.data.data.token;
        if (token) {
          loginSuccess(token);
        }
        // setUser(userData || null);
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loginSuccess]);

  /**
  * Khởi chạy luồng đăng nhập bằng tài khoản Google (OAuth 2.0).
  * 
  * Hàm này thực hiện các công việc:
  * 1. Lưu lại đường dẫn mà người dùng muốn được điều hướng tới (`redirectTo`) vào state `googleRedirect` 
  *    để sử dụng sau khi xác thực Google thành công.
  * 2. Kích hoạt hàm `googleLogin()` (thường được cung cấp bởi thư viện `@`react-oauth/google``) 
  *    để mở popup hoặc chuyển hướng sang trang đăng nhập của Google.
  *
  * @function loginWithGoogle
  * @param {string} [redirectTo="/"] - (Tùy chọn) Đường dẫn sẽ chuyển hướng người dùng tới sau khi đăng nhập Google thành công. Mặc định là trang chủ `/`.
  * @param {Function} [loginSuccess] - (Tùy chọn) Hàm callback để xử lý sau khi lấy được token (lưu ý: hiện chưa được sử dụng trực tiếp trong thân hàm này, có thể đang được xử lý ở `onSuccess` của `useGoogleLogin`).
  * @returns {void} Hàm không trả về giá trị.
  */
  const loginWithGoogle = (redirectTo = "/") => {
    setGoogleRedirect(redirectTo);
    googleLogin();
  };
  const register = useCallback(async data => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerApi(data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const logout = useCallback(() => {
    setUser(null);
  }, []);
  const updateProfile = useCallback(async data => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateProfileApi(data);
      if (response.data && response.data.success !== false) {
        setUser(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Update profile failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const deleteAccount = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteAccountApi();
      if (response.data && response.data.success !== false) {
        logout();
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Delete account failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);
  useEffect(() => {
    if (!user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfile]);
  const value = {
    user,
    setUser,
    isLoading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    fetchProfile,
    updateProfile,
    deleteAccount
  };
  return <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>;
}