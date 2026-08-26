import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';


import { SubscriptionPlansService } from './subscription-plans.service';

import {
    CreateSubscriptionPlanDto,
} from './dto/create-subscription-plan.dto';

import {
    UpdateSubscriptionPlanDto,
} from './dto/update-subscription-plan.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('subscription-plans')
export class SubscriptionPlansController {

    constructor(
        private readonly planService:
            SubscriptionPlansService,
    ) { }

    // =====================================================
    // CREATE
    // POST /api/subscription-plans
    // =====================================================

    @Post()
    @UseGuards(SanctumGuard)
    create(
        @Body()
        dto: CreateSubscriptionPlanDto,
    ) {
        return this.planService.create(dto);
    }

    // =====================================================
    // FIND ALL
    // GET /api/subscription-plans?page=1&limit=10
    // =====================================================

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {

        return this.planService.findAll(
            page ? Number(page) : 1,
            limit ? Number(limit) : 10,
        );
    }

    // =====================================================
    // FIND ONE
    // GET /api/subscription-plans/1
    // =====================================================

    @Get(':id')
     @UseGuards(SanctumGuard)
    findOne(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {
        return this.planService.findOne(id);
    }

    // =====================================================
    // UPDATE
    // PATCH /api/subscription-plans/1
    // =====================================================

    @Put(':id')
     @UseGuards(SanctumGuard)
    update(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,

        @Body()
        dto: UpdateSubscriptionPlanDto,
    ) {
        return this.planService.update(
            id,
            dto,
        );
    }

    // =====================================================
    // DELETE
    // DELETE /api/subscription-plans/1
    // =====================================================

    @Delete(':id')
     @UseGuards(SanctumGuard)
    remove(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {
        return this.planService.remove(id);
    }
}