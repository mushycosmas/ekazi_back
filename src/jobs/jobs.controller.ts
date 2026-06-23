import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { CompleteJobProfileDto } from './dtos/complete-job-profile.dto';


@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    console.log('BODY:', createJobDto);
    return this.jobsService.create(createJobDto);
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(+id, updateJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(+id);
  }
  @Get(':id/complete-profile')
  getCompleteProfile(@Param('id') id: number) {
    return this.jobsService.getCompleteProfile(Number(id));
  }

  @Patch(':id/complete-profile')
  updateCompleteProfile(
    @Param('id') id: number,
    @Body() dto: CompleteJobProfileDto,
  ) {
    return this.jobsService.completeProfile(
      Number(id),
      dto,
    );
  }

  @Delete(':id/complete-profile')
  deleteCompleteProfile(
    @Param('id') id: number,
  ) {
    return this.jobsService.deleteCompleteProfile(
      Number(id),
    );
  }
}
