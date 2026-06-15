import { Controller ,Get,Query} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
    constructor(
        private readonly organizationsService: OrganizationsService,
    ) { }

    @Get()
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        return this.organizationsService.findAll(
            Number(page),
            Number(limit),
            search,
        );
    }
}
