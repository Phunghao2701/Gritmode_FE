/* global process */
'use client';

import { useEffect, lazy, Suspense, useState } from 'react';
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
import {
  restorePersistedQueryCache,
  subscribeToPersistedQueryCache,
} from '@/shared/services/queryPersistence';

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

function CachePersistenceGate({ queryClient, children }) {
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    restorePersistedQueryCache(queryClient).finally(() => {
      if (!active) return;

      unsubscribe = subscribeToPersistedQueryCache(queryClient);
      setIsRestored(true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [queryClient]);

  if (!isRestored) {
    return <div className="min-h-screen bg-white dark:bg-black" aria-busy="true" />;
  }

  return children;
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
          <CachePersistenceGate queryClient={queryClient}>
            {children}
            {ReactQueryDevtools && (
              <Suspense fallback={null}>
                <ReactQueryDevtools initialIsOpen={false} />
              </Suspense>
            )}
          </CachePersistenceGate>
        </SmoothScrollProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
