import { Controller ,Get,Query} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
      constructor(
    private readonly knowledgeService: KnowledgeService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.knowledgeService.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }
}
