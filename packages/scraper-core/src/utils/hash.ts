import { createHash } from 'node:crypto';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function contentHash(parts: string[]): string {
  const h = createHash('sha256');
  h.update(parts.join('||'));
  return h.digest('hex').slice(0, 32);
}

export function htmlHash(html: string): string {
  return createHash('sha1').update(html).digest('hex').slice(0, 20);
}

export function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

export function parseTimeToMinutes(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const t = raw.toLowerCase().trim();
  if (t.startsWith('pt')) {
    const m = t.match(/pt(?:(\d+)h)?(?:(\d+)m)?/i);
    if (m) {
      const h = m[1] ? parseInt(m[1]) : 0;
      const mm = m[2] ? parseInt(m[2]) : 0;
      const total = h * 60 + mm;
      return total > 0 ? total : null;
    }
  }
  let total = 0;
  const hourMatch = t.match(/(\d+(?:[.,]\d+)?)\s*h(?:ora)?s?/);
  if (hourMatch) total += Math.round(parseFloat(hourMatch[1].replace(',', '.')) * 60);
  const minMatch = t.match(/(\d+)\s*min/);
  if (minMatch) total += parseInt(minMatch[1]);
  if (total > 0) return total;
  const num = parseInt(t);
  if (!isNaN(num) && num > 0 && num < 600) return num;
  return null;
}

export function mapDifficulty(raw: string | null | undefined): 'facil' | 'medio' | 'dificil' | null {
  if (!raw) return null;
  const t = raw.toLowerCase();
  if (t.includes('facil') || t.includes('fácil') || t.includes('easy')) return 'facil';
  if (t.includes('dificil') || t.includes('difícil') || t.includes('hard')) return 'dificil';
  if (t.includes('medio') || t.includes('médio') || t.includes('medium')) return 'medio';
  return null;
}

export function extractServings(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = raw.match(/(\d+)\s*(porç|pessoas|serve|porcoes)/i);
  if (m) return parseInt(m[1]);
  const m2 = raw.match(/(\d+)\s*por/i);
  if (m2) return parseInt(m2[1]);
  return null;
}
