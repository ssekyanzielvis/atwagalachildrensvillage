'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Client component that tracks page views automatically
 * Add this to the root layout
 */
export default function AnalyticsTracker() {
  useAnalytics();
  return null;
}
