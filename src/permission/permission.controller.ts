import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    Query,
    DefaultValuePipe,
    Put,
    UseGuards,
} from '@nestjs/common';

import { PermissionService } from './permission.service';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('permissions')
export class PermissionController {

    constructor(

        private readonly permissionService:
            PermissionService,

    ) { }

    // ==========================================
    // CREATE
    // ==========================================

    @Post()
    @UseGuards(SanctumGuard)
    create(

        @Body()
        dto: CreatePermissionDto,

    ) {

        return this.permissionService.create(
            dto,
        );
    }

    // ==========================================
    // FIND ALL
    // ==========================================

    @Get()
    @UseGuards(SanctumGuard)
    findAll(

        @Query(
            'page',
            new DefaultValuePipe(1),
            ParseIntPipe,
        )
        page: number,

        @Query(
            'limit',
            new DefaultValuePipe(20),
            ParseIntPipe,
        )
        limit: number,

    ) {

        return this.permissionService.findAll(
            page,
            limit,
        );
    }

    // ==========================================
    // FIND ONE
    // ==========================================

    @Get(':id')
    @UseGuards(SanctumGuard)
    findOne(

        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,

    ) {

        return this.permissionService.findOne(
            id,
        );

    }

    // ==========================================
    // UPDATE
    // ==========================================

    @Put(':id')
    @UseGuards(SanctumGuard)
    update(

        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,

        @Body()
        dto: UpdatePermissionDto,

    ) {

        return this.permissionService.update(
            id,
            dto,
        );

    }

    // ==========================================
    // DELETE
    // ==========================================

    @Delete(':id')
    @UseGuards(SanctumGuard)
    remove(

        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,

    ) {

        return this.permissionService.remove(
            id,
        );

    }
}