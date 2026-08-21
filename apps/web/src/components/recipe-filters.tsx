'use client';

import { useQueryState, parseAsString } from 'nuqs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OCCASIONS } from '@/lib/occasions';

export function RecipeFilters() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [occasion, setOccasion] = useQueryState('occasion', parseAsString.withDefault(''));
  const [time, setTime] = useQueryState('time', parseAsString.withDefault(''));

  const clear = () => {
    setQ(null);
    setOccasion(null);
    setTime(null);
  };

  const hasFilters = !!q || !!occasion || !!time;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Buscar receita..." value={q ?? ''} onChange={(e) => setQ(e.target.value || null)} className="max-w-xs" />
        <select value={occasion ?? ''} onChange={(e) => setOccasion(e.target.value || null)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">Ocasião</option>
          {OCCASIONS.map((o) => (
            <option key={o.slug} value={o.slug}>{o.titulo}</option>
          ))}
        </select>
        <select value={time ?? ''} onChange={(e) => setTime(e.target.value || null)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">Tempo</option>
          <option value="15min">Até 15min</option>
          <option value="30min">Até 30min</option>
          <option value="45min">Até 45min</option>
        </select>
        {hasFilters && <Button variant="ghost" onClick={clear}>Limpar</Button>}
      </div>
      {hasFilters && (
        <div className="flex gap-2">
          {occasion && <Badge variant="secondary">{occasion}</Badge>}
          {time && <Badge variant="secondary">{time}</Badge>}
          {q && <Badge>{q}</Badge>}
        </div>
      )}
    </div>
  );
}
