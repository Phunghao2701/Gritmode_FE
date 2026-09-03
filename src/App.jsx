import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/routes/AppRoutes';
import AppToast from './shared/components/AppToast';
import SmoothScrollProvider from './shared/components/SmoothScrollProvider';
import ScrollToTop from './shared/components/ScrollToTop';
import { tokenService } from './features/auth/services/token.service';
import { getMeApi } from './features/auth/apis/auth.api';
import { useAuthStore } from './app/store/authStore';

/**
 * AuthInit — Khôi phục session khi App reload.
 * Tách thành component riêng để dùng hooks trong BrowserRouter context nếu cần.
 * Phải gọi setInitialized(true) trong mọi trường hợp.
 */
function AuthInit() {
  useEffect(() => {
    const { isAuthenticated, loginSuccess, clearAuth, setInitialized, setAuthLoading } =
      useAuthStore.getState();

    const restore = async () => {
      setAuthLoading(true);
      try {
        if (!isAuthenticated) return;

        // Luôn thử restore vì HttpOnly refresh cookie không thể được JS đọc.
        // Interceptor sẽ refresh access token khi /auth/me trả về 401.
        const res = await getMeApi();
        const userData = res.data?.data;

        if (userData) {
          loginSuccess(userData);
        } else {
          tokenService.clearAllTokens();
          clearAuth();
        }
      } catch {
        // Session không hợp lệ hoặc refresh thất bại
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
