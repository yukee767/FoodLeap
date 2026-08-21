'use client';

import { FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { BlockIndicator } from './BlockIndicator';
import { QuestionStep } from './QuestionStep';
import { useDietWizard } from '@/hooks/useDietWizard';
import { useCreateDietProfile } from '@/hooks/useDietPlan';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export function DietWizard() {
  const { step, question, block, form, progress, isFirst, isLast, next, prev, answers, _hasHydrated } = useDietWizard();
  const mutation = useCreateDietProfile();
  const router = useRouter();

  if (!_hasHydrated) return <Skeleton className="h-64 w-full" />;

  const handleNext = async () => {
    await next();
  };

  const handleSubmit = form.handleSubmit(async () => {
    const ok = await form.trigger();
    if (!ok) return;
    // coleta todas answers já no store + current
    const all = answers as Record<string, unknown>;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || localStorage.getItem('user_id') : null;
    const uid = userId || crypto.randomUUID();
    if (!userId) localStorage.setItem('userId', uid);
    try {
      await mutation.mutateAsync({ userId: uid, answers: all as never });
      router.push('/dieta/plano');
    } catch (e) {
      console.error(e);
    }
  });

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col gap-6">
        <ProgressBar value={progress} step={step} />
        <BlockIndicator currentBlock={block as 'A' | 'B' | 'C'} />
        <QuestionStep question={question as never} form={form as never} />

        <div className="mt-auto flex justify-between pt-6">
          <Button variant="ghost" onClick={prev} disabled={isFirst}>
            Voltar
          </Button>
          {isLast ? (
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Ver meu plano'}
            </Button>
          ) : (
            <Button onClick={handleNext}>Continuar</Button>
          )}
        </div>
        {mutation.isError && <p className="text-sm text-destructive">Erro ao salvar. Tente novamente.</p>}
      </div>
    </FormProvider>
  );
}
