import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { OCCASIONS } from '@/lib/occasions';

type Occasion = typeof OCCASIONS[number];

export function OccasionCard({ occasion }: { occasion: Occasion }) {
  return (
    <Link href={`/ocasioes/${occasion.slug}`}>
      <Card className="transition hover:shadow-md">
        <CardHeader>
          <CardTitle>{occasion.titulo}</CardTitle>
          <CardDescription>{occasion.descricao}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
