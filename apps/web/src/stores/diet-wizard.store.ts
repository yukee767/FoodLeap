import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DietAnswers, DietAnswerKey } from '@foodleap/shared-types';

type Answers = Partial<DietAnswers> & Record<string, unknown>;

interface DietWizardState {
  currentStep: number;
  answers: Answers;
  completed: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setAnswer: (key: DietAnswerKey, value: unknown) => void;
  setAnswers: (patch: Partial<Answers>) => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
  canProceed: (step: number) => boolean;
  progress: () => number;
}

export const useDietWizardStore = create<DietWizardState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      answers: {},
      completed: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setAnswer: (key, value) => set((s) => ({ answers: { ...s.answers, [key]: value } })),
      setAnswers: (patch) => set((s) => ({ answers: { ...s.answers, ...patch } })),
      next: () => set((s) => ({ currentStep: Math.min(15, s.currentStep + 1) })),
      prev: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),
      goTo: (step) => set({ currentStep: Math.min(15, Math.max(1, step)) }),
      reset: () => set({ currentStep: 1, answers: {}, completed: false }),
      canProceed: () => {
        const { currentStep, answers } = get();
        // basic required check; full zod validation done in hook
        const keyMap: Record<number, DietAnswerKey> = {
          1: 'goal',
          2: 'activity_level',
          3: 'restrictions',
          4: 'health_conditions',
          5: 'skill_level',
          6: 'routine_weekday',
          7: 'routine_weekend',
          8: 'time_available',
          9: 'cook_frequency',
          10: 'budget',
          11: 'favorite_protein',
          12: 'carbs',
          13: 'hated_ingredients',
          14: 'flavor',
          15: 'hardest_meal',
        };
        const key = keyMap[currentStep];
        const optional = [4, 10, 13, 14].includes(currentStep);
        if (optional) return true;
        const v = answers[key];
        if (Array.isArray(v)) return v.length > 0;
        return v !== undefined && v !== null && v !== '';
      },
      progress: () => Math.round((get().currentStep / 15) * 100),
    }),
    {
      name: 'foodleap:diet-wizard',
      partialize: (s) => ({ currentStep: s.currentStep, answers: s.answers, completed: s.completed }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      skipHydration: false,
    }
  )
);
