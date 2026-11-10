'use client';

import { usePathname } from 'next/navigation';

export default function CounterpartLink() {
  const path = usePathname();
  const isId = path === '/id' || path.startsWith('/id/');
  const other = isId ? path.slice(3) || '/' : `/id${path === '/' ? '' : path}`;
  return isId ? (
    <span>
      {' · '}English version: <a href={other}>read in English</a>
    </span>
  ) : (
    <span>
      {' · '}Versi Indonesia: <a href={other}>baca dalam Bahasa Indonesia</a>
    </span>
  );
}
