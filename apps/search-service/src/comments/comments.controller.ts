import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  @Get()
  async list(@Query('recipe_id') recipeId: string) {
    return this.service.list(recipeId);
  }

  @Post()
  async create(@Body() dto: { recipe_id: string; user_id: string; body: string; parent_id?: string }) {
    return this.service.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
