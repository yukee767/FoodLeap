#!/usr/bin/env tsx
import { discoverUrls } from './pipeline/discover.js';
import { scrapeUrls } from './pipeline/ingest.js';
import type { SourceSite } from './types.js';
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
function getArg(name: string, fallback?: string): string | undefined {
  const idx = args.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (idx === -1) return fallback;
  const val = args[idx];
  if (val.includes('=')) return val.split('=')[1];
  return args[idx + 1] ?? fallback;
}
async function main() {
  const siteArg = getArg('site');
  const urlsArg = getArg('urls');
  const outArg = getArg('out', './scraped.json');
  const limitArg = getArg('limit', '10');
  const concurrencyArg = getArg('concurrency', '3');
  let targets: string[] = [];
  if (urlsArg) targets = urlsArg.split(',').map((s) => s.trim()).filter(Boolean);
  const sites: SourceSite[] | undefined = siteArg ? (siteArg.split(',').map((s) => s.trim()) as SourceSite[]) : undefined;
  if (targets.length > 0) {
    console.log(`[cli] Scraping ${targets.length} URLs directly...`);
    const { results, stats } = await scrapeUrls(targets, { concurrency: parseInt(concurrencyArg!), maxPages: parseInt(limitArg!) });
    console.log('[cli] stats', stats);
    writeFileSync(outArg!, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`[cli] Wrote ${results.length} results to ${outArg}`);
    const ok = results.filter((r) => r.success).length;
    console.log(`[cli] Success: ${ok}/${results.length}`);
  } else {
    console.log(`[cli] Discovering for sites: ${sites?.join(',') ?? 'all'}`);
    const discovered = await discoverUrls(sites, { maxPages: parseInt(limitArg!), concurrency: parseInt(concurrencyArg!) });
    console.log(`[cli] Discovered ${discovered.length} urls`);
    console.log(discovered.slice(0, 20).map((d) => `[${d.site}:${d.via}] ${d.url}`).join('\n'));
    if (discovered.length === 0) { console.log('[cli] No urls discovered, exiting'); return; }
    const toScrape = discovered.slice(0, parseInt(limitArg!));
    console.log(`[cli] Scraping ${toScrape.length} ...`);
    const { results, stats } = await scrapeUrls(toScrape, { concurrency: parseInt(concurrencyArg!) });
    console.log('[cli] stats', stats);
    writeFileSync(outArg!, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`[cli] Wrote ${results.length} to ${outArg}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
