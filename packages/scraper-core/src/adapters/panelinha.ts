import * as cheerio from 'cheerio';
import { BaseAdapter } from './base.js';
import type { ScrapedRecipe } from '../types.js';
import { normalizeWhitespace, parseTimeToMinutes, mapDifficulty, extractServings } from '../utils/hash.js';

export class PanelinhaAdapter extends BaseAdapter {
  readonly site = 'panelinha' as const;
  readonly origin = 'https://panelinha.com.br';
  readonly name = 'Panelinha';
  canHandle(url: string): boolean { return url.includes('panelinha.com.br'); }
  extract(url: string, html: string): ScrapedRecipe {
    const $ = cheerio.load(html);
    const title = $('h1.headerRecipeImageH1').first().text().trim() || $('h1.tH2').first().text().trim() || $('meta[property="og:title"]').attr('content')?.trim() || $('title').text().trim();
    const description = $('p.tSt3').first().text().trim() || $('meta[name="description"]').attr('content')?.trim() || $('meta[property="og:description"]').attr('content')?.trim() || null;
    const base = this.baseNormalize({ url, html, fallbackTitle: title, fallbackDescription: description });
    const images: string[] = [];
    let cover = base.cover;
    $('header img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('srcset')?.split(' ')[0];
      if (src && src.startsWith('http') && (src.includes('panelinha') || src.includes('i.panelinha'))) {
        const abs = this.absolutizeUrl(src, this.origin);
        if (abs && !images.includes(abs)) images.push(abs);
      }
    });
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && !cover) cover = ogImage;
    if (images.length > 0 && !cover) cover = images[0];
    let ingredients = base.ingredients;
    if (ingredients.length === 0) {
      $('.blockIngredientListingsctn ul li, .jsBlockIngredientListingsCtn ul li').each((_, el) => {
        const txt = normalizeWhitespace($(el).text());
        if (txt && txt.length > 2 && !txt.toLowerCase().includes('comprar')) ingredients.push(txt);
      });
      if (ingredients.length === 0) {
        $('ul.js_ga_ob li').each((_, el) => {
          const txt = normalizeWhitespace($(el).text());
          if (txt && txt.length > 2) ingredients.push(txt);
        });
      }
    }
    let steps = base.steps;
    if (steps.length === 0) {
      $('ol.olStd li, .olStd li').each((_, el) => {
        const txt = normalizeWhitespace($(el).text());
        if (txt && txt.length > 5) steps.push(txt);
      });
    }
    if (steps.length === 0) {
      $('main ol li').each((_, el) => {
        const txt = normalizeWhitespace($(el).text());
        if (txt.length > 15) steps.push(txt);
      });
    }
    let servings = base.servings;
    let totalTime = base.totalTime;
    let prepTime = base.prepTime;
    let difficulty = base.difficulty;
    $('dl.stats div').each((_, el) => {
      const dt = normalizeWhitespace($(el).find('dt').text()).toLowerCase();
      const dd = normalizeWhitespace($(el).find('dd').text());
      if (dt.includes('serve') || dt.includes('porç')) { const s = extractServings(dd); if (s) servings = s; }
      if (dt.includes('tempo')) { const t = parseTimeToMinutes(dd); if (t) totalTime = t; }
      if (dt.includes('dificuldade') || dt.includes('dificil') || dt.includes('fácil')) { const d = mapDifficulty(dd); if (d) difficulty = d; }
    });
    const dataTotal = $('main').attr('data-item-p-total-time') || $('[data-item-p-total-time]').attr('data-item-p-total-time');
    if (dataTotal && !totalTime) totalTime = parseTimeToMinutes(dataTotal);
    const dataYield = $('[data-item-p-yield]').attr('data-item-p-yield');
    if (dataYield && !servings) servings = extractServings(dataYield);
    const tags: string[] = [...(base.tags ?? [])];
    $('a[href*="/categoria/"], a[href*="/cozinha/"]').each((_, el) => {
      const txt = normalizeWhitespace($(el).text());
      if (txt && txt.length < 30 && !tags.includes(txt.toLowerCase())) tags.push(txt.toLowerCase());
    });
    const occasions: string[] = [];
    const occasionMap: Record<string, string> = { 'jantar': 'familia', 'café da manhã': 'cafe', 'cafe da manha': 'cafe', 'festa': 'amigos', 'marmita': 'marmita', 'lanche': 'rapido', 'sobremesa': 'familia' };
    for (const t of tags) { const mapped = occasionMap[t.toLowerCase()]; if (mapped && !occasions.includes(mapped)) occasions.push(mapped); }
    const finalSlug = base.slug || `panelinha-${Date.now()}`;
    return this.buildRecipe({
      url, html, site: this.site, title: title || base.title || 'Receita Panelinha', slug: finalSlug, description: description || base.description, ingredients, steps, prepTime: prepTime ?? totalTime, totalTime, cookTime: null, servings, difficulty, cover, images: images.slice(0, 6), author: base.author || 'Panelinha', category: base.category, tags: tags.slice(0, 10), occasions, raw_jsonld: base.jsonld,
    });
  }
}
