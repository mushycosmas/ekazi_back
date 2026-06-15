import { Controller ,Get,Query} from '@nestjs/common';
import { CollegesService } from './colleges.service';

@Controller('colleges')
export class CollegesController {
    constructor(private readonly collegesService: CollegesService) { }

    @Get()
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
        @Query('regionId') regionId?: string,
    ) {
        return this.collegesService.findAll(
            Number(page),
            Number(limit),
            search,
            regionId ? Number(regionId) : undefined,
        );
    }
}
