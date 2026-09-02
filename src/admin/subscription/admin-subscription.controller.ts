import { Controller, Get, Query } from '@nestjs/common';
import { AdminSubscriptionService } from './admin-subscription.service';

@Controller('admin-subscription')

export class AdminSubscriptionController {

    constructor(
        private readonly adminSubscriptionService: AdminSubscriptionService,
    ) {}
        // ============================================================
    // GET ALL SUBSCRIPTIONS
    // ============================================================

 @Get('subscriptions')
async getAllSubscriptions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
) {
    return this.adminSubscriptionService.getAllSubscriptions(
        page,
        limit,
        search,
    );
}
}
