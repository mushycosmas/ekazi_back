
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { unlink } from 'fs/promises';
import { mkdirSync} from 'fs';
import { multerConfig } from 'src/common/upload/multer.config';

import { ApplicantEducationService } from './applicant-education.service';
import { CreateApplicantEducationDto } from './dto/create-applicant-education.dto';
import { UpdateApplicantEducationDto } from './dto/update-applicant-education.dto';

import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';

const uploadDirectory = './uploads/education';

mkdirSync(uploadDirectory, { recursive: true });

@Controller('applicant/educations')
@UseGuards(SanctumGuard)
export class ApplicantEducationController {
    constructor(
        private readonly educationService: ApplicantEducationService,
    ) { }

    @Post()
    @UseInterceptors(
        FileInterceptor(
            'attachment',
            multerConfig('education'),
        ),
    )
    async create(
        @CurrentUser() user: Users,
        @Body() dto: CreateApplicantEducationDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (file) {
            dto.attachment = path
                .relative(process.cwd(), file.path)
                .split(path.sep)
                .join('/');
        }
        try {
            const data = await this.educationService.create(
                user.id,
                dto,
            );
            return {
                status: true,
                message: 'Applicant education created successfully.',
                data,
            };
        } catch (error) {
            // Remove only the file uploaded by this request.
            if (file?.path) {
                try {
                    await unlink(file.path);
                } catch (cleanupError) {
                    // Log cleanup failure without replacing the original error.
                    console.error('Failed to remove uploaded certificate:', cleanupError);
                }
            }

            throw error;
        }



    }

    @Get()
    async findAll(@CurrentUser() user: Users) {
        const data = await this.educationService.findAll(user.id);

        return {
            status: true,
            message: 'Applicant education retrieved successfully.',
            data,
        };
    }

    @Get(':id')
    async findOne(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const data = await this.educationService.findOne(user.id, id);

        return {
            status: true,
            message: 'Applicant education retrieved successfully.',
            data,
        };
    }

    @Patch(':id')
    @UseInterceptors(
        FileInterceptor(
            'attachment',
            multerConfig('education'),
        ),
    )
    async update(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateApplicantEducationDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (file) {
            dto.attachment = path
                .relative(process.cwd(), file.path)
                .split(path.sep)
                .join('/');
        }

        const data = await this.educationService.update(
            user.id,
            id,
            dto,
        );

        return {
            status: true,
            message: 'Applicant education updated successfully.',
            data,
        };
    }
    @Delete(':id')
    async remove(
        @CurrentUser() user: Users,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const data = await this.educationService.remove(user.id, id);

        return {
            status: true,
            message: data.message,
            data: { id: data.id },
        };
    }
}
