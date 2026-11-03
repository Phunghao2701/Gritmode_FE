'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'gritmode:scroll-positions:v1';
const MAX_SAVED_ROUTES = 50;
const SAVE_DELAY_MS = 120;
const RESTORE_RETRY_MS = 50;
const MAX_RESTORE_ATTEMPTS = 100;

const getRouteKey = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

const getScrollY = () => {
  const lenisScroll = window.__lenis?.scroll;
  return Number.isFinite(lenisScroll) ? lenisScroll : window.scrollY;
};

const readPositions = () => {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const savePosition = (routeKey, scrollY) => {
  try {
    const positions = readPositions();
    positions[routeKey] = { y: scrollY, savedAt: Date.now() };

    const recentPositions = Object.entries(positions)
      .sort(([, first], [, second]) => (second?.savedAt || 0) - (first?.savedAt || 0))
      .slice(0, MAX_SAVED_ROUTES);

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(recentPositions)));
  } catch {
    // Scroll restoration should never block navigation when storage is unavailable.
  }
};

const getSavedPosition = (routeKey) => {
  const value = Number(readPositions()[routeKey]?.y);
  return Number.isFinite(value) && value > 0 ? value : null;
};

export default function ScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingRestoreKeyRef = useRef(null);
  const pendingRestoreFrameRef = useRef(null);
  const restorePositionRef = useRef(null);
  const lastRouteKeyRef = useRef(null);
  const routeKey = `${pathname}${searchParams.toString() ? `?${searchParams}` : ''}`;

  useLayoutEffect(() => {
    let saveTimer = null;
    let restoreTimer = null;
    let userInteracted = false;

    const cancelRestore = () => {
      window.clearTimeout(restoreTimer);
    };

    const flushCurrentPosition = () => {
      window.clearTimeout(saveTimer);
      savePosition(getRouteKey(), getScrollY());
    };

    const scheduleSave = () => {
      const routeKeyAtScroll = getRouteKey();
      const scrollYAtScroll = getScrollY();
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(
        () => savePosition(routeKeyAtScroll, scrollYAtScroll),
        SAVE_DELAY_MS,
      );
    };

    const restorePosition = (routeKeyToRestore) => {
      const savedY = getSavedPosition(routeKeyToRestore);
      if (savedY === null) return;

      cancelRestore();
      userInteracted = false;
      let attempts = 0;

      const attemptRestore = () => {
        if (userInteracted) return;

        const documentHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body?.scrollHeight || 0,
        );
        const maxScrollY = Math.max(0, documentHeight - window.innerHeight);

        if (maxScrollY + 2 < savedY && attempts < MAX_RESTORE_ATTEMPTS) {
          attempts += 1;
          restoreTimer = window.setTimeout(attemptRestore, RESTORE_RETRY_MS);
          return;
        }

        const targetY = Math.min(savedY, maxScrollY);
        window.__lenis?.scrollTo(targetY, { immediate: true, force: true });
        window.scrollTo({ top: targetY, left: 0, behavior: 'auto' });
      };

      // Run in the layout phase. Delaying this until a timer/RAF paints the page
      // at scrollY=0 first, then visibly jumps to the saved position.
      attemptRestore();
    };
    restorePositionRef.current = restorePosition;

    const handleScroll = () => scheduleSave();
    const handlePageHide = () => flushCurrentPosition();
    const handlePopState = () => {
      const destinationKey = getRouteKey();
      window.__gritmodeScrollRestoreCancelled = false;
      pendingRestoreKeyRef.current = destinationKey;

      if (pendingRestoreFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingRestoreFrameRef.current);
      }

      // The pathname/search-param layout effect normally runs on the same
      // navigation. This frame is a fallback for hash-only/history changes.
      pendingRestoreFrameRef.current = window.requestAnimationFrame(() => {
        pendingRestoreFrameRef.current = null;
        if (pendingRestoreKeyRef.current === destinationKey) {
          restorePosition(destinationKey);
        }
      });
    };
    const handleUserIntent = () => {
      userInteracted = true;
      window.__gritmodeScrollRestoreCancelled = true;
      cancelRestore();
      pendingRestoreKeyRef.current = null;
      if (pendingRestoreFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingRestoreFrameRef.current);
        pendingRestoreFrameRef.current = null;
      }
    };

    window.history.scrollRestoration = 'manual';
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('wheel', handleUserIntent, { passive: true });
    window.addEventListener('touchmove', handleUserIntent, { passive: true });
    window.addEventListener('keydown', handleUserIntent);

    const navigationType = performance.getEntriesByType('navigation')[0]?.type;
    const earlyRestoreWasCancelled = window.__gritmodeScrollRestoreCancelled === true;
    window.__gritmodeScrollRestoreCancelled = false;
    if (
      !earlyRestoreWasCancelled &&
      (navigationType === 'reload' || navigationType === 'back_forward')
    ) {
      restorePosition(getRouteKey());
    }

    return () => {
      window.clearTimeout(saveTimer);
      cancelRestore();
      if (pendingRestoreFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingRestoreFrameRef.current);
        pendingRestoreFrameRef.current = null;
      }
      restorePositionRef.current = null;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('wheel', handleUserIntent);
      window.removeEventListener('touchmove', handleUserIntent);
      window.removeEventListener('keydown', handleUserIntent);
    };
  }, []);

  useLayoutEffect(() => {
    const currentRouteKey = getRouteKey();
    const previousRouteKey = lastRouteKeyRef.current;
    lastRouteKeyRef.current = routeKey;

    // The initial render may be a reload/back navigation; leave its viewport
    // to the saved-position restoration instead of treating it as a new page.
    if (previousRouteKey === null || previousRouteKey === routeKey) return;

    const pendingKey = pendingRestoreKeyRef.current;
    if (pendingKey === currentRouteKey) {
      pendingRestoreKeyRef.current = null;
      if (pendingRestoreFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingRestoreFrameRef.current);
        pendingRestoreFrameRef.current = null;
      }

      restorePositionRef.current?.(pendingKey);
      return;
    }

    // Normal link/router navigation starts at the top. Only browser history
    // traversal restores a previously saved position.
    window.__lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [routeKey]);

  return null;
}
