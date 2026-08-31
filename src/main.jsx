/**
 * File: main.jsx
 * Gritmode E-Commerce Frontend Entry Point
 */
import { lazy, StrictMode, Suspense } from 'react';
import './shared/i18n/i18n';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import {
  queryClient,
  localStoragePersister,
  shouldPersistQuery,
} from './shared/services/queryClient';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((module) => ({
      default: module.ReactQueryDevtools,
    })))
  : null;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: localStoragePersister,
          maxAge: 1000 * 60 * 60 * 24, // 24h cache
          buster: 'v2-no-admin-cache',
          dehydrateOptions: {
            shouldDehydrateQuery: shouldPersistQuery,
          },
        }}
      >
        <App />
        {ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </PersistQueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
