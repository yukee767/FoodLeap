import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DIET_QUESTIONS } from './modules/diet/routes.js';
import { MOCK_RECIPES, rankRecipes, scoreRecipe } from './modules/recipes/scoring.js';

type Env = {
  MOCK_DB: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({ origin: '*', allowMethods: ['GET','POST','PUT','DELETE','OPTIONS'] }));

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'api-main', runtime: 'cloudflare-worker', timestamp: new Date().toISOString() }));

// Diet
app.get('/api/diet/questions', (c) => c.json({ questions: DIET_QUESTIONS }));

app.post('/api/diet/profile', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.userId || !body?.answers) return c.json({ error: 'Missing userId or answers' }, 400);
  const ranked = rankRecipes(MOCK_RECIPES, body.answers);
  const weekPlan = generateWeekPlan(ranked.map(r => r.recipe), body.answers);
  return c.json({ message: 'perfil salvo', planId: crypto.randomUUID(), next: `/api/diet/plan/${body.userId}`, previewMeals: weekPlan.meals.slice(0,3) }, 201);
});

app.get('/api/diet/plan/:userId', (c) => {
  const userId = c.req.param('userId');
  // mock miss - instruct to POST first
  return c.json({ userId, week_start: new Date().toISOString().slice(0,10), meals: [], note: 'Faça POST /api/diet/profile para gerar plano. Worker mock.' });
});

// Recipes
function secondsUntilMidnightBRT(): number {
  const now = new Date();
  const brtStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const brt = new Date(brtStr);
  const midnight = new Date(brt);
  midnight.setHours(24,0,0,0);
  return Math.max(60, Math.floor((midnight.getTime() - brt.getTime())/1000));
}

app.get('/api/recipes/daily', (c) => {
  const userId = c.req.header('x-user-id') || 'anon';
  const today = new Date().toISOString().slice(0,10);
  const ranked = rankRecipes(MOCK_RECIPES, {});
  const top = ranked.slice(0,1).map(r => ({ ...r.recipe, score: r.score, reason: `Contém ${r.recipe.protein_main} • ${r.recipe.prep_time_min}min` }));
  return c.json({ data: top, source: 'scoring-worker', key: `cache_used:daily:${userId}:${today}`, ttl: secondsUntilMidnightBRT() });
});

app.get('/api/recipes/slug/:slug', (c) => {
  const recipe = MOCK_RECIPES.find(r => r.slug === c.req.param('slug'));
  if (!recipe) return c.json({ error: 'Not found' }, 404);
  return c.json(recipe);
});

app.get('/api/recipes/:id', (c) => {
  const id = c.req.param('id');
  const recipe = MOCK_RECIPES.find(r => r.id === id || r.slug === id);
  if (recipe) return c.json({ ...recipe, cache_key: `cache_used:recipe:${id}` });
  return c.json({ id, title: 'Receita placeholder', cache_key: `cache_used:recipe:${id}` });
});

app.get('/api/recipes', (c) => {
  const occasion = c.req.query('occasion');
  const diet = c.req.query('diet');
  const time = c.req.query('time');
  const q = c.req.query('q');
  const cursor = c.req.query('cursor');
  const limit = Math.min(50, Number(c.req.query('limit') || 20));
  let filtered = [...MOCK_RECIPES];
  if (q) { const needle = q.toLowerCase(); filtered = filtered.filter(r => r.title.toLowerCase().includes(needle) || r.slug.includes(needle)); }
  if (occasion) filtered = filtered.filter(r => r.occasions.includes(occasion));
  if (time) { const max = ({ '15min':15,'30min':30,'45min':45 } as Record<string,number>)[time] ?? 60; filtered = filtered.filter(r => r.prep_time_min <= max); }
  if (diet === 'lowcarb') filtered = filtered.filter(r => r.tags.includes('low_carb'));
  let start = 0;
  if (cursor) { const idx = filtered.findIndex(r => r.id === cursor); if (idx>=0) start = idx+1; }
  const page = filtered.slice(start, start+limit);
  const nextCursor = start+limit < filtered.length ? page[page.length-1]?.id : null;
  const scored = page.map(r => ({ ...r, score: scoreRecipe(r, {}, occasion) }));
  return c.json({ filters: { occasion, diet, time, q }, pagination: { cursor, limit, nextCursor }, data: scored });
});

// Auth mock
app.post('/api/auth/register', async (c) => {
  const body = await c.req.json();
  return c.json({ user: { id: crypto.randomUUID(), name: body.name, email: body.email, role: 'user' }, accessToken: 'mock-jwt-' + crypto.randomUUID(), refreshToken: 'mock-refresh' }, 201);
});
app.post('/api/auth/login', async (c) => {
  const body = await c.req.json();
  if (!body.email) return c.json({ error: 'Missing email' }, 400);
  return c.json({ accessToken: 'mock-jwt-' + crypto.randomUUID(), refreshToken: 'mock-refresh', expiresIn: '15m' });
});
app.get('/api/auth/me', (c) => c.json({ user: { id: 'mock-user', email: 'test@foodleap.com', role: 'user' } }));

app.notFound((c) => c.json({ error: 'Not found', path: c.req.path }, 404));

function generateWeekPlan(rankedRecipes: typeof MOCK_RECIPES, answers: Record<string,string>) {
  const freq = answers.cook_frequency ?? 'todo_dia';
  const perDay = freq === '1x' ? 0.5 : freq === '2_3x' ? 0.7 : 1;
  const totalMeals = Math.max(3, Math.round(7 * perDay * 2));
  const meals: { day:number; meal_type:string; recipe_id:string; title:string }[] = [];
  for (let i=0;i<totalMeals;i++) {
    const recipe = rankedRecipes[i % rankedRecipes.length];
    meals.push({ day: (i%7)+1, meal_type: i%3===0?'almoco':i%3===1?'jantar':'cafe', recipe_id: recipe.id, title: recipe.title });
  }
  return { meals, total_kcal: null, generated_by: 'system' as const };
}

export default app;
