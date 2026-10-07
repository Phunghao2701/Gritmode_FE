/* global process */

const normalizeSiteUrl = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return `${/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`}`.replace(/\/+$/, '');
};

/**
 * Resolve the canonical public URL for metadata routes.
 * Vercel provides its deployment URLs automatically, while local builds keep
 * using the frontend development URL when NEXT_PUBLIC_SITE_URL is absent.
 */
export const getSiteUrl = () => {
  const configuredUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredUrl) return configuredUrl;

  const vercelProductionUrl = normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercelProductionUrl) return vercelProductionUrl;

  const vercelDeploymentUrl = normalizeSiteUrl(process.env.VERCEL_URL);
  if (vercelDeploymentUrl) return vercelDeploymentUrl;

  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000';

  // Keeps metadata generation fail-safe while Vercel environment variables
  // are being configured. Set NEXT_PUBLIC_SITE_URL to the real domain.
  return 'https://gritmode-fe.vercel.app';
};
