import { OCCASIONS } from '@/lib/occasions';
import { OccasionCard } from '@/components/occasion-card';

export const revalidate = 86400;

export default function OcasioesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">Ocasiões</h1>
      <p className="text-muted-foreground">12 coleções curadas — de Jantar Romântico a Marmita.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {OCCASIONS.map((o) => (
          <OccasionCard key={o.slug} occasion={o} />
        ))}
      </div>
    </div>
  );
}
