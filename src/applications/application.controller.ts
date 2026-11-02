import {
    Controller,
    Post,
    Get,
    Param,
    ParseIntPipe,
    Body,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    HttpCode,
    HttpStatus,
    BadRequestException,
    Query,
} from '@nestjs/common';

import { ApplicationsService } from './application.service';
import { ApplyJobDto } from './dto/apply-job.dto';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Users } from 'src/entities/users.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/upload/multer.config';
import { CreateNonUserApplicationDto } from './dto/create-non-user-application.dto';
import { unlink } from 'fs/promises';
import * as path from 'path';




@Controller('jobs')

export class ApplicationsController {
    constructor(
        private readonly applicationsService: ApplicationsService,
    ) { }

    @UseGuards(SanctumGuard)
    @Post(':jobId/apply-job')
    applyInternally(
        @CurrentUser() user: Users,
        @Param('jobId', ParseIntPipe) jobId: number,
        @Body() dto: ApplyJobDto,
    ) {
        return this.applicationsService.applyInternal(
            jobId,
            user.id,
            dto,
        );
    }

    private getRelativeFilePath(filePath: string): string {
        return path
            .relative(process.cwd(), filePath)
            .split(path.sep)
            .join('/');
    }

    // POST /api/applications/non-user/email
    @Post('apply-job-by-email')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(
        FilesInterceptor(
            'attachments',
            5,
            multerConfig('non_useremail'),
        ),
    )
    async applyByEmail(
        @Body() dto: CreateNonUserApplicationDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files?.length) {
            throw new BadRequestException(
                'At least one attachment is required.',
            );
        }

        const attachmentFiles = files.map((file) => ({
            ...file,
            path: this.getRelativeFilePath(file.path),
        }));

        return await this.applicationsService.applyNonUserByEmail(
            dto,
            attachmentFiles,
        );
    }
    @UseGuards(SanctumGuard)
    @Get('apply-job-by-email')
    async getApplications(
        @CurrentUser() user: Users,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search = '',
        @Query('job_id') jobId?: number,
    ) {
        const userId = user.id

        return this.applicationsService.getApplications(
            userId,
            page,
            limit,
            search,
            jobId ? Number(jobId) : undefined,
        );
    }


    // @Post(':jobId/apply/email')
    // applyByEmail(
    //     @Param('jobId', ParseIntPipe) jobId: number,
    //     @Req() req: any,
    //     @Body() dto: ApplyJobDto,
    // ) {
    //     return this.applicationsService.applyByEmail(
    //         jobId,
    //         req.user.id,
    //         dto,
    //     );
    // }

    // @Get(':jobId/apply/external')
    // applyExternally(
    //     @Param('jobId', ParseIntPipe) jobId: number,
    // ) {
    //     return this.applicationsService.getExternalApplicationUrl(
    //         jobId,
    //     );
    // }
}