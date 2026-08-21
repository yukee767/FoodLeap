import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // GET /api/search?q=moqueca&occasion=romantico
  @Get()
  async search(@Query('q') q: string, @Query('occasion') occasion?: string) {
    return this.searchService.search(q, occasion);
  }
}
