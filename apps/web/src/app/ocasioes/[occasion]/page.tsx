import { notFound } from 'next/navigation';
import { OCCASIONS, getOccasion } from '@/lib/occasions';
import type { Metadata } from 'next';

export const revalidate = 3600;

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ occasion: o.slug }));
}

export async function generateMetadata({ params }: { params: { occasion: string } }): Promise<Metadata> {
  const occ = getOccasion(params.occasion);
  if (!occ) return {};
  return { title: `${occ.titulo} | FoodLeap`, description: occ.descricao };
}

export default function OccasionDetailPage({ params }: { params: { occasion: string } }) {
  const occ = getOccasion(params.occasion);
  if (!occ) notFound();

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">{occ.titulo}</h1>
      <p className="text-muted-foreground">{occ.descricao}</p>
      <p className="mt-6 text-sm text-muted-foreground">Receitas com ?occasion={occ.slug} — buscar via GET /api/recipes?occasion={occ.slug} (tsvector GIN).</p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">Em breve grid filtrado.</div>
      </div>
    </div>
  );
}
