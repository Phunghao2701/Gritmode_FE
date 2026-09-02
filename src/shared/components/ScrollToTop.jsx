import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSmoothScroll } from './SmoothScrollProvider';

/**
 * ScrollToTop component
 * Ensures that whenever the route changes, the viewport automatically scrolls to the top (0, 0)
 * Works seamlessly with Lenis Smooth Scroll and standard browser window scrolling.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  const lenis = useSmoothScroll();

  useEffect(() => {
    // If navigating to a specific hash on the page, scroll to that element
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        if (lenis) {
          lenis.scrollTo(element, { offset: -80, immediate: false });
        } else {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
    }

    // Standard page navigation: instantly reset scroll position to top
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, hash, lenis]);

  return null;
}
