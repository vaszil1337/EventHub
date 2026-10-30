import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Locale, TranslationDictionary } from '../locales/types';
import { en } from '../locales/en';
import { hu } from '../locales/hu';
import { setClientLanguage } from '../services/apiClient';

export const LANGUAGE_STORAGE_KEY = 'eventhub_language';

const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  hu,
};

export interface I18nContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'hu' || stored === 'en') {
        return stored;
      }
    }
  } catch {
    // ignore
  }
  return 'en';
}

function resolveNestedKey(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return Object.entries(params).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val)),
    text
  );
}

export interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale || getInitialLocale());

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setClientLanguage(newLocale);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    setClientLanguage(locale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useMemo(() => {
    return (path: string, params?: Record<string, string | number>): string => {
      const dict = dictionaries[locale] || dictionaries.en;
      const found = resolveNestedKey(dict, path);
      if (found !== undefined) {
        return interpolate(found, params);
      }
      // Fallback to English dictionary if not found in current locale
      const fallback = resolveNestedKey(dictionaries.en, path);
      if (fallback !== undefined) {
        return interpolate(fallback, params);
      }
      return path;
    };
  }, [locale]);

  const value = useMemo<I18nContextType>(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
