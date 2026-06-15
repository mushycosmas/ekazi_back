import { Controller,Get,Query } from '@nestjs/common';
import { PersonalitiesService } from './personalities.service';

@Controller('personalities')
export class PersonalitiesController {
      constructor(
    private readonly personalitiesService: PersonalitiesService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.personalitiesService.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }
}
