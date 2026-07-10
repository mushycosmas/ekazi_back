import {
    Controller,
    Post,
    Body,
    Req,
    UseGuards
} from '@nestjs/common';
import { ApplicantStagesService } from './applicant-stages.service';
import { BulkShortListDto } from './dto/bulk-shortlist.dto';
import { Users } from 'src/entities/users.entity';
import { SanctumGuard } from 'src/auth/guards/sanctum.guard';

@Controller('applicant-stages')
export class ApplicantStagesController {
    constructor(
        private readonly applicantStagesService:
            ApplicantStagesService
    ) { }

    @Post('bulk-shortlist')
    @UseGuards(SanctumGuard)
    async bulkShortList(
        @Body() dto: BulkShortListDto,
        @Req() req: any

    ) {
        const user: Users = req.user;
        await this.applicantStagesService.bulkShortList(
            dto,
            user
        );
        return {
            success: true,
            message:
                'Applicants processed successfully'
        };
    }
}