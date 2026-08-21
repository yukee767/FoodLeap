'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/receitas', label: 'Buscar', icon: Search },
  { href: '/dieta', label: 'Dieta', icon: ClipboardList },
  { href: '/ocasioes', label: 'Ocasiões', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-4">
        {TABS.map((t) => {
          const active = pathname === t.href;
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn('flex flex-col items-center justify-center gap-1 text-xs', active ? 'text-primary' : 'text-muted-foreground')}
            >
              <Icon className="h-5 w-5" />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
