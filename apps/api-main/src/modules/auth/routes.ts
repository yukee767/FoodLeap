import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken, verifyToken } from '../../utils/jwt.js';
import { blocklist, cacheDel } from '../../utils/redis.js';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register - cria usuário (PostgreSQL + bcrypt cost 12)
router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, email, password } = parsed.data;
  const hash = await bcrypt.hash(password, 12);
  // TODO: insert via TypeORM AppDataSource: users table, handle citext unique conflict
  // await ds.getRepository(User).save({ name, email, password_hash: hash })
  const userId = crypto.randomUUID();
  const { token: accessToken } = signAccessToken({ sub: userId, email, role: 'user' });
  const { token: refreshToken } = signRefreshToken({ sub: userId, email, role: 'user' });
  // TODO: persist refresh:{userId}:{jti} in Redis with TTL 7d
  res.status(201).json({ user: { id: userId, name, email, role: 'user' }, accessToken, refreshToken });
});

// POST /api/auth/login - autentica, retorna JWT 15m + refresh 7d, blocklist via Redis
router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  // TODO: fetch user by email, bcrypt.compare(password, user.password_hash)
  // if fail: increment Redis rate-limit key rl:login:{ip} and return 401
  const mockUser = { id: crypto.randomUUID(), email: parsed.data.email, role: 'user', password_hash: await bcrypt.hash('password123', 12) };
  const ok = await bcrypt.compare(parsed.data.password, mockUser.password_hash);
  // demo: accept any password that bcrypt compare with mock? For now allow password123
  if (parsed.data.password !== 'password123' && !ok) return res.status(401).json({ error: 'Invalid credentials' });

  const { token: accessToken, jti: accessJti } = signAccessToken({ sub: mockUser.id, email: mockUser.email, role: mockUser.role });
  const { token: refreshToken, jti: refreshJti } = signRefreshToken({ sub: mockUser.id, email: mockUser.email, role: mockUser.role });
  // TODO: SET refresh:{userId}:{refreshJti} EX 7d in Redis
  res.json({ accessToken, refreshToken, jti: accessJti, expiresIn: '15m' });
});

// POST /api/auth/refresh - rotate refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return res.status(400).json({ error: 'Missing refreshToken' });
  try {
    const payload = verifyToken(refreshToken);
    // TODO: check Redis refresh:{sub}:{jti} exists, then DEL + issue new pair
    const { token: accessToken } = signAccessToken({ sub: payload.sub, email: payload.email, role: payload.role });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh' });
  }
});

// POST /api/auth/logout - blocklist jti em Redis TTL = exp restante
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  const jti = req.user!.jti;
  // TTL 15min for access, until exp
  await blocklist(jti, 15 * 60);
  // TODO: picks refresh jti from body and blocklist too
  await cacheDel(`cache_used:diet:plan:${req.user!.id}`);
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me - requer Bearer
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;
