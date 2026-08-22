import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { MOCK_RECIPES, rankRecipes, scoreRecipe } from './modules/recipes/scoring.js';

const DIET_QUESTIONS = [
  { id: 1, block: 'A', key: 'goal', question: 'O que você quer conquistar com a sua alimentação agora?', description: 'Seu objetivo é nossa bússola. Equilibramos calorias e nutrientes para que o plano trabalhe a seu favor.', type: 'single_choice', options: ['emagrecer','ganhar_massa','manter_saudavel','energia','aprender_cozinhar'], required: true },
  { id: 2, block: 'A', key: 'activity_level', question: 'Como é a sua rotina de movimento durante a semana?', description: 'Seu nível de atividade nos ajuda a calcular suas necessidades energéticas e porções que sustentam seu dia.', type: 'single_choice', options: ['sedentario','leve','moderado','intenso'], required: true },
  { id: 3, block: 'A', key: 'restrictions', question: 'Você segue alguma restrição alimentar ou estilo alimentar?', description: 'Garantimos apenas receitas compatíveis com você.', type: 'multi_choice', options: ['nenhuma','vegetariano','vegano','sem_lactose','sem_gluten','low_carb','alergia'], required: true },
  { id: 4, block: 'A', key: 'health_conditions', question: 'Existe alguma condição de saúde que gostaria que considerássemos com carinho?', description: 'Adaptamos sódio, açúcar e fibras para receitas mais leves e seguras.', type: 'multi_choice', options: ['nenhuma','diabetes','hipertensao','colesterol_alto','intestino_sensivel','sop'], required: false },
  { id: 5, block: 'A', key: 'skill_level', question: 'Qual é a sua intimidade com a cozinha hoje?', description: 'Evitamos frustrações. Priorizamos pratos simples se está começando.', type: 'single_choice', options: ['iniciante','intermediario','avancado'], required: true },
  { id: 6, block: 'B', key: 'routine_weekday', question: 'Como é a sua rotina de segunda a sexta?', description: 'Sua rotina define o formato ideal: marmitas, 15 minutos ou pratos elaborados.', type: 'single_choice', options: ['correria','hibrido','home','irregular'], required: true },
  { id: 7, block: 'B', key: 'routine_weekend', question: 'E como você gosta de viver o fim de semana?', description: 'Entendemos se quer praticidade, tempo para cozinhar ou receber quem ama.', type: 'single_choice', options: ['praticidade','mais_tempo','receber','como_fora'], required: true },
  { id: 8, block: 'B', key: 'time_available', question: 'Quanto tempo você gostaria de dedicar a cada refeição?', description: 'Respeitamos seu tempo. Filtramos receitas que cabem na sua agenda.', type: 'single_choice', options: ['15min','30min','45min','60min'], required: true },
  { id: 9, block: 'B', key: 'cook_frequency', question: 'Com que frequência você quer cozinhar na semana?', description: 'Definimos a estratégia: fresco todo dia, marmitas 2–3 vezes ou tudo em um dia.', type: 'single_choice', options: ['todo_dia','2_3x','1x','decidir_semana'], required: true },
  { id: 10, block: 'B', key: 'budget', question: 'Qual é o seu orçamento semanal para o mercado?', description: 'Ajustamos receitas e lista de compras para caber no seu bolso.', type: 'single_choice', options: ['economico','medio','confortavel','tanto_faz'], required: false },
  { id: 11, block: 'C', key: 'favorite_protein', question: 'Quais proteínas mais te dão prazer? Escolha até 3 favoritas.', description: 'Suas favoritas serão as estrelas do cardápio.', type: 'multi_choice', options: ['frango','carne','porco','peixe_branco','salmao_atum','ovo','grao_lentilha','tofu_soja'], required: true },
  { id: 12, block: 'C', key: 'carbs', question: 'Quais carboidratos e acompanhamentos você mais curte?', description: 'Mapeamos seus acompanhamentos preferidos para pratos que saciam.', type: 'multi_choice', options: ['arroz','macarrao','pao_tapioca','batata_mandioca','cuscuz','quinoa_aveia','evito_carb_noite'], required: true },
  { id: 13, block: 'C', key: 'hated_ingredients', question: 'Tem algum ingrediente que você prefere evitar?', description: 'Nunca sugeriremos receitas com o que você não tolera.', type: 'multi_choice', options: ['coentro','pimentao','cebola','berinjela','cogumelos','figado','outro'], required: false },
  { id: 14, block: 'C', key: 'flavor', question: 'Qual perfil de sabor mais te conquista?', description: 'Seu paladar guia nossos temperos: do caseirinho ao mediterrâneo.', type: 'single_choice', options: ['caseirinho','picante','agridoce','mediterraneo','cremoso'], required: false },
  { id: 15, block: 'C', key: 'hardest_meal', question: 'Qual refeição é o seu maior desafio hoje?', description: 'Daremos atenção extra onde você mais tropeça.', type: 'single_choice', options: ['cafe','almoco','jantar','lanches','todas'], required: true },
] as const;

