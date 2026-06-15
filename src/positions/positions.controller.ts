import { Controller, Get, Query} from '@nestjs/common';
import { PositionsService } from './positions.service';

@Controller('positions')
export class PositionsController {
    constructor(
        private readonly positionsService: PositionsService,
    ) { }

    @Get()
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        return this.positionsService.findAll(
            Number(page),
            Number(limit),
            search,
        );
    }
}
