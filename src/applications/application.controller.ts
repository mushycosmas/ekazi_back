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
    @Post(':jobId/apply/internal')
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

    private async removeUploadedFiles(
        files: Express.Multer.File[] = [],
    ): Promise<void> {
        await Promise.all(
            files.map(async (file) => {
                if (!file?.path) return;

                try {
                    await unlink(file.path);
                } catch (error) {
                    console.error(
                        'Failed to clean up uploaded application file:',
                        error,
                    );
                }
            }),
        );
    }

    // POST /api/applications/non-user/email
    @Post('non-user/email')
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

        // Store project-relative paths, consistent with BlogPostsController.
        const attachmentFiles = files.map((file) => ({
            ...file,
            path: this.getRelativeFilePath(file.path),
        }));

        try {
            return await this.applicationsService.applyNonUserByEmail(
                dto,
                attachmentFiles,
            );
        } catch (error) {
            await this.removeUploadedFiles(files);
            throw error;
        }
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