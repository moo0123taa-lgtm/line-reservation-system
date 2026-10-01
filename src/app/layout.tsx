import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LINE予約システム',
  description: 'LINE公式アカウントから24時間空き状況を確認して予約できるWeb予約システム',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
