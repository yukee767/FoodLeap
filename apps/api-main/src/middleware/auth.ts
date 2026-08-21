import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { isBlocklisted } from '../utils/redis.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; jti: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    if (await isBlocklisted(payload.jti)) return res.status(401).json({ error: 'Token revoked' });
    req.user = { id: payload.sub, email: payload.email, role: payload.role, jti: payload.jti };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
