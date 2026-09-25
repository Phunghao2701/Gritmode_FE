'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSmoothScroll } from './SmoothScrollProvider';

/**
 * ScrollToTop component
 * Ensures that whenever the route changes, the viewport automatically scrolls to the top (0, 0)
 * Works seamlessly with Lenis Smooth Scroll and standard browser window scrolling.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const lenis = useSmoothScroll();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, lenis]);

  return null;
}
