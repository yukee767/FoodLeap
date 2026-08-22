import * as cheerio from 'cheerio';
import { BaseAdapter } from './base.js';
import type { ScrapedRecipe } from '../types.js';
import { normalizeWhitespace, parseTimeToMinutes, mapDifficulty, extractServings } from '../utils/hash.js';

export class CozinhaDaLoAdapter extends BaseAdapter {
  readonly site = 'cozinha_da_lo' as const;
  readonly origin = 'https://www.cozinhadalo.com.br';
  readonly name = 'Cozinha da Ló';
  canHandle(url: string): boolean { return url.includes('cozinhadalo.com.br'); }
  extract(url: string, html: string): ScrapedRecipe {
    const $ = cheerio.load(html);
    const title = $('h1').first().text().trim() || $('meta[property="og:title"]').attr('content')?.trim() || $('title').text().replace(' | Cozinha da Ló', '').trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || $('meta[property="og:description"]').attr('content')?.trim() || $('article p').first().text().trim() || null;
    const base = this.baseNormalize({ url, html, fallbackTitle: title, fallbackDescription: description });
    let cover = base.cover || $('meta[property="og:image"]').attr('content') || null;
    const images: string[] = [];
    $('article img, .entry-content img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.includes('cozinhadalo.com.br') && src.includes('uploads')) {
        const abs = this.absolutizeUrl(src, this.origin);
        if (abs && !images.includes(abs)) images.push(abs);
      }
    });
    if (!cover && images.length) cover = images[0];
    if (cover && !images.includes(cover)) images.unshift(cover);
    let ingredients = base.ingredients;
    if (ingredients.length === 0) {
      $('h2, h3, h4, strong').each((_, el) => {
        const txt = normalizeWhitespace($(el).text()).toLowerCase();
        if (txt.match(/massa|recheio|ingrediente|creme|suspiro|molho|cobertura|farofa/)) {
          let next = $(el).next();
          let guard = 0;
          while (next.length && guard < 8) {
            if (next.is('ul')) {
              next.find('li').each((_, li) => {
                const t = normalizeWhitespace($(li).text());
                if (t && t.length > 3 && t.length < 200) ingredients.push(t);
              });
              break;
            }
            if (next.is('p')) {
              const pText = normalizeWhitespace(next.text());
              if (pText.match(/^\d|^-|•|xícara|colher|gramas/i)) {
                const lines = pText.split(/[\n•-]/).map(s => s.trim()).filter(s => s.length > 5);
                lines.forEach(l => { if (l.match(/xícara|colher|g\b|ml|ovo|farinha|açúcar/i)) ingredients.push(l); });
              }
            }
            next = next.next();
            guard++;
          }
        }
      });
      if (ingredients.length === 0) {
        $('.entry-content li').each((_, el) => {
          const t = normalizeWhitespace($(el).text());
          if (t.match(/\d+\s*(g|xícara|colher|ml|pitada|unidade|ovos?)/i) && t.length < 150) ingredients.push(t);
        });
      }
      ingredients = [...new Set(ingredients)].slice(0, 40);
    }
    let steps = base.steps;
    if (steps.length === 0) {
      $('.entry-content ol li').each((_, el) => {
        const t = normalizeWhitespace($(el).text());
        if (t && t.length > 10) steps.push(t);
      });
      if (steps.length === 0) {
        $('.entry-content p').each((_, el) => {
          const t = normalizeWhitespace($(el).text());
          if (t.match(/^\d+[-\.\)]\s+/) && t.length > 20) steps.push(t.replace(/^\d+[-\.\)]\s+/, ''));
        });
      }
      if (steps.length === 0) {
        const content = $('.entry-content').text();
        const parts = content.split(/\n?\d+[-\)\.]\s+/).filter(s => s.trim().length > 20).slice(0, 15);
        if (parts.length >= 2) steps = parts.map(s => normalizeWhitespace(s).slice(0, 500));
      }
      steps = [...new Set(steps)].slice(0, 25);
    }
    let prepTime = base.prepTime;
    let totalTime = base.totalTime;
    let servings = base.servings;
    let difficulty = base.difficulty;
    const contentText = $('.entry-content').text();
    const timeMatch = contentText.match(/(\d+)\s*minutos?/i);
    if (timeMatch && !prepTime) { prepTime = parseTimeToMinutes(`${timeMatch[1]}min`); totalTime = prepTime; }
    const servingsMatch = contentText.match(/serve\s*(\d+)|(\d+)\s*porç/i);
    if (servingsMatch && !servings) {
      const m = servingsMatch[0].match(/(\d+)/);
      if (m) servings = parseInt(m[1]);
    }
    const tags: string[] = [...(base.tags ?? [])];
    $('a[rel="category tag"], .entry-meta a, a[href*="/category/"]').each((_, el) => {
      const txt = normalizeWhitespace($(el).text());
      if (txt && txt.length < 30 && !tags.includes(txt.toLowerCase())) tags.push(txt.toLowerCase());
    });
    $('a[href*="/tag/"]').each((_, el) => {
      const txt = normalizeWhitespace($(el).text());
      if (txt && txt.length < 30 && !tags.includes(txt.toLowerCase())) tags.push(txt.toLowerCase());
    });
    const occasions: string[] = [];
    const lower = (title + ' ' + tags.join(' ')).toLowerCase();
    if (lower.includes('bolo') || lower.includes('torta') || lower.includes('pão') || lower.includes('sobremesa')) occasions.push('familia');
    if (lower.includes('pão') || lower.includes('padaria')) occasions.push('cafe');
    if (lower.includes('vegetariano') || lower.includes('vegano')) occasions.push('vegano');
    if (lower.includes('festa') || lower.includes('aniversário')) occasions.push('amigos');
    const finalSlug = base.slug || `cozinhadalo-${Date.now()}`;
    return this.buildRecipe({
      url, html, site: this.site, title: title || base.title || 'Receita Cozinha da Ló', slug: finalSlug, description: description || base.description, ingredients, steps, prepTime, totalTime, cookTime: null, servings, difficulty, cover, images: images.slice(0, 6), author: base.author || 'Cozinha da Ló', category: base.category, tags: tags.slice(0, 12), occasions: [...new Set(occasions)], raw_jsonld: base.jsonld,
    });
  }
}
