'use client';

import { Suspense } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { useRecipes } from '@/hooks/use-recipes';
import { RecipeGrid } from '@/components/recipe-grid';
import { RecipeFilters } from '@/components/recipe-filters';

function ReceitasContent() {
  const [q] = useQueryState('q', parseAsString.withDefault(''));
  const [occasion] = useQueryState('occasion', parseAsString.withDefault(''));
  const [time] = useQueryState('time', parseAsString.withDefault(''));

  const { data, isLoading } = useRecipes({ q: q || undefined, occasion: occasion || undefined, time: time || undefined });

  const recipes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <RecipeFilters />
      <RecipeGrid recipes={recipes} isLoading={isLoading} />
    </div>
  );
}

export default function ReceitasPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">Receitas</h1>
      <p className="text-muted-foreground">Encontre por ocasião, tempo e dieta. ISR 60s + tsvector.</p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <ReceitasContent />
        </Suspense>
      </div>
    </div>
  );
}
