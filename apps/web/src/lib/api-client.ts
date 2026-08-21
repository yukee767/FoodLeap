import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const queryKeys = {
  recipes: {
    daily: (userId: string, date: string) => ['recipes', 'daily', userId, date] as const,
    detail: (id: string) => ['recipes', id] as const,
    list: (filters: Record<string, unknown>) => ['recipes', 'list', filters] as const,
  },
  search: (q: string, occasion?: string) => ['search', q, occasion] as const,
  diet: {
    questions: () => ['diet', 'questions'] as const,
    plan: (userId: string) => ['diet', 'plan', userId] as const,
  },
} as const;
