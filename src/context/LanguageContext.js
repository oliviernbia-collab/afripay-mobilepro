import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n, { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../i18n';

const STORAGE_KEY = 'afripay_pro_language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      let next = DEFAULT_LANGUAGE;
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
          next = stored;
        } else {
          const deviceTag = Localization.getLocales?.()[0]?.languageCode;
          if (deviceTag && SUPPORTED_LANGUAGES.includes(deviceTag)) next = deviceTag;
        }
      } catch {
        // best-effort — falls back to DEFAULT_LANGUAGE
      }
      await i18n.changeLanguage(next);
      setLanguageState(next);
      setReady(true);
    })();
  }, []);

  const setLanguage = useCallback(async (next) => {
    if (!SUPPORTED_LANGUAGES.includes(next)) return;
    await i18n.changeLanguage(next);
    setLanguageState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // best-effort persistence — language still applies for this session
    }
  }, []);

  const value = useMemo(() => ({ language, setLanguage, ready }), [language, setLanguage, ready]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
