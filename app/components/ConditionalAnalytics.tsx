'use client';

import { Analytics } from '@vercel/analytics/next';
import { useCookieConsent } from './CookieConsentProvider';

export default function ConditionalAnalytics() {
  const { analyticsEnabled } = useCookieConsent();

  // Only render Analytics if user has consented
  if (!analyticsEnabled) {
    return null;
  }

  return <Analytics />;
}
