import { Controller ,Get,Query } from '@nestjs/common';
import { MajorsService } from './majors.service';

@Controller('majors')
export class MajorsController {
      constructor(
    private readonly majorsService: MajorsService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.majorsService.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }
}
