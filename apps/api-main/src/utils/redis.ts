import { createClient } from 'redis';

const url = process.env.REDIS_URL || 'redis://localhost:6379/0';

export const redis = createClient({ url });

redis.on('error', (err) => console.error('[redis] error', err));

// Lazy connect - caller should await redis.connect() if not connected
export async function ensureRedis() {
  if (!redis.isOpen) await redis.connect();
}

export async function isBlocklisted(jti: string) {
  await ensureRedis();
  const v = await redis.get(`jwt:blocklist:${jti}`);
  return v === '1';
}

export async function blocklist(jti: string, ttlSeconds: number) {
  await ensureRedis();
  await redis.set(`jwt:blocklist:${jti}`, '1', { EX: ttlSeconds });
}

export async function cacheGet(key: string) {
  await ensureRedis();
  return redis.get(key);
}

export async function cacheSet(key: string, value: string, ttlSeconds: number) {
  await ensureRedis();
  await redis.set(key, value, { EX: ttlSeconds });
}

export async function cacheDel(key: string) {
  await ensureRedis();
  await redis.del(key);
}

export async function publishInvalidate(channel: string, key: string) {
  await ensureRedis();
  await redis.publish(channel, key);
}
