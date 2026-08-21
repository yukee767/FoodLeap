import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { jsonLdRecipe, jsonLdBreadcrumb } from '@/lib/seo';
import { Badge } from '@/components/ui/badge';

export const revalidate = 3600;

async function fetchRecipe(slug: string) {
  const base = process.env.API_MAIN_URL || 'http://localhost:3001';
  const res = await fetch(`${base}/api/recipes/${slug}`, { next: { revalidate: 3600, tags: ['recipe', slug] } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const recipe = await fetchRecipe(params.slug);
  if (!recipe) return { title: 'Receita não encontrada' };
  return {
    title: `${recipe.title} | FoodLeap`,
    description: recipe.description?.slice(0, 155),
    alternates: { canonical: `/receitas/${recipe.slug ?? params.slug}` },
    openGraph: { images: recipe.cover_url ? [recipe.cover_url] : undefined, type: 'article' },
  };
}

export default async function ReceitaDetailPage({ params }: { params: { slug: string } }) {
  const recipe = await fetchRecipe(params.slug);
  if (!recipe) notFound();

  const jlRecipe = jsonLdRecipe(recipe);
  const jlBread = jsonLdBreadcrumb([{ name: 'Receitas', item: '/receitas' }, { name: recipe.title }]);

  return (
    <div className="container py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jlRecipe) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jlBread) }} />
      <div className="h-64 w-full rounded-xl bg-muted" />
      <h1 className="mt-6 text-3xl font-bold">{recipe.title}</h1>
      <p className="mt-2 text-muted-foreground">{recipe.description}</p>
      <div className="mt-4 flex gap-2">
        <Badge>{recipe.prep_time_min} min</Badge>
        <Badge variant="secondary">{recipe.difficulty}</Badge>
        <Badge variant="outline">{recipe.protein_main}</Badge>
      </div>
      <div className="prose mt-8 max-w-none">
        <p className="text-sm text-muted-foreground">Instruções e ingredientes virão do backend (cache_used:recipe:{id} TTL 1h).</p>
      </div>
    </div>
  );
}
