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
    Put,
} from '@nestjs/common';

import {
    SubscriptionPlanFeaturesService,
} from './subscription-plan-features.service';

import {
    CreateSubscriptionPlanFeatureDto,
} from './dto/create-subscription-plan-feature.dto';

import {
    UpdateSubscriptionPlanFeatureDto,
} from './dto/update-subscription-plan-feature.dto';

@Controller('subscription-features')
export class SubscriptionPlanFeaturesController {

    constructor(
        private readonly featureService:
            SubscriptionPlanFeaturesService,
    ) { }

    // ============================================================
    // CREATE
    // POST /subscription-plan-features
    // ============================================================

    @Post()
    create(
        @Body()
        dto: CreateSubscriptionPlanFeatureDto,
    ) {
        return this.featureService.create(dto);
    }

    // ============================================================
    // FIND ALL
    // GET /subscription-plan-features
    // ============================================================

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.featureService.findAll(
            Number(page) || 1,
            Number(limit) || 20,
        );
    }
    // ============================================================
    // FIND BY PLAN
    // GET /subscription-plan-features/plan/1
    // ============================================================

 

    // ============================================================
    // FIND ONE
    // GET /subscription-plan-features/1
    // ============================================================

    @Get(':id')
    findOne(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {
        return this.featureService.findOne(id);
    }

    // ============================================================
    // UPDATE
    // PATCH /subscription-plan-features/1
    // ============================================================

    @Put(':id')
    update(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,

        @Body()
        dto: UpdateSubscriptionPlanFeatureDto,
    ) {
        return this.featureService.update(
            id,
            dto,
        );
    }

    // ============================================================
    // DELETE
    // DELETE /subscription-plan-features/1
    // ============================================================

    @Delete(':id')
    remove(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {
        return this.featureService.remove(id);
    }
}