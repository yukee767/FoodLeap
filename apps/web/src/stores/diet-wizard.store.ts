import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Answers = Record<string, unknown>;

interface DietWizardState {
  currentStep: number; // 1..15
  answers: Answers;
  setAnswer: (key: string, value: unknown) => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export const useDietWizardStore = create<DietWizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      answers: {},
      setAnswer: (key, value) => set((s) => ({ answers: { ...s.answers, [key]: value } })),
      next: () => set((s) => ({ currentStep: Math.min(15, s.currentStep + 1) })),
      prev: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),
      goTo: (step) => set({ currentStep: step }),
      reset: () => set({ currentStep: 1, answers: {} }),
    }),
    { name: 'foodleap:diet-wizard' }
  )
);
