
import {
    Controller,
    Get,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
    Param,
} from '@nestjs/common';

import { HomepageService } from './homepage.service';

@Controller()
export class HomepageController {
    constructor(
        private readonly homepageService: HomepageService,
    ) { }

    @Get('featured-employers')
    listFeaturedEmployers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe)
        page: number,

        @Query('per_page', new DefaultValuePipe(10), ParseIntPipe)
        perPage: number,
    ) {
        return this.homepageService.listFeaturedEmployers(
            page,
            perPage,
        );
    }

    @Get('featured-employers/:id')
    getEmployerDetails(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.homepageService.employersDetail(id);
    }

    @Get('stats')
    getStats() {
        return this.homepageService.getStats();
    }

    @Get('jobs-by-industry')
    getJobsCountByIndustry() {
        return this.homepageService.getJobsCountByIndustry();
    }
    @Get('jobs-by-region')
    async getJobCountByRegion() {
        return this.homepageService.getJobCountByRegion();
    }
    @Get('jobs-by-category')
    async jobCountByCategory() {
        return this.homepageService.jobCountByCategory();
    }
}
