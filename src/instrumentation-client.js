import * as Sentry from '@sentry/nextjs';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:8000/api/v1';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  tracePropagationTargets: [/^\/api(?:\/|$)/, apiBaseUrl],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
