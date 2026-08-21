import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { QueryProvider } from '@/components/providers/query-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const viewport: Viewport = {
  themeColor: '#ff6b00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  title: { default: 'FoodLeap - Receitas e Dieta Inteligente', template: '%s | FoodLeap' },
  description: 'Receitas diárias personalizadas e dieta integrada sem restrições malucas.',
  metadataBase: new URL(process.env.WEB_URL || 'http://localhost:3000'),
  applicationName: 'FoodLeap',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'FoodLeap',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  openGraph: { type: 'website', locale: 'pt_BR', siteName: 'FoodLeap' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <QueryProvider>
          <NuqsAdapter>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
            </div>
            <BottomNav />
            <PWAInstallPrompt />
          </NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  );
}
