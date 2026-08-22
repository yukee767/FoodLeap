import { z } from 'zod';

export const SourceSiteSchema = z.enum([
  'panelinha',
  'globo',
  'tudogostoso',
  'cozinha_da_lo',
]);
export type SourceSite = z.infer<typeof SourceSiteSchema>;

export const ScrapedIngredientSchema = z.object({
  raw: z.string(),
  name: z.string(),
  quantity: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
});
export type ScrapedIngredient = z.infer<typeof ScrapedIngredientSchema>;

export const ScrapedRecipeSchema = z.object({
  source_url: z.string().url(),
  source_site: SourceSiteSchema,
  source_id: z.string().nullable().optional(),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().nullable().optional(),
  ingredients: z.array(ScrapedIngredientSchema),
  ingredients_text: z.array(z.string()),
  steps: z.array(z.string()),
  instructions: z.string(),
  prep_time_min: z.number().int().positive().nullable().optional(),
  cook_time_min: z.number().int().positive().nullable().optional(),
  total_time_min: z.number().int().positive().nullable().optional(),
  servings: z.number().int().positive().nullable().optional(),
  difficulty: z.enum(['facil', 'medio', 'dificil']).nullable().optional(),
  cover_url: z.string().url().nullable().optional(),
  images: z.array(z.string().url()).optional().default([]),
  author: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  occasions: z.array(z.string()).optional().default([]),
  nutrition: z.record(z.string()).nullable().optional(),
  raw_jsonld: z.any().nullable().optional(),
  raw_html_hash: z.string().nullable().optional(),
  content_hash: z.string(),
  language: z.string().default('pt-BR'),
  scraped_at: z.string(),
});

export type ScrapedRecipe = z.infer<typeof ScrapedRecipeSchema>;

export interface DiscoverResult {
  url: string;
  site: SourceSite;
  lastmod?: string;
  via: 'sitemap' | 'listing' | 'seed' | 'manual';
}

export interface ScrapeOptions {
  concurrency?: number;
  delayMs?: number;
  maxPages?: number;
  timeoutMs?: number;
  userAgent?: string;
  respectRobots?: boolean;
  includeRawHtml?: boolean;
}

export interface ScrapeStats {
  discovered: number;
  fetched: number;
  parsed: number;
  failed: number;
  skipped_robots: number;
  duration_ms: number;
}

export const DEFAULT_SCRAPE_OPTIONS: Required<ScrapeOptions> = {
  concurrency: 3,
  delayMs: 1500,
  maxPages: 200,
  timeoutMs: 15000,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 FoodLeapBot/0.1 (+https://foodleap.com.br/bot)',
  respectRobots: true,
  includeRawHtml: false,
};
