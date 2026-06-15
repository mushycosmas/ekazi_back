import { Controller, Get, Query } from '@nestjs/common';
import { RegionsService } from './regions.service';

@Controller('regions')
export class RegionsController {
  constructor(
    private readonly regionsService: RegionsService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.regionsService.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }
}