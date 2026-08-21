import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { QueryProvider } from '@/components/providers/query-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'FoodLeap - Receitas e Dieta Inteligente', template: '%s | FoodLeap' },
  description: 'Receitas diárias personalizadas e dieta integrada sem restrições malucas.',
  metadataBase: new URL(process.env.WEB_URL || 'http://localhost:3000'),
  openGraph: { type: 'website', locale: 'pt_BR', siteName: 'FoodLeap' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <QueryProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
          </div>
          <BottomNav />
        </QueryProvider>
      </body>
    </html>
  );
}
