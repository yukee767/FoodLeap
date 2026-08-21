import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Heart, Utensils } from 'lucide-react';

export default function Home() {
  return (
    <div className="container py-8 md:py-12">
      <section className="max-w-3xl">
        <Badge variant="secondary" className="mb-4">
          Novo • Dieta em 15 perguntas
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          FoodLeap <span className="text-primary">🍳</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Receitas diárias que se adaptam ao seu gosto. Práticas, saudáveis e sem neura.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/dieta">
            <Button size="lg">
              Começar dieta personalizada <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/receitas">
            <Button variant="outline" size="lg">
              Ver receitas
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" /> Receita do Dia
            </CardTitle>
            <CardDescription>Personalizada via /api/recipes/daily</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>cache_used:daily</Badge>
            <p className="mt-3 text-sm text-muted-foreground">Stale 24h até 00:00 BRT. TanStack Query + Redis.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" /> Jantar Romântico
            </CardTitle>
            <CardDescription>Filtro por ocasião</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">12 ocasiões</Badge>
            <p className="mt-3 text-sm text-muted-foreground">?occasion=romantico → tsvector pt-BR + GIN</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Sua Dieta
            </CardTitle>
            <CardDescription>15 perguntas → plano usuário + sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Zustand persist</Badge>
            <p className="mt-3 text-sm text-muted-foreground">Wizard nuqs + RHF+Zod, TTL 1h cache_used:diet:plan</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
