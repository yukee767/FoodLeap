import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  async search(q: string, occasion?: string) {
    // TODO: busca full-text no PostgreSQL (tsvector) + ranking por perfil do usuário (Redis/Ignite)
    // Integrar com api-main via HTTP interno ou shared DB read-replica
    return { query: q, occasion, results: [], total: 0 };
  }
}
