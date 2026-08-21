import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { MOCK_RECIPES, rankRecipes, scoreRecipe } from './modules/recipes/scoring.js';

const DIET_QUESTIONS = [
  { id: 1, block: 'A', key: 'goal', question: 'Qual seu principal objetivo agora?', type: 'single_choice', options: ['emagrecer','ganhar_massa','manter_saudavel','energia','aprender_cozinhar'], required: true },
  { id: 2, block: 'A', key: 'activity_level', question: 'Como você descreve sua rotina de atividade física?', type: 'single_choice', options: ['sedentario','leve','moderado','intenso'], required: true },
  { id: 3, block: 'A', key: 'restrictions', question: 'Você tem alguma restrição ou dieta?', type: 'multi_choice', options: ['nenhuma','vegetariano','vegano','sem_lactose','sem_gluten','low_carb','alergia'], required: true },
  { id: 4, block: 'A', key: 'health_conditions', question: 'Alguma condição que devemos considerar?', type: 'multi_choice', options: ['nenhuma','diabetes','hipertensao','colesterol_alto','intestino_sensivel','sop'], required: false },
  { id: 5, block: 'A', key: 'skill_level', question: 'Qual seu nível na cozinha?', type: 'single_choice', options: ['iniciante','intermediario','avancado'], required: true },
  { id: 6, block: 'B', key: 'routine_weekday', question: 'Como é seu DIA DE SEMANA?', type: 'single_choice', options: ['correria','hibrido','home','irregular'], required: true },
  { id: 7, block: 'B', key: 'routine_weekend', question: 'E seu FIM DE SEMANA?', type: 'single_choice', options: ['praticidade','mais_tempo','receber','como_fora'], required: true },
  { id: 8, block: 'B', key: 'time_available', question: 'Quanto tempo você TOPA cozinhar por refeição?', type: 'single_choice', options: ['15min','30min','45min','60min'], required: true },
  { id: 9, block: 'B', key: 'cook_frequency', question: 'Quantos dias você quer cozinhar na semana?', type: 'single_choice', options: ['todo_dia','2_3x','1x','decidir_semana'], required: true },
  { id: 10, block: 'B', key: 'budget', question: 'Seu orçamento semanal para mercado?', type: 'single_choice', options: ['economico','medio','confortavel','tanto_faz'], required: false },
  { id: 11, block: 'C', key: 'favorite_protein', question: 'Quais PROTEÍNAS você mais ama? (máx 3)', type: 'multi_choice', options: ['frango','carne','porco','peixe_branco','salmao_atum','ovo','grao_lentilha','tofu_soja'], required: true },
  { id: 12, block: 'C', key: 'carbs', question: 'E carboidratos / acompanhamentos?', type: 'multi_choice', options: ['arroz','macarrao','pao_tapioca','batata_mandioca','cuscuz','quinoa_aveia','evito_carb_noite'], required: true },
  { id: 13, block: 'C', key: 'hated_ingredients', question: 'Tem algum ingrediente que você ODEIA?', type: 'multi_choice', options: ['coentro','pimentao','cebola','berinjela','cogumelos','figado','outro'], required: false },
  { id: 14, block: 'C', key: 'flavor', question: 'Qual sabor te conquista?', type: 'single_choice', options: ['caseirinho','picante','agridoce','mediterraneo','cremoso'], required: false },
  { id: 15, block: 'C', key: 'hardest_meal', question: 'Qual sua refeição mais difícil do dia?', type: 'single_choice', options: ['cafe','almoco','jantar','lanches','todas'], required: true },
] as const;

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
