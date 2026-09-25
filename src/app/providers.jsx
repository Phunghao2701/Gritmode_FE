'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/services/queryClient';
import SmoothScrollProvider from '@/shared/components/SmoothScrollProvider';
import AppToast from '@/shared/components/AppToast';
import { tokenService } from '@/features/auth/services/token.service';
import { refreshTokenApi } from '@/features/auth/apis/auth.api';
import { useAuthStore } from '@/shared/store/authStore';

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
        import('@/shared/store/cartStore').then(({ useCartStore }) => {
          useCartStore.getState().fetchCart();
        });
      }
    };

    restore();
  }, []);

  return null;
}

export default function Providers({ children }) {
  const queryClient = getQueryClient();

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <SmoothScrollProvider>
          <AppToast />
          <AuthInit />
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
