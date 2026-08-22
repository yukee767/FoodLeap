import * as cheerio from 'cheerio';
import { BaseAdapter } from './base.js';
import type { ScrapedRecipe } from '../types.js';
import { normalizeWhitespace, parseTimeToMinutes, mapDifficulty, extractServings } from '../utils/hash.js';

export class TudoGostosoAdapter extends BaseAdapter {
  readonly site = 'tudogostoso' as const;
  readonly origin = 'https://www.tudogostoso.com.br';
  readonly name = 'TudoGostoso';
  canHandle(url: string): boolean { return url.includes('tudogostoso.com.br'); }
  extract(url: string, html: string): ScrapedRecipe {
    const $ = cheerio.load(html);
    const title = $('h1').first().text().trim() || $('meta[property="og:title"]').attr('content')?.trim() || $('title').text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || $('meta[property="og:description"]').attr('content')?.trim() || $('p').first().text().trim() || null;
    const base = this.baseNormalize({ url, html, fallbackTitle: title, fallbackDescription: description });
    const images: string[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.includes('static.itdg.com.br') && src.includes('.jpg')) {
        const abs = this.absolutizeUrl(src, this.origin);
        if (abs && !images.includes(abs) && !abs.includes('80-80') && !abs.includes('40-40')) images.push(abs);
      }
    });
    const filteredImages = images.filter((u) => u.includes('640') || u.includes('360') || u.includes('580') || u.includes('original'));
    let cover = base.cover;
    if (!cover) cover = $('meta[property="og:image"]').attr('content') || filteredImages[0] || images[0] || null;
    let ingredients = base.ingredients;
    if (ingredients.length === 0) {
      const heading = $('h2, h3, h4').filter((_, el) => $(el).text().toLowerCase().includes('ingrediente'));
      if (heading.length > 0) {
        heading.each((_, h) => {
          let next = $(h).next();
          let guard = 0;
          while (next.length && guard < 20) {
            if (next.is('ul')) {
              next.find('li').each((_, li) => {
                const txt = normalizeWhitespace($(li).text());
                if (txt && txt.length > 2 && !txt.toLowerCase().includes('comprar') && txt.length < 200) {
                  if (!txt.match(/^(batedeira|liquidificador|forma|prato)$/i)) ingredients.push(txt);
                }
              });
            }
            if (next.is('h3') || next.is('h4')) {
              const subNext = next.next();
              if (subNext.is('ul')) {
                subNext.find('li').each((_, li) => {
                  const txt = normalizeWhitespace($(li).text());
                  if (txt && txt.length > 2) ingredients.push(txt);
                });
              }
            }
            next = next.next();
            guard++;
            if (next.is('h2') && normalizeWhitespace(next.text()).toLowerCase().includes('modo')) break;
          }
        });
      }
      if (ingredients.length === 0) {
        $('li').each((_, el) => {
          const txt = normalizeWhitespace($(el).text());
          if (txt.match(/xícara|colher|gramas|ml|kg|pitada|ovos|farinha|açúcar|leite/i) && txt.length < 120) {
            if (!ingredients.includes(txt) && txt.split(' ').length < 15) ingredients.push(txt);
          }
        });
      }
      ingredients = [...new Set(ingredients)].slice(0, 30);
    }
    let steps = base.steps;
    if (steps.length === 0) {
      const heading = $('h2, h3').filter((_, el) => $(el).text().toLowerCase().includes('modo de preparo'));
      if (heading.length > 0) {
        const ol = heading.first().nextAll('ol').first();
        if (ol.length) {
          ol.find('li').each((_, li) => {
            const txt = normalizeWhitespace($(li).text());
            if (txt && txt.length > 10) steps.push(txt);
          });
        }
      }
      if (steps.length === 0) {
        $('ol').each((_, ol) => {
          const lis = $(ol).find('li');
          if (lis.length >= 3) {
            lis.each((_, li) => {
              const txt = normalizeWhitespace($(li).text());
              if (txt.length > 15) steps.push(txt);
            });
          }
        });
        steps = [...new Set(steps)].slice(0, 20);
      }
    }
    let prepTime = base.prepTime;
    let difficulty = base.difficulty;
    const timeMatch = html.match(/(\d+)\s*min/i);
    if (timeMatch && !prepTime) prepTime = parseTimeToMinutes(`${timeMatch[1]}min`);
    if (!difficulty) {
      if (/\bMédio\b/i.test(html)) difficulty = 'medio';
      else if (/\bFácil\b/i.test(html)) difficulty = 'facil';
      else if (/\bDifícil\b/i.test(html)) difficulty = 'dificil';
    }
    const servingsMatch = html.match(/(\d+)\s*porç/i);
    let servings = base.servings;
    if (servingsMatch && !servings) servings = parseInt(servingsMatch[1]);
    const ingHeading = $('h2, h3').filter((_, el) => $(el).text().toLowerCase().includes('ingredientes'));
    const ingText = ingHeading.text();
    const servings2 = extractServings(ingText);
    if (servings2 && !servings) servings = servings2;
    let totalTime = base.totalTime ?? prepTime;
    const tags: string[] = [...(base.tags ?? [])];
    $('a[href*="/categorias/"]').each((_, el) => {
      const txt = normalizeWhitespace($(el).text());
      if (txt && txt.length < 30 && !tags.includes(txt.toLowerCase())) tags.push(txt.toLowerCase());
    });
    const occasions: string[] = [];
    const textLower = (title + ' ' + tags.join(' ')).toLowerCase();
    if (textLower.includes('bolo') || textLower.includes('torta')) occasions.push('familia');
    if (textLower.includes('rapido') || textLower.includes('airfryer')) occasions.push('rapido');
    if (textLower.includes('fitness') || textLower.includes('saudavel') || textLower.includes('fit')) occasions.push('fitness');
    const uniqOccasions = [...new Set(occasions)];
    const finalSlug = base.slug || `tudogostoso-${Date.now()}`;
    return this.buildRecipe({
      url, html, site: this.site, title: title || base.title || 'Receita TudoGostoso', slug: finalSlug, description: description || base.description, ingredients, steps, prepTime, totalTime, cookTime: null, servings, difficulty, cover, images: (filteredImages.length ? filteredImages : images).slice(0, 6), author: base.author || 'TudoGostoso', category: base.category, tags: tags.slice(0, 10), occasions: uniqOccasions, raw_jsonld: base.jsonld,
    });
  }
}
