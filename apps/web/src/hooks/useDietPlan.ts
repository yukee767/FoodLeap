'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api-client';
import type { DietAnswers } from '@foodleap/shared-types';

export function useCreateDietProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; answers: DietAnswers }) => api.post('/diet/profile', payload).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.diet.plan(vars.userId) });
      qc.invalidateQueries({ queryKey: ['recipes', 'daily'] });
    },
  });
}

export function useDietPlan(userId?: string) {
  return useQuery({
    queryKey: userId ? queryKeys.diet.plan(userId) : ['diet', 'plan', 'anon'],
    queryFn: () => api.get(`/diet/plan/${userId}`).then((r) => r.data),
    enabled: !!userId,
    staleTime: 60 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useDietQuestions() {
  return useQuery({
    queryKey: queryKeys.diet.questions(),
    queryFn: () => api.get('/diet/questions').then((r) => r.data.questions),
    staleTime: Infinity,
  });
}
