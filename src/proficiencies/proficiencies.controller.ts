import { Controller  ,Get,Query} from '@nestjs/common';
import { ProficienciesService } from './proficiencies.service';

@Controller('proficiencies')
export class ProficienciesController {
    constructor(
        private readonly proficienciesService: ProficienciesService,
    ) { }

    @Get()
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        return this.proficienciesService.findAll(
            Number(page),
            Number(limit),
            search,
        );
    }
}
