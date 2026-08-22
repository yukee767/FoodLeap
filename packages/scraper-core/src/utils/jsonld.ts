import * as cheerio from 'cheerio';

export interface JsonLdRecipe {
  name?: string;
  headline?: string;
  description?: string;
  recipeIngredient?: string[] | string;
  recipeInstructions?: Array<string | { text: string; name?: string }> | string;
  totalTime?: string;
  prepTime?: string;
  cookTime?: string;
  recipeYield?: string | string[];
  recipeCategory?: string | string[];
  recipeCuisine?: string | string[];
  keywords?: string;
  image?: string | string[] | { url: string } | Array<{ url: string } | string>;
  author?: { name: string } | string;
  nutrition?: Record<string, string>;
}

export function extractJsonLdRecipe(html: string): JsonLdRecipe | null {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    const raw = $(scripts[i]).html();
    if (!raw) continue;
    try {
      const data = JSON.parse(raw.trim());
      const candidates: unknown[] = Array.isArray(data) ? data : [data];
      const expanded: unknown[] = [];
      for (const c of candidates) {
        if (c && typeof c === 'object' && '@graph' in (c as Record<string, unknown>)) {
          const g = (c as Record<string, unknown>)['@graph'];
          if (Array.isArray(g)) expanded.push(...g);
          else expanded.push(c);
        } else {
          expanded.push(c);
        }
      }
      for (const obj of expanded) {
        if (!obj || typeof obj !== 'object') continue;
        const rec = obj as Record<string, unknown>;
        const type = rec['@type'];
        const isRecipe =
          type === 'Recipe' ||
          (Array.isArray(type) && type.includes('Recipe')) ||
          (typeof type === 'string' && type.toLowerCase().includes('recipe'));
        if (isRecipe) return rec as unknown as JsonLdRecipe;
      }
    } catch {}
  }
  return null;
}

export function jsonLdToNormalized(json: JsonLdRecipe) {
  const ingredients = (() => {
    const ri = json.recipeIngredient;
    if (!ri) return [] as string[];
    if (Array.isArray(ri)) return ri.map((s) => String(s).trim()).filter(Boolean);
    return [String(ri).trim()];
  })();
  const steps = (() => {
    const inst = json.recipeInstructions;
    if (!inst) return [] as string[];
    if (typeof inst === 'string') return [inst];
    if (Array.isArray(inst)) {
      return inst
        .map((s) => {
          if (typeof s === 'string') return s.trim();
          if (s && typeof s === 'object' && 'text' in s) return String((s as { text: string }).text).trim();
          if (s && typeof s === 'object' && 'name' in s) return String((s as { name: string }).name).trim();
          return '';
        })
        .filter(Boolean);
    }
    return [];
  })();
  const cover = (() => {
    const im = json.image;
    if (!im) return null;
    if (typeof im === 'string') return im;
    if (Array.isArray(im)) {
      const first = im[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && 'url' in first) return (first as { url: string }).url;
      return null;
    }
    if (typeof im === 'object' && 'url' in (im as Record<string, unknown>)) return (im as { url: string }).url;
    return null;
  })();
  const author = (() => {
    const a = json.author;
    if (!a) return null;
    if (typeof a === 'string') return a;
    if (typeof a === 'object' && 'name' in a) return (a as { name: string }).name;
    return null;
  })();
  const yieldRaw = Array.isArray(json.recipeYield) ? json.recipeYield[0] : json.recipeYield;
  return {
    ingredients,
    steps,
    cover,
    author,
    yieldRaw: yieldRaw ? String(yieldRaw) : null,
    totalTime: json.totalTime ?? null,
    prepTime: json.prepTime ?? null,
    cookTime: json.cookTime ?? null,
    category: Array.isArray(json.recipeCategory) ? json.recipeCategory[0] : json.recipeCategory ?? null,
    keywords: json.keywords ?? null,
  };
}
