import axios from 'axios';

// Em dev: /api via rewrites (next.config.mjs -> localhost)
// Em prod (Cloudflare Workers): NEXT_PUBLIC_API_MAIN_URL aponta para https://foodleap-api.../api
const API_BASE = process.env.NEXT_PUBLIC_API_MAIN_URL || '/api';
const SEARCH_BASE = process.env.NEXT_PUBLIC_SEARCH_SERVICE_URL || '/api/search';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: API_BASE.startsWith('http') ? false : true, // cross-origin não usa cookies
  timeout: 10000,
});

export const searchApi = axios.create({
  baseURL: SEARCH_BASE,
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
