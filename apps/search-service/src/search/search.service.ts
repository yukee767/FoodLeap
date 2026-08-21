import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  // TODO: injetar DataSource (read-replica) + Redis para cache search:q:{hash}:occasion:{occ} TTL 5-15min
  async search(q: string, occasion?: string) {
    if (!q || q.trim().length < 2) return { query: q, occasion, results: [], total: 0 };
    // Exemplo query real (ativar quando DB disponível):
    // SELECT id, slug, title, ts_rank_cd(search_vector, plainto_tsquery('portuguese', unaccent(:q))) AS rank
    // FROM recipes WHERE search_vector @@ plainto_tsquery('portuguese', unaccent(:q))
    // AND (:occasion IS NULL OR id IN (SELECT recipe_id FROM recipe_occasions JOIN occasions ON occasion_id=occasions.id WHERE slug=:occasion))
    // AND is_published = true ORDER BY rank DESC LIMIT 20
    return { query: q, occasion, results: [], total: 0, note: 'Conecte Postgres read-replica + Redis cache' };
  }

  async suggest(q: string) {
    // GIN trigram para autocomplete
    return { query: q, suggestions: [] };
  }
}
