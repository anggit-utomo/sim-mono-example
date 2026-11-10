'use client';

import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Locale = 'en' | 'id';

export type Ctx = { locale: Locale; setLocale: (l: Locale) => void };

export const LocaleCtx = createContext<Ctx>({ locale: 'en', setLocale: () => {} });

const KEY = 'docs-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'id' || saved === 'en') setLocaleState(saved);
    } catch {
      // storage unavailable (private mode) — stay on default
    }
  }, []);
  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale: (l) => {
        setLocaleState(l);
        try {
          localStorage.setItem(KEY, l);
        } catch {
          // ignore — choice just won't persist
        }
      },
    }),
    [locale],
  );
  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}
