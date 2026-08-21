'use client';

import { useQuery } from '@tanstack/react-query';
import { searchApi, queryKeys } from '@/lib/api-client';
import { useDebounce } from './use-debounce';

export function useSearch(q: string, occasion?: string) {
  const debounced = useDebounce(q, 300);
  return useQuery({
    queryKey: queryKeys.search(debounced, occasion),
    queryFn: () => searchApi.get('', { params: { q: debounced, occasion } }).then((r) => r.data),
    enabled: debounced.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
