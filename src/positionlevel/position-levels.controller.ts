import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UpdatePositionLevelDto } from './dto/update-position-level.dto';
import { CreatePositionLevelDto } from './dto/create-position-level.dto';
import { PositionLevelsService } from './position-levels.service';

@Controller('position-levels')
export class PositionLevelsController {
      constructor(private readonly service: PositionLevelsService) {}

  @Post()
  create(@Body() dto: CreatePositionLevelDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdatePositionLevelDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(Number(id));
  }
}
