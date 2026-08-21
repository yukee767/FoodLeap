import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { Recipe } from '@foodleap/shared-types';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/receitas/${recipe.slug}`}>
      <Card className="overflow-hidden transition hover:shadow-lg">
        <div className="h-40 w-full bg-muted" />
        <CardHeader>
          <CardTitle className="line-clamp-1 text-base">{recipe.title}</CardTitle>
          <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{recipe.prep_time_min} min</Badge>
          <Badge variant="secondary">{recipe.difficulty}</Badge>
          <Badge>{recipe.protein_main}</Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
