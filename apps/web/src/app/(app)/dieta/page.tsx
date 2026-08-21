'use client';

import Link from 'next/link';
import { useDietPlan } from '@/hooks/useDietPlan';
import { useDietWizardStore } from '@/stores/diet-wizard.store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function DietaPage() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const { data, isLoading, isError } = useDietPlan(userId || undefined);
  const store = useDietWizardStore();

  if (isLoading && userId) return <Skeleton className="h-40 w-full" />;

  const hasPlan = !!data?.meals && data.meals.length > 0;
  const hasDraft = Object.keys(store.answers).length > 0;

  if (hasPlan) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Sua Dieta</h1>
        <p className="text-muted-foreground">Semana {data.week_start}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {data.meals.map((m: { day: number; meal_type: string; recipe: { title: string } }, i: number) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-sm">{m.meal_type}</CardTitle>
                <CardDescription>{m.recipe?.title ?? 'Receita'}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Link href="/dieta/plano"><Button>Ver plano completo</Button></Link>
          <Link href="/dieta/onboarding?step=1"><Button variant="outline" onClick={() => store.reset()}>Refazer questionário</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Badge variant="secondary">Dieta personalizada</Badge>
      <h1 className="mt-2 text-3xl font-bold">Monte sua dieta em 2 minutos</h1>
      <p className="mt-2 text-muted-foreground">15 perguntas rápidas sobre objetivo, rotina e paladar. Resultado: plano usuário + sistema.</p>

      {hasDraft && (
        <Card className="mt-6 border-primary/50">
          <CardHeader>
            <CardTitle>Continuar de onde parou</CardTitle>
            <CardDescription>Pergunta {store.currentStep} de 15</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dieta/onboarding?step=${store.currentStep}`}><Button>Continuar</Button></Link>
          </CardContent>
        </Card>
      )}

      {isError && <p className="mt-4 text-sm text-muted-foreground">Você ainda não tem plano. Comece agora!</p>}

      <div className="mt-8 flex gap-3">
        <Link href="/dieta/onboarding?step=1"><Button size="lg">Começar agora • 15 perguntas</Button></Link>
        <Link href="/dieta/plano"><Button variant="outline">Ver plano (demo)</Button></Link>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>A • Objetivo</CardTitle><CardDescription>Q1-5: meta, restrições, condição</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>B • Rotina</CardTitle><CardDescription>Q6-10: tempo, frequência, orçamento</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>C • Paladar</CardTitle><CardDescription>Q11-15: proteínas, sabores, aversões</CardDescription></CardHeader></Card>
      </div>
    </div>
  );
}
