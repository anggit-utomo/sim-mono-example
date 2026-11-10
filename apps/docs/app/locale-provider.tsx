'use client';

import { createContext, useMemo, useState, type ReactNode } from 'react';

export type Locale = 'en' | 'id';

export type Ctx = { locale: Locale; setLocale: (l: Locale) => void };

export const LocaleCtx = createContext<Ctx>({ locale: 'en', setLocale: () => {} });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}
