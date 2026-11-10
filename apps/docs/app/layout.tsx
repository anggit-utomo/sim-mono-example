import type { ReactNode } from 'react';
import DocsNav, { FooterText } from './docs-nav';
import { LocaleProvider } from './locale-provider';
import './global.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <nav className="nav">
            <strong>SyncSim Docs</strong>
            <DocsNav />
          </nav>
          <main className="main">{children}</main>
          <footer className="toolbar">
            <small>
              <FooterText />
            </small>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
