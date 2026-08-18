import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClientStaffService } from './client-staff.service';
import { CreateClientStaffDto } from './dto/create-client-staff.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';
import { UpdateClientStaffDto } from './dto/update-client-staff.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('client-staffs')
export class ClientStaffController {
    constructor(

        private readonly service: ClientStaffService,

    ) { }

    @Post()
    @UseGuards(SanctumGuard)
    create(
        @Body() dto: CreateClientStaffDto,
        @CurrentUser() user: Users,

    ) {

        return this.service.create(dto, user);

    }
    @Get()
    @UseGuards(SanctumGuard)
    async findAll(
        @CurrentUser() user: Users,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search?: string,
    ) {
        if (!user.client_id) {
            throw new NotFoundException('Client not found');
        }

        return this.service.findAll(
            Number(page),
            Number(limit),
            search,
            user.client_id,
        );
    }
    @Get(':id')
    @UseGuards(SanctumGuard)
    async findOne(@Param('id') id: number) {
        const data = await this.service.findOne(+id);

        return {
            success: true,
            message: 'Client staff retrieved successfully',
            data,
        };
    }

    @Put(':id')
  @UseGuards(SanctumGuard)
    update(

        @Param('id', ParseIntPipe) id: number,

        @Body() dto: UpdateClientStaffDto,

        @CurrentUser() user: Users,

    ) {

        return this.service.update(

            id,

            dto,

            user,

        );

    }

    @Delete(':id')

    remove(

        @Param('id', ParseIntPipe) id: number,

    ) {

        return this.service.remove(id);

    }
}
