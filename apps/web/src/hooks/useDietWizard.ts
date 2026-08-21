'use client';

import { useEffect } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDietWizardStore } from '@/stores/diet-wizard.store';
import { dietStepSchemas } from '@/lib/validators/diet';
import { DIET_QUESTIONS } from '@/lib/diet-questions';

export function useDietWizard() {
  const store = useDietWizardStore();
  const [stepParam, setStepParam] = useQueryState('step', parseAsInteger.withDefault(1));

  // sync store -> url
  useEffect(() => {
    if (!store._hasHydrated) return;
    if (store.currentStep !== stepParam) setStepParam(store.currentStep);
  }, [store.currentStep, store._hasHydrated, stepParam, setStepParam]);

  // sync url -> store (initial)
  useEffect(() => {
    if (!store._hasHydrated) return;
    if (stepParam !== store.currentStep && stepParam >= 1 && stepParam <= 15) {
      store.goTo(stepParam);
    }
  }, [stepParam, store._hasHydrated]);

  const question = DIET_QUESTIONS[store.currentStep - 1];
  const block = question.block;
  const schema = dietStepSchemas[store.currentStep];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { [question.key]: store.answers[question.key] } as Record<string, unknown>,
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset({ [question.key]: store.answers[question.key] } as Record<string, unknown>);
  }, [store.currentStep, question.key]);

  const progress = Math.round((store.currentStep / 15) * 100);

  const saveCurrent = async () => {
    const values = form.getValues() as Record<string, unknown>;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((i) => {
        const path = String(i.path[0] ?? question.key);
        form.setError(path as never, { message: i.message });
      });
      return false;
    }
    const key = question.key as string;
    store.setAnswer(key as never, parsed.data[key as never]);
    return true;
  };

  const next = async () => {
    const ok = await saveCurrent();
    if (!ok) return false;
    store.next();
    setStepParam(store.currentStep + 1 <= 15 ? store.currentStep + 1 : 15);
    return true;
  };

  const prev = () => {
    store.prev();
    setStepParam(store.currentStep - 1 >= 1 ? store.currentStep - 1 : 1);
  };

  const goTo = (step: number) => {
    store.goTo(step);
    setStepParam(step);
  };

  return {
    step: store.currentStep,
    question,
    block,
    form,
    answers: store.answers,
    progress,
    isFirst: store.currentStep === 1,
    isLast: store.currentStep === 15,
    canProceed: form.formState.isValid,
    next,
    prev,
    goTo,
    saveCurrent,
    _hasHydrated: store._hasHydrated,
  };
}
