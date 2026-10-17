/**
 * Lenis Smooth Scroll provider for Gritmode
 * Wraps the entire app with inertial / smooth scroll rigging.
 */
import { useEffect, useRef, useState, createContext, useContext } from 'react';
import Lenis from 'lenis';

export const SmoothScrollContext = createContext(null);
export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const [lenisInstance, setLenisInstance] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis = null;
    let rafId = null;
    let removeVirtualScrollListener = null;

    const stopLenis = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      removeVirtualScrollListener?.();
      removeVirtualScrollListener = null;

      if (lenis) {
        lenis.destroy();
        lenis = null;
      }

      lenisRef.current = null;
      setLenisInstance(null);
      window.__lenis = null;
    };

    const startLenis = () => {
      if (motionPreference.matches || lenis) return;

      lenis = new Lenis({
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      lenisRef.current = lenis;
      setLenisInstance(lenis);
      window.__lenis = lenis;

      const raf = (time) => {
        rafId = null;
        if (!lenis) return;
        lenis.raf(time);
        if (lenis.isScrolling) {
          rafId = requestAnimationFrame(raf);
        }
      };

      const scheduleRaf = () => {
        if (rafId === null) {
          rafId = requestAnimationFrame(raf);
        }
      };

      removeVirtualScrollListener = lenis.on('virtual-scroll', scheduleRaf);
    };

    const handleMotionPreferenceChange = () => {
      if (motionPreference.matches) stopLenis();
      else startLenis();
    };

    startLenis();
    if (motionPreference.addEventListener) {
      motionPreference.addEventListener('change', handleMotionPreferenceChange);
    } else {
      motionPreference.addListener(handleMotionPreferenceChange);
    }

    return () => {
      if (motionPreference.removeEventListener) {
        motionPreference.removeEventListener('change', handleMotionPreferenceChange);
      } else {
        motionPreference.removeListener(handleMotionPreferenceChange);
      }
      stopLenis();
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={lenisInstance}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

