import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({ origin: '*', allowMethods: ['GET','POST','OPTIONS'] }));

app.get('/api/search', (c) => {
  const q = c.req.query('q') || '';
  const occasion = c.req.query('occasion');
  if (!q || q.trim().length < 2) return c.json({ query: q, occasion, results: [], total: 0 });
  // mock search - in prod query Postgres tsvector via Hyperdrive
  return c.json({ query: q, occasion, results: [], total: 0, note: 'Worker mock - conecte Hyperdrive Postgres' });
});

app.get('/api/search/suggest', (c) => {
  const q = c.req.query('q') || '';
  return c.json({ query: q, suggestions: [] });
});

app.get('/api/search/health', (c) => c.json({ status: 'ok', service: 'search-service', runtime: 'cloudflare-worker' }));

// Comments
app.get('/comments', (c) => {
  const recipe_id = c.req.query('recipe_id') || 'all';
  return c.json({ recipe_id, data: [], total: 0 });
});
app.post('/comments', async (c) => {
  const body = await c.req.json();
  return c.json({ id: crypto.randomUUID(), ...body, created_at: new Date().toISOString(), is_moderated: false });
});
app.get('/comments/:id', (c) => c.json({ id: c.req.param('id'), body: 'placeholder' }));

// Questions
app.get('/questions', (c) => {
  const recipe_id = c.req.query('recipe_id');
  return c.json({ recipe_id: recipe_id ?? null, data: [], total: 0 });
});
app.post('/questions', async (c) => {
  const body = await c.req.json();
  return c.json({ id: crypto.randomUUID(), ...body, is_answered: false, created_at: new Date().toISOString() });
});

app.get('/health', (c) => c.json({ status: 'ok', service: 'search-service-worker' }));
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
