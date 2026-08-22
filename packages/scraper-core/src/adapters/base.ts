import * as cheerio from 'cheerio';
import type { ScrapedRecipe, SourceSite } from '../types.js';
import { extractJsonLdRecipe, jsonLdToNormalized } from '../utils/jsonld.js';
import {
  slugify,
  contentHash,
  htmlHash,
  normalizeWhitespace,
  parseTimeToMinutes,
  mapDifficulty,
  extractServings,
} from '../utils/hash.js';

export abstract class BaseAdapter {
  abstract readonly site: SourceSite;
  abstract readonly origin: string;
  abstract readonly name: string;
  abstract canHandle(url: string): boolean;
  abstract extract(url: string, html: string): ScrapedRecipe;

  protected baseNormalize(args: {
    url: string;
    html: string;
    fallbackTitle?: string;
    fallbackDescription?: string | null;
  }): {
    jsonld: ReturnType<typeof extractJsonLdRecipe>;
    title: string | null;
    description: string | null;
    slug: string | null;
    cover: string | null;
    ingredients: string[];
    steps: string[];
    prepTime: number | null;
    cookTime: number | null;
    totalTime: number | null;
    servings: number | null;
    difficulty: 'facil' | 'medio' | 'dificil' | null;
    category: string | null;
    tags: string[];
    author: string | null;
  } {
    const { url, html, fallbackTitle, fallbackDescription } = args;
    const jsonld = extractJsonLdRecipe(html);
    const norm = jsonld ? jsonLdToNormalized(jsonld) : null;
    let title: string | null = null;
    let description: string | null = fallbackDescription ?? null;
    let cover: string | null = null;
    let ingredients: string[] = [];
    let steps: string[] = [];
    let prepTime: number | null = null;
    let totalTime: number | null = null;
    let cookTime: number | null = null;
    let servings: number | null = null;
    let difficulty: 'facil' | 'medio' | 'dificil' | null = null;
    let category: string | null = null;
    let tags: string[] = [];
    let author: string | null = null;
    if (jsonld && norm) {
      title = (jsonld.name || jsonld.headline || fallbackTitle || '').trim() || null;
      description = (jsonld.description || description || '').trim() || null;
      if (Array.isArray(description)) description = (description as unknown as string[])[0] ?? null;
      cover = norm.cover;
      ingredients = norm.ingredients;
      steps = norm.steps;
      prepTime = parseTimeToMinutes(norm.prepTime);
      cookTime = parseTimeToMinutes(norm.cookTime);
      totalTime = parseTimeToMinutes(norm.totalTime) ?? (prepTime && cookTime ? prepTime + cookTime : prepTime);
      servings = extractServings(norm.yieldRaw);
      if (norm.category) category = String(norm.category);
      if (norm.keywords) tags = String(norm.keywords).split(',').map((s) => s.trim()).filter(Boolean);
      author = norm.author;
      if (tags.length) {
        for (const t of tags) {
          const d = mapDifficulty(t);
          if (d) { difficulty = d; break; }
        }
      }
    }
    if (!title && fallbackTitle) title = fallbackTitle;
    if (!title) {
      const $ = cheerio.load(html);
      title = $('h1').first().text().trim() || $('title').text().trim() || null;
    }
    return {
      jsonld,
      title,
      description,
      slug: title ? slugify(title) : null,
      cover,
      ingredients,
      steps,
      prepTime,
      cookTime,
      totalTime,
      servings,
      difficulty,
      category,
      tags,
      author,
    };
  }

  protected buildRecipe(args: {
    url: string;
    html: string;
    site: SourceSite;
    title: string;
    slug: string;
    description: string | null;
    ingredients: string[];
    steps: string[];
    prepTime: number | null;
    totalTime: number | null;
    cookTime: number | null;
    servings: number | null;
    difficulty: 'facil' | 'medio' | 'dificil' | null;
    cover: string | null;
    images: string[];
    author: string | null;
    category: string | null;
    tags: string[];
    occasions: string[];
    raw_jsonld: unknown;
  }): ScrapedRecipe {
    const {
      url, html, site, title, slug, description, ingredients, steps, prepTime, totalTime, cookTime, servings, difficulty, cover, images, author, category, tags, occasions, raw_jsonld,
    } = args;
    const normalizedIngredients = ingredients.map((raw) => ({
      raw,
      name: normalizeWhitespace(raw.replace(/^\d+[^\w]*\s*/, '').split('(')[0]),
      quantity: null,
      unit: null,
    }));
    const instructions = steps.join('\n');
    const hash = contentHash([title, ingredients.join('|'), instructions]);
    const hHash = htmlHash(html);
    const finalPrep = totalTime ?? prepTime ?? cookTime ?? null;
    return {
      source_url: url,
      source_site: site,
      source_id: null,
      title: normalizeWhitespace(title),
      slug: slug,
      description: description ? normalizeWhitespace(description).slice(0, 500) : null,
      ingredients: normalizedIngredients,
      ingredients_text: ingredients,
      steps: steps.map((s) => normalizeWhitespace(s)),
      instructions: normalizeWhitespace(instructions).slice(0, 8000),
      prep_time_min: finalPrep,
      cook_time_min: cookTime,
      total_time_min: totalTime,
      servings,
      difficulty: difficulty ?? null,
      cover_url: cover,
      images,
      author: author ?? null,
      category: category ?? null,
      tags,
      occasions,
      nutrition: null,
      raw_jsonld: raw_jsonld ?? null,
      raw_html_hash: hHash,
      content_hash: hash,
      language: 'pt-BR',
      scraped_at: new Date().toISOString(),
    };
  }

  protected absolutizeUrl(maybeRelative: string, base: string): string | null {
    try { return new URL(maybeRelative, base).toString(); } catch { return null; }
  }
}
