'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackAction } from '@/lib/analytics';

/**
 * Analytics tracking hook
 * Add this to the root layout to track all page views automatically
 */
export function useAnalytics() {
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    // Don't track admin pages
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Track page view
    if (pathname) {
      trackAction.pageView(pathname);
    }
  }, [pathname]);
}

export default useAnalytics;
