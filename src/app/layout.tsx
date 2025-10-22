import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'QSM-H - Monitoramento de Humor',
  description: 'Questionário Semanal de Monitoramento de Humor para pacientes com transtornos de humor',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QSM-H',
  },
};

export const viewport: Viewport = {
  themeColor: '#4a69bd',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={nunito.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
