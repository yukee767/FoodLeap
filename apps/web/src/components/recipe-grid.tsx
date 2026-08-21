import { RecipeCard } from './recipe-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Recipe } from '@foodleap/shared-types';

export function RecipeGrid({ recipes, isLoading }: { recipes?: Recipe[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }
  if (!recipes || recipes.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma receita encontrada. Tente outros filtros.</p>;
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}
