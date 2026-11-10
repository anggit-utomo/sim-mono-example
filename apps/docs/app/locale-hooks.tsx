'use client';

import { useContext } from 'react';
import { LocaleCtx, type Locale } from './locale-provider';
import en from './en.json';
import id from './id.json';

type V = string | string[] | string[][] | { b: string; t: string }[];

const dicts: Record<Locale, Record<string, V>> = {
  en: en as Record<string, V>,
  id: id as Record<string, V>,
};

// Per-key fallback: a missing, blank, or empty Indonesian value resolves to
// English, so one translator slip blanks nothing. A key missing in both
// locales yields undefined and each hook falls back to its empty value.
function pick(locale: Locale, key: string): V | undefined {
  const enV = dicts.en[key] as V | undefined;
  if (locale === 'en') return enV;
  const idV = dicts.id[key] as V | undefined;
  if (idV === undefined) return enV;
  if (typeof idV === 'string') return idV.trim() ? idV : enV;
  if (Array.isArray(idV)) return idV.length > 0 ? idV : enV;
  return enV;
}

function resolve<T>(locale: Locale, key: string, guard: (v: unknown) => v is T, fallback: T): T {
  const v = pick(locale, key);
  if (guard(v)) return v;
  if (locale !== 'en') {
    const e: unknown = dicts.en[key];
    if (guard(e)) return e;
  }
  return fallback;
}

const isStr = (v: unknown): v is string => typeof v === 'string';
const isStrArr = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');
const isMatrix = (v: unknown): v is string[][] => Array.isArray(v) && v.every((x) => Array.isArray(x));
const isPairs = (v: unknown): v is { b: string; t: string }[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'object' && x !== null && !Array.isArray(x));

export function useT(key: string): string {
  const { locale } = useContext(LocaleCtx);
  return resolve(locale, key, isStr, '');
}

export function useTa(key: string): string[] {
  const { locale } = useContext(LocaleCtx);
  return resolve(locale, key, isStrArr, []);
}

export function useTm(key: string): string[][] {
  const { locale } = useContext(LocaleCtx);
  return resolve(locale, key, isMatrix, []);
}

export function useTp(key: string): { b: string; t: string }[] {
  const { locale } = useContext(LocaleCtx);
  return resolve(locale, key, isPairs, []);
}
