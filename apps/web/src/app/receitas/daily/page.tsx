'use client';

import { useDaily } from '@/hooks/use-recipes';
import { RecipeGrid } from '@/components/recipe-grid';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DailyPage() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const { data, isLoading } = useDaily(userId || undefined);

  const recipes = data?.data ?? [];

  if (isLoading) return <div className="container py-8">Carregando receita do dia...</div>;

  if (!userId || recipes.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Receita do Dia</h1>
        <p className="text-muted-foreground">Personalizada via cache_used:daily até 00:00 BRT.</p>
        <div className="mt-6 rounded-xl border p-6">
          <p className="text-sm">Faça seu quiz de dieta para receber receita 100% personalizada.</p>
          <Link href="/dieta/onboarding?step=1" className="mt-3 inline-flex"><Button>Começar dieta</Button></Link>
        </div>
        <div className="mt-6"><RecipeGrid recipes={recipes} isLoading={isLoading} /></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">Receita do Dia — Para você</h1>
      <p className="text-sm text-muted-foreground">Cache 24h • {new Date().toLocaleDateString('pt-BR')}</p>
      <div className="mt-6"><RecipeGrid recipes={recipes} /></div>
    </div>
  );
}
