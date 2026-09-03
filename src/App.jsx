import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/routes/AppRoutes';
import AppToast from './shared/components/AppToast';
import SmoothScrollProvider from './shared/components/SmoothScrollProvider';
import ScrollToTop from './shared/components/ScrollToTop';
import { tokenService } from './features/auth/services/token.service';
import { refreshTokenApi } from './features/auth/apis/auth.api';
import { useAuthStore } from './app/store/authStore';

/**
 * AuthInit — Khôi phục session khi App reload / khởi động.
 * Do Access Token nằm trong RAM và Refresh Token nằm trong HttpOnly Cookie,
 * khi reload trang AuthInit sẽ tự động gọi refresh để lấy lại access token và user info.
 * Phải gọi setInitialized(true) trong mọi trường hợp.
 */
function AuthInit() {
  useEffect(() => {
    const { loginSuccess, clearAuth, setInitialized, setAuthLoading } =
      useAuthStore.getState();

    const restore = async () => {
      setAuthLoading(true);
      try {
        // Tự động khôi phục session bằng HttpOnly cookie refresh_token
        const res = await refreshTokenApi();
        const data = res.data?.data;

        if (data?.access_token && data?.user) {
          tokenService.setAccessToken(data.access_token);
          loginSuccess(data.user);
        } else {
          tokenService.clearAllTokens();
          clearAuth();
        }
      } catch {
        // Chưa đăng nhập hoặc cookie refresh token hết hạn -> chuyển về trạng thái Guest
        tokenService.clearAllTokens();
        clearAuth();
      } finally {
        setAuthLoading(false);
        setInitialized(true);
        // Hydrate Cart from Backend (both User and Guest)
        import('./app/store/cartStore').then(({ useCartStore }) => {
          useCartStore.getState().fetchCart();
        });
      }
    };

    restore();
  }, []);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <SmoothScrollProvider>
        <ScrollToTop />
        <AppToast />
        <AuthInit />
        <AppRoutes />
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}

export default App;
