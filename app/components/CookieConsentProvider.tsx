'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  timestamp: number;
}

interface CookieConsentContextType {
  preferences: CookiePreferences | null;
  updatePreferences: (prefs: CookiePreferences) => void;
  hasConsent: boolean;
  analyticsEnabled: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const STORAGE_KEY = 'tonttujahti-cookie-consent';

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
        setHasConsent(true);
      } catch (e) {
        console.error('Failed to parse cookie preferences:', e);
      }
    }

    // Listen for storage changes (multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as CookiePreferences;
          setPreferences(parsed);
          setHasConsent(true);
        } catch (err) {
          console.error('Failed to parse cookie preferences from storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updatePreferences = (prefs: CookiePreferences) => {
    setPreferences(prefs);
    setHasConsent(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  };

  const analyticsEnabled = preferences?.analytics ?? false;

  return (
    <CookieConsentContext.Provider
      value={{ preferences, updatePreferences, hasConsent, analyticsEnabled }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
