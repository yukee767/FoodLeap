import { DEFAULT_SCRAPE_OPTIONS, type ScrapeOptions } from '../types.js';

const ROBOTS_CACHE = new Map<string, { disallow: string[]; fetchedAt: number }>();

export async function politeFetch(
  url: string,
  opts: Required<ScrapeOptions>,
  attempt = 1,
): Promise<{ html: string; status: number; headers: Headers }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': opts.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!res.ok) {
      if (res.status === 429 || res.status >= 500) {
        if (attempt < 3) {
          const backoff = attempt * 2000 + Math.random() * 1000;
          await sleep(backoff);
          return politeFetch(url, opts, attempt + 1);
        }
      }
      throw new Error(`HTTP ${res.status} for ${url}`);
    }

    const html = await res.text();
    return { html, status: res.status, headers: res.headers };
  } finally {
    clearTimeout(timeout);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function jitterDelay(baseMs: number): number {
  return baseMs + Math.floor(Math.random() * 600) - 300;
}

export async function isAllowedByRobots(url: string, userAgent: string): Promise<boolean> {
  try {
    const u = new URL(url);
    const origin = `${u.protocol}//${u.host}`;
    const cached = ROBOTS_CACHE.get(origin);
    let disallows: string[] | null = cached?.disallow ?? null;

    if (!cached || Date.now() - cached.fetchedAt > 3600_000) {
      const robotsUrl = `${origin}/robots.txt`;
      const res = await fetch(robotsUrl, {
        headers: { 'User-Agent': userAgent },
        signal: AbortSignal.timeout(5000),
      }).catch(() => null as unknown as Response);
      if (res && res.ok) {
        const txt = await res.text();
        disallows = parseRobots(txt, userAgent);
      } else {
        disallows = [];
      }
      ROBOTS_CACHE.set(origin, { disallow: disallows, fetchedAt: Date.now() });
    }

    if (!disallows || disallows.length === 0) return true;
    const path = u.pathname + u.search;
    for (const d of disallows) {
      if (d === '/') return false;
      if (d && path.startsWith(d)) return false;
      if (d.includes('*')) {
        const pat = d.replace(/\*/g, '');
        if (pat && path.includes(pat)) return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

function parseRobots(txt: string, _ua: string): string[] {
  const lines = txt.split('\n');
  const disallows: string[] = [];
  let currentAgents: string[] = [];
  let inRelevantSection = false;

  for (const raw of lines) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const [keyRaw, ...valParts] = line.split(':');
    const key = keyRaw.trim().toLowerCase();
    const val = valParts.join(':').trim();

    if (key === 'user-agent') {
      currentAgents = val.split(/\s+/).map((s) => s.trim());
      inRelevantSection = currentAgents.includes('*');
    } else if (key === 'disallow' && inRelevantSection) {
      if (val) disallows.push(val);
    }
  }
  return disallows;
}

export async function fetchSitemapUrls(
  sitemapUrl: string,
  opts: Required<ScrapeOptions>,
  maxUrls = 5000,
): Promise<string[]> {
  const { html: xml } = await politeFetch(sitemapUrl, opts);
  const locMatches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
  const isIndex = sitemapUrl.includes('sitemap.xml') || locMatches.some((u) => u.endsWith('.xml') && u.includes('sitemap'));
  if (isIndex && locMatches.length > 0 && locMatches[0].endsWith('.xml')) {
    const tail = locMatches.slice(-20);
    const used = locMatches.length < 20 ? locMatches : tail;
    const urls: string[] = [];
    for (const sub of used) {
      await sleep(jitterDelay(300));
      try {
        const subUrls = await fetchSitemapUrls(sub, opts, Math.ceil(maxUrls / used.length));
        urls.push(...subUrls);
        if (urls.length >= maxUrls) break;
      } catch {}
    }
    return urls.slice(0, maxUrls);
  }
  const filtered = locMatches.filter((u) => {
    const l = u.toLowerCase();
    return (
      l.includes('/receita') ||
      l.includes('/receitas') ||
      l.endsWith('.ghtml') ||
      l.endsWith('.html')
    );
  });
  return filtered.slice(0, maxUrls);
}
