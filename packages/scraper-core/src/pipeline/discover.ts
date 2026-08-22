import { fetchSitemapUrls, sleep, jitterDelay } from '../utils/fetch.js';
import type { DiscoverResult, ScrapeOptions, SourceSite } from '../types.js';
import { DEFAULT_SCRAPE_OPTIONS } from '../types.js';

export interface SiteConfig {
  site: SourceSite;
  origins: string[];
  sitemaps?: string[];
  listingUrls?: string[];
  seedUrls?: string[];
  maxPerSite?: number;
}

export const SITE_CONFIGS: Record<SourceSite, SiteConfig> = {
  panelinha: {
    site: 'panelinha',
    origins: ['https://panelinha.com.br'],
    sitemaps: ['https://panelinha.com.br/sitemap.xml'],
    listingUrls: ['https://panelinha.com.br/receitas', 'https://panelinha.com.br/busca?query=&page=1'],
    seedUrls: [
      'https://panelinha.com.br/receita/bolo-de-cenoura-com-cobertura-de-chocolate',
      'https://panelinha.com.br/receita/arroz-branco-soltinho',
      'https://panelinha.com.br/receita/feijoada',
      'https://panelinha.com.br/receita/strogonoff-de-frango-tradicional',
      'https://panelinha.com.br/receita/pao-de-queijo',
      'https://panelinha.com.br/receita/bolo-de-laranja',
      'https://panelinha.com.br/receita/bolo-gelado-de-coco',
    ],
    maxPerSite: 300,
  },
  globo: {
    site: 'globo',
    origins: ['https://receitas.globo.com'],
    sitemaps: ['https://receitas.globo.com/sitemap/receitas/sitemap.xml'],
    listingUrls: ['https://receitas.globo.com/tipos-de-prato/bolos/', 'https://receitas.globo.com/tipos-de-prato/carnes/', 'https://receitas.globo.com/tipos-de-prato/massas/'],
    seedUrls: [
      'https://receitas.globo.com/tipos-de-prato/bolos/bolo-de-cenoura-4e837a33a1dcc9e0b0000004f.ghtml',
      'https://receitas.globo.com/tipos-de-prato/carnes/receita-de-estrogonofe-de-carne.ghtml',
    ],
    maxPerSite: 300,
  },
  tudogostoso: {
    site: 'tudogostoso',
    origins: ['https://www.tudogostoso.com.br'],
    sitemaps: ['https://www.tudogostoso.com.br/sitemap.xml', 'https://www.tudogostoso.com.br/sitemap-pt-br.xml'],
    listingUrls: ['https://www.tudogostoso.com.br/categorias/1000-bolos-e-tortas-doces', 'https://www.tudogostoso.com.br/categorias/1004-carnes', 'https://www.tudogostoso.com.br/categorias/1028-massas'],
    seedUrls: [
      'https://www.tudogostoso.com.br/receita/23-bolo-de-cenoura.html',
      'https://www.tudogostoso.com.br/receita/2462-strogonoff-de-frango.html',
      'https://www.tudogostoso.com.br/receita/31593-pudim-de-leite-condensado.html',
      'https://www.tudogostoso.com.br/receita/876-lasanha-de-carne-moida.html',
    ],
    maxPerSite: 400,
  },
  cozinha_da_lo: {
    site: 'cozinha_da_lo',
    origins: ['https://www.cozinhadalo.com.br'],
    sitemaps: ['https://www.cozinhadalo.com.br/wp-sitemap.xml', 'https://www.cozinhadalo.com.br/wp-sitemap-posts-post-1.xml'],
    listingUrls: ['https://www.cozinhadalo.com.br/receitas/'],
    seedUrls: [
      'https://www.cozinhadalo.com.br/2023/06/07/torta-de-limao-a-preferida/',
      'https://www.cozinhadalo.com.br/2022/03/27/pudim-de-leite-condensado/',
      'https://www.cozinhadalo.com.br/2021/08/30/pao-caseiro-o-famoso-pao-da-vo-atualizado/',
    ],
    maxPerSite: 200,
  },
};

export async function discoverUrls(
  sites: SourceSite[] = ['panelinha', 'tudogostoso', 'globo', 'cozinha_da_lo'],
  opts: ScrapeOptions = {},
): Promise<DiscoverResult[]> {
  const o = { ...DEFAULT_SCRAPE_OPTIONS, ...opts };
  const results: DiscoverResult[] = [];
  const seen = new Set<string>();
  for (const site of sites) {
    const cfg = SITE_CONFIGS[site];
    if (!cfg) continue;
    if (cfg.sitemaps) {
      for (const sm of cfg.sitemaps) {
        try {
          const urls = await fetchSitemapUrls(sm, o, cfg.maxPerSite ?? 200);
          for (const u of urls) {
            if (!seen.has(u)) {
              seen.add(u);
              results.push({ url: u, site, via: 'sitemap' });
            }
          }
          console.log(`[discover:${site}] sitemap ${sm} => ${urls.length} urls`);
          if (results.filter((r) => r.site === site).length >= (cfg.maxPerSite ?? 200)) break;
        } catch (e) {
          console.warn(`[discover:${site}] sitemap failed ${sm}: ${(e as Error).message}`);
        }
        await sleep(jitterDelay(400));
      }
    }
    const countForSite = results.filter((r) => r.site === site).length;
    if (countForSite < 10 && cfg.seedUrls) {
      for (const u of cfg.seedUrls) {
        if (!seen.has(u)) {
          seen.add(u);
          results.push({ url: u, site, via: 'seed' });
        }
      }
      console.log(`[discover:${site}] added ${cfg.seedUrls.length} seed urls`);
    }
    await sleep(jitterDelay(300));
  }
  return results.slice(0, o.maxPages);
}

export async function discoverForSite(site: SourceSite, opts: ScrapeOptions = {}): Promise<DiscoverResult[]> {
  return discoverUrls([site], opts);
}
