import { Controller, Get, Query } from '@nestjs/common';
import { SoftwaresService } from './softwares.service';

@Controller('softwares')
export class SoftwaresController {
    constructor(
        private readonly softwaresService: SoftwaresService,
    ) { }

    @Get()
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        return this.softwaresService.findAll(
            Number(page),
            Number(limit),
            search,
        );
    }
}
