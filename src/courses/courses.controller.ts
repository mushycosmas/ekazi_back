import { Controller,Get,Query } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
      constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.coursesService.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }
}
