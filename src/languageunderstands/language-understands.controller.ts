import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';


import {LanguageUnderstandsService,} from './language-understands.service';
import {CreateLanguageUnderstandDto,} from './dto/create-language-understand.dto';
import { UpdateLanguageUnderstandDto,} from './dto/update-language-understand.dto';

@Controller('language-understands')
export class LanguageUnderstandsController {
    constructor(
        private readonly service:
            LanguageUnderstandsService,
    ) { }

    // CREATE
    @Post()
    create(
        @Body()
        dto: CreateLanguageUnderstandDto,
    ) {

        return this.service.create(dto);

    }

    // LIST
    @Get()
    findAll() {

        return this.service.findAll();

    }

    // DETAIL
    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {

        return this.service.findOne(id);

    }

    // UPDATE
    @Put(':id')
    update(
        @Param('id', ParseIntPipe)
        id: number,
        @Body()
        dto: UpdateLanguageUnderstandDto,) {
        return this.service.update(
            id,
            dto,
        );

    }

    // DELETE SOFT DELETE
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {

        return this.service.remove(id);

    }

}