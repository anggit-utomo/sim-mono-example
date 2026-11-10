'use client';

import { usePathname } from 'next/navigation';

const NAV: Array<[string, string]> = [
  ['/', 'Overview'],
  ['/customers', 'Customers'],
  ['/queues', 'Queues'],
  ['/cron', 'Cron'],
  ['/ingests', 'Ingests'],
  ['/logs', 'Logs'],
  ['/walkthrough', 'Walkthrough'],
  ['/troubleshooting', 'Troubleshooting'],
  ['/flows', 'Flows'],
  ['/architecture', 'Architecture'],
];

function counterpart(path: string): { other: string; isId: boolean } {
  if (path === '/id' || path.startsWith('/id/')) {
    const rest = path === '/id' ? '/' : path.slice(3);
    return { other: rest === '' ? '/' : rest, isId: true };
  }
  return { other: path === '/' ? '/id' : `/id${path}`, isId: false };
}

export default function DocsNav() {
  const path = usePathname();
  const { other, isId } = counterpart(path);
  const href = (h: string) => (isId ? (h === '/' ? '/id' : `/id${h}`) : h);
  return (
    <>
      {NAV.map(([h, label]) => (
        <a key={h} href={href(h)}>
          {label}
        </a>
      ))}
      <span>
        {isId ? <strong>ID</strong> : <a href={other}>ID</a>}
        {' | '}
        {isId ? <a href={other}>EN</a> : <strong>EN</strong>}
      </span>
    </>
  );
}
