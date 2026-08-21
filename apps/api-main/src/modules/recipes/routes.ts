import { Router } from 'express';
import { MOCK_RECIPES, rankRecipes, scoreRecipe } from './scoring.js';
import { cacheGet, cacheSet } from '../../utils/redis.js';

const router = Router();

// helper TTL até 00:00 BRT
function secondsUntilMidnightBRT(): number {
  const now = new Date();
  const brtStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const brt = new Date(brtStr);
  const midnight = new Date(brt);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(60, Math.floor((midnight.getTime() - brt.getTime()) / 1000));
}

// GET /api/recipes/daily - personalizada, cache Redis cache_used:daily:{userId}:{yyyy-mm-dd} TTL até meia-noite BRT
router.get('/daily', async (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'anon';
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `cache_used:daily:${userId}:${today}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ data: JSON.parse(cached), source: 'cache', key: cacheKey });
  } catch {}

  // TODO: buscar diet profile do user via DB, por enquanto anon sem filtro
  const mockAnswers = (req.headers['x-diet-answers'] ? JSON.parse(req.headers['x-diet-answers'] as string) : {}) as Record<string, unknown>;

  // scoring com mock answers
  const ranked = rankRecipes(MOCK_RECIPES, mockAnswers as never);
  const top = ranked.slice(0, 1).map((r) => ({ ...r.recipe, score: r.score, reason: `Contém ${r.recipe.protein_main} • ${r.recipe.prep_time_min}min • ${r.recipe.kcal_range}` }));

  const ttl = secondsUntilMidnightBRT();
  try {
    await cacheSet(cacheKey, JSON.stringify(top), ttl);
  } catch {}

  res.json({ data: top, source: 'scoring', key: cacheKey, ttl });
});

// GET /api/recipes?occasion=romantico&diet=lowcarb&time=15min - paginação cursor + scoring
router.get('/', async (req, res) => {
  const { occasion, diet, time, q, cursor, limit = '20' } = req.query as Record<string, string>;
  const limitNum = Math.min(50, Number(limit) || 20);

  // Busca mock + filtros
  let filtered = [...MOCK_RECIPES];

  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter((r) => r.title.toLowerCase().includes(needle) || r.slug.includes(needle));
  }
  if (occasion) filtered = filtered.filter((r) => r.occasions.includes(occasion));
  if (time) {
    const max = { '15min': 15, '30min': 30, '45min': 45 }[time] ?? 60;
    filtered = filtered.filter((r) => r.prep_time_min <= max);
  }
  if (diet === 'lowcarb') filtered = filtered.filter((r) => r.tags.includes('low_carb'));

  // cursor pagination simples por id
  let start = 0;
  if (cursor) {
    const idx = filtered.findIndex((r) => r.id === cursor);
    if (idx >= 0) start = idx + 1;
  }
  const page = filtered.slice(start, start + limitNum);
  const nextCursor = start + limitNum < filtered.length ? page[page.length - 1]?.id : null;

  // scoring se tiver diet answers header
  const mockAnswers = (req.headers['x-diet-answers'] ? JSON.parse(req.headers['x-diet-answers'] as string) : {}) as Record<string, unknown>;
  const scored = page.map((r) => ({ ...r, score: scoreRecipe(r, mockAnswers as never, occasion) }));

  res.json({ filters: { occasion, diet, time, q }, pagination: { cursor, limit: limitNum, nextCursor }, data: scored });
});

// GET /api/recipes/slug/:slug - para ISR generateStaticParams
router.get('/slug/:slug', async (req, res) => {
  const recipe = MOCK_RECIPES.find((r) => r.slug === req.params.slug);
  if (!recipe) return res.status(404).json({ error: 'Not found' });
  // TODO: cache_used:recipe:{id} TTL 1h + DB lookup
  res.json(recipe);
});

// GET /api/recipes/:id - cache Redis cache_used:recipe:{id} TTL 1h
router.get('/:id', async (req, res) => {
  const recipe = MOCK_RECIPES.find((r) => r.id === req.params.id || r.slug === req.params.id);
  if (recipe) return res.json({ ...recipe, cache_key: `cache_used:recipe:${req.params.id}` });
  res.json({ id: req.params.id, title: 'Receita placeholder', cache_key: `cache_used:recipe:${req.params.id}` });
});

export default router;
