import type { ReactNode } from 'react';
import CounterpartLink from './counterpart-link';
import DocsNav from './docs-nav';
import './global.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <strong>SyncSim Docs</strong>
          <DocsNav />
        </nav>
        <main className="main">{children}</main>
        <footer className="toolbar">
          <small>
            Example views are not live data. Real dashboard: <code>http://localhost:3000</code>.
            Canonical source: <code>docs/user-guide.md</code>.
            <CounterpartLink />
          </small>
        </footer>
      </body>
    </html>
  );
}
