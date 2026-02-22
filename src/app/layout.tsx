import type { Metadata } from "next";
import Link from 'next/link';
import "./globals.css";

export const metadata: Metadata = {
  title: "Yuzuru Platform",
  description: "いらないものを人に譲るプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <header className="app-header">
          <div className="container" style={{ padding: '0', display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div className="app-logo">🎁 Yuzuru</div>
            </Link>
          </div>
        </header>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
