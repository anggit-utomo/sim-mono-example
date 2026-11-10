import type { ReactNode } from 'react';
import './global.css';

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <strong>SyncSim Docs</strong>
          {NAV.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <main className="main">{children}</main>
        <footer className="toolbar">
          <small>
            Example views are not live data. Real dashboard: <code>http://localhost:3000</code>.
            Canonical source: <code>docs/user-guide.md</code>.
          </small>
        </footer>
      </body>
    </html>
  );
}
