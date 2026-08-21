import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-main', timestamp: new Date().toISOString() });
});

// Domain routers (placeholder)
import authRouter from './modules/auth/routes.js';
import recipeRouter from './modules/recipes/routes.js';
import dietRouter from './modules/diet/routes.js';

app.use('/api/auth', authRouter);
app.use('/api/recipes', recipeRouter);
app.use('/api/diet', dietRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`[api-main] listening on http://localhost:${PORT}`);
});
