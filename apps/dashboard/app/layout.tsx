import type { ReactNode } from 'react';
import './global.css';

const NAV: Array<[string, string]> = [
  ['/', 'Overview'],
  ['/customers', 'Customers'],
  ['/queues', 'Queues'],
  ['/cron', 'Cron'],
  ['/ingests', 'Ingests'],
  ['/logs', 'Logs'],
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <strong>SyncSim</strong>
          {NAV.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <main className="main">{children}</main>
        <footer className="toolbar">
          <small>
            New here? Read the operator guide: <code>docs/user-guide.md</code> in the repo.
          </small>
        </footer>
      </body>
    </html>
  );
}
