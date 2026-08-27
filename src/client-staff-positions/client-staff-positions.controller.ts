import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, Query, UseGuards, } from '@nestjs/common';
import { ClientStaffPositionsService } from './client-staff-positions.service';
import { CreateClientStaffPositionDto } from './dto/create-client-staff-position.dto';
import { UpdateClientStaffPositionDto } from './dto/update-client-staff-position.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('client-staff-positions')
export class ClientStaffPositionsController {
      constructor(
    private readonly clientStaffPositionsService: ClientStaffPositionsService,
  ) {}

  /**
   * POST /client-staff-positions
   */
  @Post()
    @UseGuards(SanctumGuard)
  async create(
    @Body() dto: CreateClientStaffPositionDto,
  ) {
    return await this.clientStaffPositionsService.create(
      dto.position_name,
    );
  }

  /**
   * GET /client-staff-positions
   */
@Get()
async findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  return await this.clientStaffPositionsService.findAll(
    Number(page),
    Number(limit),
  );
}

  /**
   * GET /client-staff-positions/:id
   */
  @Get(':id')
    @UseGuards(SanctumGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.clientStaffPositionsService.findOne(id);
  }

  /**
   * PATCH /client-staff-positions/:id
   */
  // @Patch(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: UpdateClientStaffPositionDto,
  // ) {
  //   return await this.clientStaffPositionsService.update(
  //     id,
  //     dto.position_name,
  //   );
  // }

  /**
   * DELETE /client-staff-positions/:id
   */
  @Delete(':id')
    @UseGuards(SanctumGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.clientStaffPositionsService.remove(id);
  } 
}
