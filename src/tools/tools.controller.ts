import { Controller,Get,Query } from '@nestjs/common';
import { ToolsService } from './tools.service';

@Controller('tools')
export class ToolsController {
      constructor(private readonly toolsService: ToolsService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.toolsService.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }
}
