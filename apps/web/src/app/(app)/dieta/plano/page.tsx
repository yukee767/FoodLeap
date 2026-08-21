'use client';

import Link from 'next/link';
import { useDietPlan } from '@/hooks/useDietPlan';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PlanoPage() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const { data, isLoading, isError, refetch } = useDietPlan(userId || undefined);

  if (isLoading) return <div className="container py-8"><Skeleton className="h-64 w-full" /></div>;

  if (isError || !data) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Você ainda não tem plano</h1>
        <p className="mt-2 text-muted-foreground">Responda 15 perguntas e gere sua semana pronta.</p>
        <Link href="/dieta/onboarding?step=1" className="mt-6 inline-flex"><Button>Criar meu plano</Button></Link>
      </div>
    );
  }

  const week = data.week_start ? format(new Date(data.week_start), "EEEE, d 'de' MMMM", { locale: ptBR }) : data.week_start;

  if (!data.meals || data.meals.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Seu plano</h1>
        <p className="text-muted-foreground">Semana {week}</p>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Em breve suas refeições</CardTitle>
            <CardDescription>Backend retorna meals:[] até implementar scoring. Suas respostas foram salvas com sucesso!</CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => refetch()}>Recarregar</Button>
          <Link href="/dieta/onboarding?step=1"><Button variant="outline">Editar respostas</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">Dieta Programada</h1>
      <p className="text-muted-foreground">Semana de {week}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {data.meals.map((m: { day: number; meal_type: string; recipe_id: string }, i: number) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm">{m.meal_type}</CardTitle>
              <CardDescription>Dia {m.day} • {m.recipe_id}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => refetch()}>Gerar nova semana</Button>
        <Link href="/dieta/onboarding?step=1"><Button variant="outline">Editar respostas</Button></Link>
      </div>
    </div>
  );
}
