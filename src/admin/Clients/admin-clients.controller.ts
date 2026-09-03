import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
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

        @Query('limit') limit: number = 20,

        @Query('search') search?: string,
        @Query('featured') featured?: string,
    ) {
        return this.adminCompanyService.totalRecruiters(
            page,
            limit,
            search,
            featured,
        );
    }
    @Get('employers')
    @UseGuards(SanctumGuard)
    async getAllEmployer(
        @Query('page') page: number = 1,

        @Query('limit') limit: number = 20,

        @Query('search') search?: string,
        @Query('featured') featured?: string,
    ) {
        return this.adminCompanyService.totalEmpoyers(
            page,
            limit,
            search,
            featured,
        );
    }
    @Get('employers/:clientId')
    async EmployerProfilesDetail(
        @Param('clientId', ParseIntPipe) clientId: number,
    ) {
        return this.adminCompanyService.CompanyProfilesDetail(clientId);
    }
    @Get('recruiters/:clientId')
    async CompanyProfilesDetail(
        @Param('clientId', ParseIntPipe) clientId: number,
    ) {
        return this.adminCompanyService.CompanyProfilesDetail(clientId);
    }
}