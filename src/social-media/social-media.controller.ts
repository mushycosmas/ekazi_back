 import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
} from '@nestjs/common';

import { SocialMediaService } from './social-media.service';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

@Controller('social-media')
export class SocialMediaController {
    constructor(
        private readonly socialMediaService: SocialMediaService,
    ) {}

    @Post()
    create(@Body() dto: CreateSocialMediaDto) {
        return this.socialMediaService.create(dto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('per_page') perPage?: string,
        @Query('search') search?: string,
    ) {
        return this.socialMediaService.findAll(
            Number(page) || 1,
            Number(perPage) || 10,
            search,
        );
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.socialMediaService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSocialMediaDto,
    ) {
        return this.socialMediaService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.socialMediaService.remove(id);
    }
}