type Env = {
  MOCK_DB: string;
  HYPERDRIVE?: any;
  CACHE_KV?: any;
  RECIPES_BUCKET?: any;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({ origin: '*', allowMethods: ['GET','POST','PUT','DELETE','OPTIONS'] }));

async function getRecipes(env: Env): Promise<typeof MOCK_RECIPES> {
  const normalizeKV = (arr: unknown[]): typeof MOCK_RECIPES | null => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const first = arr[0] as Record<string, unknown>;
    const isIngestResult = first && typeof first === 'object' && 'recipe' in first && 'url' in first;
    const list = isIngestResult ? (arr as Array<Record<string, unknown>>).map((x) => x.recipe as Record<string, unknown>) : (arr as Array<Record<string, unknown>>);
    const normalized = list
      .map((r) => ({
        id: (r.id as string) ?? (r.slug as string) ?? crypto.randomUUID(),
        slug: r.slug as string,
        title: r.title as string,
        description: (r.description as string) ?? '',
        instructions: (r.instructions as string) ?? ((r.steps as string[])?.join('\n') ?? ''),
        prep_time_min: (r.prep_time_min as number) ?? 30,
        difficulty: (r.difficulty as string) ?? 'medio',
        cover_url: (r.cover_url as string | null) ?? null,
        protein_main: (r.protein_main as string) ?? 'frango',
        kcal_range: (r.kcal_range as string) ?? 'media',
        tags: (r.tags as string[]) ?? [],
        occasions: (r.occasions as string[]) ?? [],
        is_published: true,
      }))
      .filter((r) => r.slug && r.title);
    return normalized.length > 0 ? (normalized as unknown as typeof MOCK_RECIPES) : null;
  };
  if (env.CACHE_KV) {
    try {
      const cached = await env.CACHE_KV.get('recipes:all', 'json');
      const norm = normalizeKV(cached as unknown[]);
      if (norm) return norm;
    } catch {}
  }
  if (env.RECIPES_BUCKET) {
    try {
      const obj = await env.RECIPES_BUCKET.get('banco.json');
      if (obj) {
        const json = await obj.json() as Array<Record<string, unknown>>;
        const normalized = json
          .map((item) => {
            const r = (item as Record<string, unknown>).recipe ?? item;
            return {
              id: (r as Record<string, unknown>).id ?? (r as Record<string, unknown>).slug ?? crypto.randomUUID(),
              slug: (r as Record<string, unknown>).slug as string,
              title: (r as Record<string, unknown>).title as string,
              description: ((r as Record<string, unknown>).description as string) ?? '',
              instructions: ((r as Record<string, unknown>).instructions as string) ?? ((r as Record<string, unknown>).steps as string[])?.join('\n') ?? '',
              prep_time_min: ((r as Record<string, unknown>).prep_time_min as number) ?? 30,
              difficulty: ((r as Record<string, unknown>).difficulty as string) ?? 'medio',
              cover_url: (r as Record<string, unknown>).cover_url as string | null,
              protein_main: (r as Record<string, unknown>).protein_main as string ?? 'frango',
              kcal_range: (r as Record<string, unknown>).kcal_range as string ?? 'media',
              tags: (r as Record<string, unknown>).tags as string[] ?? [],
              occasions: (r as Record<string, unknown>).occasions as string[] ?? [],
              is_published: true,
            };
          })
          .filter((r) => r.slug && r.title);
        if (normalized.length > 0) {
          if (env.CACHE_KV) await env.CACHE_KV.put('recipes:all', JSON.stringify(normalized), { expirationTtl: 3600 }).catch(() => {});
          return normalized as unknown as typeof MOCK_RECIPES;
        }
      }
    } catch (e) {
      console.warn('[worker] R2 load failed', (e as Error).message);
    }
  }
  return MOCK_RECIPES;
}

app.get('/api/health', (c) => {
  const env = c.env as Env;
  return c.json({
    status: 'ok',
    service: 'api-main',
    runtime: 'cloudflare-worker',
    timestamp: new Date().toISOString(),
    bindings: {
      kv: !!env.CACHE_KV,
      r2: !!env.RECIPES_BUCKET,
      hyperdrive: !!env.HYPERDRIVE,
      mock_db: env.MOCK_DB === 'true',
    },
  });
});

