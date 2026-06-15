import { Controller, Query, Get } from '@nestjs/common';
import { IndustriesService } from './industries.service';

@Controller('industries')
export class IndustriesController {
    constructor(
        private readonly industriesService: IndustriesService,
    ) { }

    @Get()
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        return this.industriesService.findAll(
            Number(page),
            Number(limit),
            search,
        );
    }
}
