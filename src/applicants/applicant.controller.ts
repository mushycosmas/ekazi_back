import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApplicantService } from './applicant.service';

@Controller('applicant')
export class ApplicantController {
    constructor(private readonly applicantService: ApplicantService) { }

    @Get('applicant/:id')
    async getApplicantCv(@Param('id') id: string) {
        const applicant = await this.applicantService.getApplicant(+id);
        if (!applicant) {
            throw new NotFoundException(
                {
                    success: false,
                    message: 'Applicant not found'
                }

            );
        }
        return applicant;
    }
}