// Diet
app.get('/api/diet/questions', (c) => c.json({ questions: DIET_QUESTIONS }));

app.post('/api/diet/profile', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.userId || !body?.answers) return c.json({ error: 'Missing userId or answers' }, 400);
  const recipes = await getRecipes(c.env as Env);
  const ranked = rankRecipes(recipes as typeof MOCK_RECIPES, body.answers);
  const weekPlan = generateWeekPlan(ranked.map((r) => r.recipe) as typeof MOCK_RECIPES, body.answers);
  return c.json({ message: 'perfil salvo', planId: crypto.randomUUID(), next: `/api/diet/plan/${body.userId}`, previewMeals: weekPlan.meals.slice(0, 3) }, 201);
});

app.get('/api/diet/plan/:userId', async (c) => {
  const userId = c.req.param('userId');
  const recipes = await getRecipes(c.env as Env);
  const ranked = rankRecipes(recipes as typeof MOCK_RECIPES, {});
  const weekPlan = generateWeekPlan(ranked.map((r) => r.recipe) as typeof MOCK_RECIPES, {});
  return c.json({ userId, week_start: new Date().toISOString().slice(0, 10), meals: weekPlan.meals.slice(0, 6), total: weekPlan.meals.length, note: 'Plano gerado via KV/R2/MOCK' });
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

app.get('/api/recipes/daily', async (c) => {
  const userId = c.req.header('x-user-id') || 'anon';
  const today = new Date().toISOString().slice(0, 10);
  const recipes = await getRecipes(c.env as Env);
  const ranked = rankRecipes(recipes as typeof MOCK_RECIPES, {});
  const top = ranked.slice(0, 1).map((r) => ({ ...r.recipe, score: r.score, reason: `Contém ${r.recipe.protein_main} • ${r.recipe.prep_time_min}min` }));
  return c.json({ data: top, source: recipes === MOCK_RECIPES ? 'mock' : 'kv', key: `cache_used:daily:${userId}:${today}`, ttl: secondsUntilMidnightBRT() });
});

app.get('/api/recipes/slug/:slug', async (c) => {
  const recipes = await getRecipes(c.env as Env);
  const recipe = (recipes as typeof MOCK_RECIPES).find((r) => r.slug === c.req.param('slug'));
  if (!recipe) return c.json({ error: 'Not found' }, 404);
  return c.json(recipe);
});

app.get('/api/recipes/:id', async (c) => {
  const id = c.req.param('id');
  const recipes = await getRecipes(c.env as Env);
  const recipe = (recipes as typeof MOCK_RECIPES).find((r) => (r as unknown as Record<string, unknown>).id === id || r.slug === id);
  if (recipe) return c.json({ ...(recipe as object), cache_key: `cache_used:recipe:${id}` });
  return c.json({ id, title: 'Receita placeholder', cache_key: `cache_used:recipe:${id}` });
});

app.get('/api/recipes', async (c) => {
  const occasion = c.req.query('occasion');
  const diet = c.req.query('diet');
  const time = c.req.query('time');
  const q = c.req.query('q');
  const cursor = c.req.query('cursor');
  const limit = Math.min(50, Number(c.req.query('limit') || 20));
  const recipes = (await getRecipes(c.env as Env)) as typeof MOCK_RECIPES;
  let filtered = [...recipes];
  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter((r) => r.title.toLowerCase().includes(needle) || r.slug.includes(needle));
  }
  if (occasion) filtered = filtered.filter((r) => (r.occasions as string[])?.includes(occasion));
  if (time) {
    const max = ({ '15min': 15, '30min': 30, '45min': 45 } as Record<string, number>)[time] ?? 60;
    filtered = filtered.filter((r) => r.prep_time_min <= max);
  }
  if (diet === 'lowcarb') filtered = filtered.filter((r) => (r.tags as string[])?.includes('low_carb'));
  let start = 0;
  if (cursor) {
    const idx = filtered.findIndex((r) => (r as unknown as Record<string, unknown>).id === cursor);
    if (idx >= 0) start = idx + 1;
  }
  const page = filtered.slice(start, start + limit);
  const nextCursor = start + limit < filtered.length ? (page[page.length - 1] as unknown as Record<string, unknown>)?.id as string : null;
  const scored = page.map((r) => ({ ...r, score: scoreRecipe(r as Parameters<typeof scoreRecipe>[0], {}, occasion) }));
  return c.json({ filters: { occasion, diet, time, q }, pagination: { cursor, limit, nextCursor }, data: scored, total: filtered.length, source: recipes === MOCK_RECIPES ? 'mock' : 'kv' });
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
