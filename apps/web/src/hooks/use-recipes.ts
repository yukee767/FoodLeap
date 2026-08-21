'use client';

import { useQuery } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api-client';

export function useRecipes(filters: Record<string, string | undefined>) {
  const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => !!v));
  return useQuery<any>({
    queryKey: queryKeys.recipes.list(clean),
    queryFn: () => api.get('/recipes', { params: clean }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  } as never);
}

export function useRecipe(slugOrId?: string) {
  return useQuery({
    queryKey: slugOrId ? queryKeys.recipes.detail(slugOrId) : ['recipes', 'detail', 'none'],
    queryFn: () => api.get(`/recipes/${slugOrId}`).then((r) => r.data),
    enabled: !!slugOrId,
    staleTime: 60 * 60 * 1000,
  });
}

export function useDaily(userId?: string) {
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: queryKeys.recipes.daily(userId ?? 'anon', today),
    queryFn: () => api.get('/recipes/daily', { headers: userId ? { 'x-user-id': userId } : {} }).then((r) => r.data),
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
