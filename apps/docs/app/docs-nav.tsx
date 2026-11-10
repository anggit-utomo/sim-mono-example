'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { LocaleCtx } from './locale-provider';
import { useT, useTa } from './locale-hooks';

const HREFS = [
  '/',
  '/customers',
  '/queues',
  '/cron',
  '/ingests',
  '/logs',
  '/walkthrough',
  '/troubleshooting',
  '/flows',
  '/architecture',
];

export function LocaleToggle() {
  const { locale, setLocale } = useContext(LocaleCtx);
  return (
    <span>
      <button disabled={locale === 'id'} onClick={() => setLocale('id')}>
        ID
      </button>
      {' | '}
      <button disabled={locale === 'en'} onClick={() => setLocale('en')}>
        EN
      </button>
    </span>
  );
}

export function FooterText() {
  return (
    <>
      {useT('ft_1')} <code>http://localhost:3000</code>. {useT('ft_2')} <code>docs/user-guide.md</code>.
    </>
  );
}

export default function DocsNav() {
  const labels = useTa('nav');
  return (
    <>
      {HREFS.map((h, i) => (
        <Link key={h} href={h}>
          {labels[i] ?? h}
        </Link>
      ))}
      <LocaleToggle />
    </>
  );
}
