import * as cheerio from 'cheerio';
import { BaseAdapter } from './base.js';
import type { ScrapedRecipe } from '../types.js';
import { normalizeWhitespace, parseTimeToMinutes, mapDifficulty, extractServings } from '../utils/hash.js';

export class GloboAdapter extends BaseAdapter {
  readonly site = 'globo' as const;
  readonly origin = 'https://receitas.globo.com';
  readonly name = 'Receitas Globo';
  canHandle(url: string): boolean { return url.includes('receitas.globo.com') || url.includes('receitas.glbimg.com'); }
  extract(url: string, html: string): ScrapedRecipe {
    const $ = cheerio.load(html);
    const title = $('h1').first().text().trim() || $('meta[property="og:title"]').attr('content')?.trim() || $('title').text().replace(' | Receitas', '').trim() || 'Receita Globo';
    const description = $('meta[name="description"]').attr('content')?.trim() || $('meta[property="og:description"]').attr('content')?.trim() || $('.recipe-description, .content-head__subtitle, h2').first().text().trim() || null;
    const base = this.baseNormalize({ url, html, fallbackTitle: title, fallbackDescription: description });
    let cover = base.cover || $('meta[property="og:image"]').attr('content') || null;
    const images: string[] = [];
    if (cover) images.push(cover);
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.includes('glbimg.com') && !src.includes('logo') && !src.includes('avatar')) {
        const abs = this.absolutizeUrl(src, this.origin);
        if (abs && !images.includes(abs)) images.push(abs);
      }
    });
    const filtered = images.filter((u) => !u.includes('80x80') && !u.includes('40x40'));
    if (!cover && filtered.length) cover = filtered[0];
    let ingredients = base.ingredients;
    if (ingredients.length === 0) {
      $('[itemprop="recipeIngredient"], .ingredients-list li, .recipe-ingredients li').each((_, el) => {
        const txt = normalizeWhitespace($(el).text());
        if (txt && txt.length > 2 && txt.length < 150) ingredients.push(txt);
      });
      if (ingredients.length === 0) {
        const h = $('h2, h3, h4').filter((_, el) => $(el).text().toLowerCase().includes('ingrediente'));
        h.each((_, heading) => {
          const ul = $(heading).nextAll('ul').first();
          if (ul.length) {
            ul.find('li').each((_, li) => {
              const txt = normalizeWhitespace($(li).text());
              if (txt) ingredients.push(txt);
            });
          }
        });
      }
      if (ingredients.length === 0) {
        $('li').each((_, el) => {
          const txt = normalizeWhitespace($(el).text());
          if (txt.match(/xícara|colher|g\b|ml|pitada/i) && txt.length < 100) {
            if (!ingredients.includes(txt)) ingredients.push(txt);
          }
        });
      }
      ingredients = [...new Set(ingredients)].slice(0, 40);
    }
    let steps = base.steps;
    if (steps.length === 0) {
      $('[itemprop="recipeInstructions"], .instructions li, .recipe-preparation li, .modo-preparo li').each((_, el) => {
        const txt = normalizeWhitespace($(el).text());
        if (txt && txt.length > 10) steps.push(txt);
      });
      if (steps.length === 0) {
        const h = $('h2, h3').filter((_, el) => $(el).text().toLowerCase().includes('modo de preparo') || $(el).text().toLowerCase().includes('preparo'));
        h.each((_, heading) => {
          let next = $(heading).next();
          let guard = 0;
          while (next.length && guard < 15) {
            if (next.is('ol') || next.is('ul')) {
              next.find('li').each((_, li) => {
                const txt = normalizeWhitespace($(li).text());
                if (txt.length > 10) steps.push(txt);
              });
              break;
            }
            if (next.find('ol li').length > 0) {
              next.find('ol li').each((_, li) => {
                const txt = normalizeWhitespace($(li).text());
                if (txt.length > 10) steps.push(txt);
              });
              break;
            }
            next = next.next();
            guard++;
          }
        });
      }
      if (steps.length === 0) {
        $('ol li').each((_, el) => {
          const txt = normalizeWhitespace($(el).text());
          if (txt.length > 15) steps.push(txt);
        });
        steps = [...new Set(steps)].slice(0, 20);
      }
    }
    let prepTime = base.prepTime;
    let totalTime = base.totalTime;
    let servings = base.servings;
    let difficulty = base.difficulty;
    const timePatterns = html.match(/tempo[^<]*?(\d+)\s*min/gi) || [];
    if (timePatterns.length > 0 && !prepTime) {
      const first = timePatterns[0];
      if (first) {
        const m = first.match(/(\d+)\s*min/i);
        if (m && m[1]) prepTime = parseTimeToMinutes(`${m[1]}min`);
      }
    }
    if (!prepTime) {
      const iso = base.jsonld ? (base.jsonld as Record<string, unknown>)['totalTime'] as string | undefined : undefined;
      if (iso) prepTime = parseTimeToMinutes(iso);
    }
    if (!totalTime) totalTime = prepTime;
    const rendimentoMatch = html.match(/rendimento[^<]*?(\d+)\s*por/gi) || html.match(/(\d+)\s*porç/gi);
    if (rendimentoMatch && !servings) {
      const m = rendimentoMatch[0].match(/(\d+)/);
      if (m) servings = parseInt(m[1]);
    }
    if (!servings) {
      const hYield = $('*').filter((_, el) => $(el).text().toLowerCase().includes('rendimento')).text();
      const s = extractServings(hYield);
      if (s) servings = s;
    }
    if (!difficulty) {
      if (/dificuldade[^<]*?fácil/i.test(html)) difficulty = 'facil';
      else if (/dificuldade[^<]*?médio/i.test(html)) difficulty = 'medio';
      else if (/dificuldade[^<]*?difícil/i.test(html)) difficulty = 'dificil';
    }
    const tags: string[] = [...(base.tags ?? [])];
    $('a[href*="/tipos-de-prato/"], a[href*="/cozinhas/"], a[href*="/dietas/"]').each((_, el) => {
      const txt = normalizeWhitespace($(el).text());
      if (txt && txt.length < 30 && !tags.includes(txt.toLowerCase())) tags.push(txt.toLowerCase());
    });
    const kw = $('meta[name="keywords"]').attr('content');
    if (kw) {
      kw.split(',').forEach((k) => {
        const t = k.trim().toLowerCase();
        if (t && !tags.includes(t)) tags.push(t);
      });
    }
    const occasions: string[] = [];
    const lowerTags = tags.join(' ').toLowerCase() + ' ' + title.toLowerCase();
    if (lowerTags.includes('cafe da manha') || lowerTags.includes('café')) occasions.push('cafe');
    if (lowerTags.includes('lanche')) occasions.push('rapido');
    if (lowerTags.includes('festa') || lowerTags.includes('aniversario')) occasions.push('amigos');
    if (lowerTags.includes('fitness') || lowerTags.includes('light') || lowerTags.includes('saudavel')) occasions.push('fitness');
    if (lowerTags.includes('vegana') || lowerTags.includes('vegetariana')) occasions.push('vegano');
    const finalSlug = base.slug || `globo-${Date.now()}`;
    return this.buildRecipe({
      url, html, site: this.site, title: title || base.title || 'Receita Globo', slug: finalSlug, description: description || base.description, ingredients, steps, prepTime, totalTime, cookTime: null, servings, difficulty, cover, images: filtered.length ? filtered.slice(0, 6) : images.slice(0, 6), author: base.author || 'Receitas Globo', category: base.category, tags: tags.slice(0, 12), occasions: [...new Set(occasions)], raw_jsonld: base.jsonld,
    });
  }
}
