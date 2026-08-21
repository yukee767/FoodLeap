import { Router } from 'express';
const router = Router();

// POST /api/auth/register - cria usuário (PostgreSQL + bcrypt)
router.post('/register', async (req, res) => {
  // TODO: validar com zod, salvar no PostgreSQL com senha criptografada
  res.status(201).json({ message: 'register - TODO' });
});

// POST /api/auth/login - autentica e retorna JWT, cacheia sessão no Redis
router.post('/login', async (req, res) => {
  // TODO: verificar senha, gerar JWT, setar Redis
  res.json({ message: 'login - TODO', token: 'jwt_placeholder' });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  res.json({ user: null });
});

export default router;
