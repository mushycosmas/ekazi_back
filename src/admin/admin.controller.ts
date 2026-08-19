import {
    Controller,
    Get,
    Query,
    Param,
    ParseIntPipe,
    DefaultValuePipe,
    UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { Users } from 'src/entities/users.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(SanctumGuard)
export class AdminController {

    constructor(
        private readonly adminService: AdminService,
    ) {}

    // ============================================================
    // DASHBOARD
    // ============================================================

    @Get('dashboard')
    @UseGuards(SanctumGuard)
    async dashboard() {

        return this.adminService.dashboard();

    }
    

}