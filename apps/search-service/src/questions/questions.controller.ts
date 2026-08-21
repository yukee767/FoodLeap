import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  @Get()
  async list(@Query('recipe_id') recipeId?: string) {
    return this.service.list(recipeId);
  }

  @Post()
  async create(@Body() dto: { recipe_id?: string; user_id: string; title: string; body: string }) {
    return this.service.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
