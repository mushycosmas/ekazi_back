import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { StagesService } from './stages.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@Controller('stages')
export class StagesController {
  constructor(
    private readonly service: StagesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateStageDto,
    @Req() req,
  ) {
    return this.service.create(dto, req.user);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateStageDto,
    @Req() req,
  ) {
    return this.service.update(
      Number(id),
      dto,
      req.user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(Number(id));
  }
}