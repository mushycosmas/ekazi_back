
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import * as path from 'path';

import { ApplicantAddressesService } from './applicant-addresses.service';
import { CreateApplicantAddressDto } from './dto/create-applicant-address.dto';
import { UpdateApplicantAddressDto } from './dto/update-applicant-address.dto';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';
import { multerConfig } from 'src/common/upload/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { promises as fs } from 'fs';






@Controller('applicant/addresses')
@UseGuards(SanctumGuard)
export class ApplicantAddressesController {
    constructor(
        private readonly applicantAddressesService: ApplicantAddressesService,
    ) { }
    @Post()
    create(
        @CurrentUser() user: Users,
        @Body() dto: CreateApplicantAddressDto,
    ) {
        console.log('========== CREATE APPLICANT ADDRESS ==========');
        console.log('Authenticated user ID:', user?.id);
        console.log('Request body:', JSON.stringify(dto, null, 2));
        console.log('region_id:', dto?.region_id);
        console.log('sub_location:', dto?.sub_location);
        console.log('postal:', dto?.postal);
        console.log('==============================================');

        return this.applicantAddressesService.create(user.id, dto);
    }

    @Get()
    findAll(@CurrentUser() user: Users) {
        return this.applicantAddressesService.findAll(user.id);
    }
      @Patch('picture')
    @UseInterceptors(
        FileInterceptor('picture', multerConfig('picture')),
    )
    async updatePicture(
         @CurrentUser() user: Users,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException(
                'Please upload an image using the picture field',
            );
        }

        const picture = path
            .relative(process.cwd(), file.path)
            .split(path.sep)
            .join('/');

        try {
            return await this.applicantAddressesService.updatePicture(
                user.id,
                picture,
            );
        } catch (error) {
            await this.removeUploadedFile(file);
            throw error;
        }
    }

    @Patch('background-picture')
    @UseInterceptors(
        FileInterceptor(
            'background_picture',
            multerConfig('background'),
        ),
    )
    async updateBackgroundPicture(
          @CurrentUser() user: Users,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException(
                'Please upload an image using the background_picture field',
            );
        }

        const backgroundPicture = path
            .relative(process.cwd(), file.path)
            .split(path.sep)
            .join('/');

        try {
            return await this.applicantAddressesService
                .updateBackgroundPicture(
                    user.id,
                    backgroundPicture,
                );
        } catch (error) {
            await this.removeUploadedFile(file);
            throw error;
        }
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.applicantAddressesService.findOne(user.id, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateApplicantAddressDto,
    ) {
        return this.applicantAddressesService.update(
            user.id,
            id,
            dto,
        );
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.applicantAddressesService.remove(user.id, id);
    }
    private async removeUploadedFile(
        file?: Express.Multer.File,
    ) {
        if (!file?.path) return;

        try {
            await fs.unlink(file.path);
        } catch {
            // Preserve the original request error.
        }
    }

  
}
