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


import {
    LanguageWritesService
} from './language-writes.service';


import {
    CreateLanguageWriteDto
} from './dto/create-language-write.dto';


import {
    UpdateLanguageWriteDto,
} from './dto/update-language-write.dto';



@Controller('language-writes')
export class LanguageWritesController {


    constructor(
        private readonly service:
            LanguageWritesService,
    ) { }



    // CREATE

    @Post()
    create(
        @Body() dto: CreateLanguageWriteDto,
    ) {

        return this.service.create(dto);

    }

    // ALL

    @Get()
    findAll() {

        return this.service.findAll();

    }

    // ONE

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
        dto: UpdateLanguageWriteDto,

    ) {

        return this.service.update(
            id,
            dto,
        );

    }



    // DELETE

    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {

        return this.service.remove(id);

    }


}