import pLimit from 'p-limit';
import { BaseAdapter } from '../adapters/base.js';
import { PanelinhaAdapter } from '../adapters/panelinha.js';
import { TudoGostosoAdapter } from '../adapters/tudogostoso.js';
import { GloboAdapter } from '../adapters/globo.js';
import { CozinhaDaLoAdapter } from '../adapters/cozinhadalo.js';
import { politeFetch, isAllowedByRobots, sleep, jitterDelay } from '../utils/fetch.js';
import type { DiscoverResult, ScrapedRecipe, ScrapeOptions, ScrapeStats, SourceSite } from '../types.js';
import { DEFAULT_SCRAPE_OPTIONS } from '../types.js';
import { discoverUrls } from './discover.js';

export const adapters: BaseAdapter[] = [
  new PanelinhaAdapter(),
  new TudoGostosoAdapter(),
  new GloboAdapter(),
  new CozinhaDaLoAdapter(),
];

export function getAdapterForUrl(url: string): BaseAdapter | null {
  return adapters.find((a) => a.canHandle(url)) ?? null;
}

export interface IngestResult {
  url: string;
  site: SourceSite;
  success: boolean;
  recipe?: ScrapedRecipe;
  error?: string;
  status?: number;
  skipped_robots?: boolean;
}

export async function scrapeUrls(
  targets: DiscoverResult[] | string[],
  opts: ScrapeOptions = {},
): Promise<{ results: IngestResult[]; stats: ScrapeStats }> {
  const o = { ...DEFAULT_SCRAPE_OPTIONS, ...opts };
  const limit = pLimit(o.concurrency);
  const normalized: DiscoverResult[] = targets.map((t) => {
    if (typeof t === 'string') {
      const site = (getAdapterForUrl(t)?.site ?? 'panelinha') as SourceSite;
      return { url: t, site, via: 'manual' };
    }
    return t;
  });
  const start = Date.now();
  let fetched = 0;
  let parsed = 0;
  let failed = 0;
  let skipped_robots = 0;
  const results: IngestResult[] = [];
  const tasks = normalized.map((target) =>
    limit(async () => {
      const adapter = getAdapterForUrl(target.url);
      if (!adapter) {
        failed++;
        const r: IngestResult = { url: target.url, site: target.site, success: false, error: 'No adapter for URL' };
        results.push(r);
        return r;
      }
      if (o.respectRobots) {
        const allowed = await isAllowedByRobots(target.url, o.userAgent);
        if (!allowed) {
          skipped_robots++;
          const r: IngestResult = { url: target.url, site: target.site, success: false, error: 'Blocked by robots.txt', skipped_robots: true };
          results.push(r);
          return r;
        }
      }
      await sleep(jitterDelay(o.delayMs / 2));
      try {
        const { html, status } = await politeFetch(target.url, o);
        fetched++;
        const recipe = adapter.extract(target.url, html);
        if (!recipe.title || recipe.ingredients.length === 0 || recipe.steps.length === 0) {
          console.warn(`[scrape] ${target.url} -> missing fields title:${!!recipe.title} ing:${recipe.ingredients.length} steps:${recipe.steps.length}`);
        }
        parsed++;
        const r: IngestResult = { url: target.url, site: adapter.site, success: true, recipe, status };
        results.push(r);
        return r;
      } catch (e) {
        failed++;
        const r: IngestResult = { url: target.url, site: adapter.site, success: false, error: (e as Error).message };
        results.push(r);
        return r;
      }
    }),
  );
  await Promise.all(tasks);
  const stats: ScrapeStats = { discovered: normalized.length, fetched, parsed, failed, skipped_robots, duration_ms: Date.now() - start };
  return { results, stats };
}

export async function discoverAndScrape(
  sites: SourceSite[] = ['panelinha', 'tudogostoso', 'globo', 'cozinha_da_lo'],
  opts: ScrapeOptions = {},
): Promise<{ results: IngestResult[]; stats: ScrapeStats; discovered: DiscoverResult[] }> {
  const discovered = await discoverUrls(sites, opts);
  const { results, stats } = await scrapeUrls(discovered, opts);
  return { results, stats, discovered };
}
