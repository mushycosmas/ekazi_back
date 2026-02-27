import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CvbuilderService } from './cvbuilder.service';

@Controller('cvbuilder')
export class CvbuilderController {
  constructor(private readonly cvbuilderService: CvbuilderService) {}

  // Endpoint to get applicant CV
  @Get('applicant/:id')
  async getApplicantCv(@Param('id') id: string) {
    const applicant = await this.cvbuilderService.getApplicantCv(+id);
    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }
    return applicant;
  }
}