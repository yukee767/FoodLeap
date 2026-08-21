import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionsService {
  async list(recipeId?: string) {
    // TODO: picks from questions_qa table, filter by recipe_id if present
    return { recipe_id: recipeId ?? null, data: [], total: 0 };
  }

  async create(dto: { recipe_id?: string; user_id: string; title: string; body: string }) {
    return { id: 'uuid', ...dto, is_answered: false, created_at: new Date().toISOString() };
  }

  async get(id: string) {
    return { id, title: 'placeholder' };
  }
}
