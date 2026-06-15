import { Controller ,Query,Get } from '@nestjs/common';
import { CulturesService } from './cultures.service';

@Controller('cultures')
export class CulturesController {
      constructor(
    private readonly culturesService: CulturesService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.culturesService.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }
}
