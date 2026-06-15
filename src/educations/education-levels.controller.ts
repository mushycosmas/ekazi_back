import { Controller, Get, Query } from '@nestjs/common';
import { EducationLevelsService } from './education-levels.service';

@Controller('education-levels')
export class EducationLevelsController {
    constructor(
        private readonly educationLevelsService: EducationLevelsService,
    ) { }

    @Get()
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
        @Query('industryId') industryId?: string,
    ) {
        return this.educationLevelsService.findAll(
            Number(page),
            Number(limit),
            search,
            industryId ? Number(industryId) : undefined,
        );
    }
}
