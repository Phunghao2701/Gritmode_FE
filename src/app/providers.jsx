/* global process */
'use client';

import { useEffect, lazy, Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  getQueryClient,
  subscribeToQueryInvalidation,
} from '@/shared/services/queryClient';
import SmoothScrollProvider from '@/shared/components/SmoothScrollProvider';
import ScrollToTop from '@/shared/components/ScrollToTop';
import AppToast from '@/shared/components/AppToast';
import { tokenService } from '@/features/auth/services/token.service';
import { refreshTokenApi } from '@/features/auth/apis/auth.api';
import { useAuthStore } from '@/shared/store/authStore';
import { invalidateCriticalQueries } from '@/shared/services/cachePolicy';

const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID || '';

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? lazy(() =>
        import('@tanstack/react-query-devtools').then((module) => ({
          default: module.ReactQueryDevtools,
        }))
      )
    : null;

function AuthInit() {
  useEffect(() => {
    const { loginSuccess, clearAuth, setInitialized, setAuthLoading } =
      useAuthStore.getState();

    const restore = async () => {
      setAuthLoading(true);
      try {
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
        tokenService.clearAllTokens();
        clearAuth();
      } finally {
        setAuthLoading(false);
        setInitialized(true);
        // Do not fetch cart on admin routes
        const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
        if (!isAdminPath) {
          import('@/shared/store/cartStore').then(({ useCartStore }) => {
            useCartStore.getState().fetchCart();
          });
        }
      }
    };

    restore();
  }, []);

  return null;
}

function CacheLifecycle() {
  const queryClient = getQueryClient();

  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) invalidateCriticalQueries(queryClient);
    };

    const unsubscribeFromCacheSync = subscribeToQueryInvalidation((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      unsubscribeFromCacheSync();
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [queryClient]);

  return null;
}

export default function Providers({ children }) {
  const queryClient = getQueryClient();

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <SmoothScrollProvider>
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
          <AppToast />
          <AuthInit />
          <CacheLifecycle />
          {children}
          {ReactQueryDevtools && (
            <Suspense fallback={null}>
              <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
          )}
        </SmoothScrollProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
