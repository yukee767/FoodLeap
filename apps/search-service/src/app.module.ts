import { Module } from '@nestjs/common';
import { SearchModule } from './search/search.module';
import { QuestionsModule } from './questions/questions.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [SearchModule, QuestionsModule, CommentsModule],
})
export class AppModule {}
