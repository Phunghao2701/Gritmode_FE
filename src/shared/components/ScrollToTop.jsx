'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSmoothScroll } from './SmoothScrollProvider';

export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lenis = useSmoothScroll();
  const navigationKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [navigationKey, lenis]);

  return null;
}
