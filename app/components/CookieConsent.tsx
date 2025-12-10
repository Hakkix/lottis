'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  timestamp: number;
}

interface CookieConsentProps {
  onConsentChange?: (preferences: CookiePreferences) => void;
}

const STORAGE_KEY = 'tonttujahti-cookie-consent';

export default function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    timestamp: Date.now(),
  });

  useEffect(() => {
    // Check if user has already made a choice
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
        onConsentChange?.(parsed);
      } catch (e) {
        // Invalid stored data, show banner
        setShowBanner(true);
      }
    } else {
      // No consent given yet, show banner
      setShowBanner(true);
    }
  }, [onConsentChange]);

  const savePreferences = (prefs: CookiePreferences) => {
    const prefsWithTimestamp = {
      ...prefs,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsWithTimestamp));
    setPreferences(prefsWithTimestamp);
    setShowBanner(false);
    setShowSettings(false);
    onConsentChange?.(prefsWithTimestamp);
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      timestamp: Date.now(),
    });
  };

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      timestamp: Date.now(),
    });
  };

  const handleSaveSettings = () => {
    savePreferences(preferences);
  };

  return (
    <>
      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="mx-auto max-w-6xl rounded-2xl bg-gradient-to-r from-red-600 to-green-600 p-1 shadow-2xl">
              <div className="rounded-xl bg-white p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h2 className="mb-2 text-xl font-bold text-gray-900">
                      🍪 Evästeet
                    </h2>
                    <p className="text-sm text-gray-700 md:text-base">
                      Käytämme välttämättömiä evästeitä pelin toimivuuden varmistamiseksi
                      (kuten pisteiden tallentamiseen). Analytiikkaevästeet auttavat meitä
                      parantamaan peliä. Voit hallita asetuksiasi milloin tahansa.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Asetukset
                    </button>
                    <button
                      onClick={acceptEssential}
                      className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Vain välttämättömät
                    </button>
                    <button
                      onClick={acceptAll}
                      className="rounded-lg bg-gradient-to-r from-red-600 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
                    >
                      Hyväksy kaikki
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl bg-white p-6 md:p-8 shadow-2xl"
            >
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Evästeasetukset
              </h2>

              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="rounded-lg border-2 border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Välttämättömät evästeet
                      </h3>
                      <p className="text-sm text-gray-600">
                        Nämä evästeet ovat tarpeen pelin perustoimintojen,
                        kuten pisteiden tallentamisen ja pelin tilan säilyttämisen kannalta.
                        Näitä ei voi poistaa käytöstä.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <span className="text-2xl">✓</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="rounded-lg border-2 border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Analytiikkaevästeet
                      </h3>
                      <p className="text-sm text-gray-600">
                        Nämä evästeet auttavat meitä ymmärtämään, miten pelaajat käyttävät
                        peliä, jotta voimme parantaa sitä. Tiedot kerätään anonyymisti.
                      </p>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) =>
                            setPreferences({ ...preferences, analytics: e.target.checked })
                          }
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Tietosuojaseloste:</strong> Evästeet tallennetaan paikallisesti
                    laitteellesi. Emme jaa tietojasi kolmansille osapuolille ilman lupaasi.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Peruuta
                </button>
                <button
                  onClick={acceptEssential}
                  className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Vain välttämättömät
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="rounded-lg bg-gradient-to-r from-red-600 to-green-600 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105"
                >
                  Tallenna asetukset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook to check if analytics is enabled
export function useAnalyticsConsent(): boolean {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CookiePreferences;
          setAnalyticsEnabled(parsed.analytics);
        } catch {
          setAnalyticsEnabled(false);
        }
      }
    };

    checkConsent();

    // Listen for storage changes (for multi-tab sync)
    window.addEventListener('storage', checkConsent);
    return () => window.removeEventListener('storage', checkConsent);
  }, []);

  return analyticsEnabled;
}
