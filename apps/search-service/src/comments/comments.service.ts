import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  async list(recipeId: string) {
    // TODO: SELECT * FROM comments WHERE recipe_id=:recipeId AND is_moderated=false ORDER BY created_at DESC
    // Cache Redis cache_used:comments:{recipeId} TTL 5min
    return { recipe_id: recipeId, data: [], total: 0 };
  }

  async create(dto: { recipe_id: string; user_id: string; body: string; parent_id?: string }) {
    // TODO: insert + invalida cache, publish via Redis pub/sub
    return { id: 'uuid', ...dto, created_at: new Date().toISOString(), is_moderated: false };
  }

  async get(id: string) {
    return { id, body: 'placeholder' };
  }
}
