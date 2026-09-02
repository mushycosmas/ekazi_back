import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';


import { AdminClientsService } from './admin-clients.service';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('admin')
export class AdminCompanyController {
    constructor(
        private readonly adminCompanyService: AdminClientsService,
    ) { }

    @Get('recruiters')
    @UseGuards(SanctumGuard)
    async getAllrecruiter(
        @Query('page') page: number = 1,

        @Query('limit') limit: number = 10,

        @Query('search') search?: string,
    ) {
        return this.adminCompanyService.totalRecruiters(
            page,
            limit,
            search,
        );
    }
    @Get('employers')
    @UseGuards(SanctumGuard)
    async getAllEmployer(
        @Query('page') page: number = 1,

        @Query('limit') limit: number = 10,

        @Query('search') search?: string,
    ) {
        return this.adminCompanyService.totalEmpoyers(
            page,
            limit,
            search,
        );
    }
}