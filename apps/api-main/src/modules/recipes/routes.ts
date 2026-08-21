import { Router } from 'express';
const router = Router();

// GET /api/recipes/daily - personalizada, cache Redis cache_used:daily:{userId}:{yyyy-mm-dd} TTL até meia-noite BRT
router.get('/daily', async (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'anon';
  const today = new Date().toISOString().slice(0, 10);
  // TODO: try Redis GET cache_used:daily:${userId}:${today} -> hit return, miss -> Postgres + scoring + SETEX até 00:00
  res.json({ data: [], source: 'redis cache_used or db', key: `cache_used:daily:${userId}:${today}` });
});

// GET /api/recipes?occasion=romantico&diet=lowcarb&time=15min - paginação cursor
router.get('/', async (req, res) => {
  const { occasion, diet, time, cursor, limit = '20' } = req.query as Record<string, string>;
  // TODO: busca Postgres com índices GIN tsvector + btree(occasion, prep_time) + cursor pagination (created_at, id)
  res.json({ filters: { occasion, diet, time }, pagination: { cursor, limit: Number(limit) }, data: [] });
});

// GET /api/recipes/:id - cache Redis cache_used:recipe:{id} TTL 1h
router.get('/:id', async (req, res) => {
  res.json({ id: req.params.id, title: 'Receita placeholder', cache_key: `cache_used:recipe:${req.params.id}` });
});

export default router;
