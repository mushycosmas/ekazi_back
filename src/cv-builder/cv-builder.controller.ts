import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CvBuilderService } from './cv-builder.service';

@Controller('cv-builder')
export class CvBuilderController {
  constructor(private readonly cvService: CvBuilderService) {}

  @Get(':id')
  async getCv(@Param('id', ParseIntPipe) id: number) {
    const data = await this.cvService.getApplicantCv(id);
    return { data };
  }
}