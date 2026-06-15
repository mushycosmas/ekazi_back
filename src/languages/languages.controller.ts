import { Controller, Get, Query } from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
    constructor(
        private readonly languagesService: LanguagesService,
    ) { }

    @Get()
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        return this.languagesService.findAll(
            Number(page),
            Number(limit),
            search,
        );
    }
}
