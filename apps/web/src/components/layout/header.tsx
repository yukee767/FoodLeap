import Link from 'next/link';
import { Search, ChefHat, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV = [
  { href: '/receitas', label: 'Receitas' },
  { href: '/ocasioes', label: 'Ocasiões' },
  { href: '/dieta', label: 'Dieta' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          FoodLeap
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV.map((i) => (
            <Link key={i.href} href={i.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/receitas" aria-label="Buscar">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dieta" className="hidden sm:inline-flex">
            <Button size="sm">Começar dieta</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
