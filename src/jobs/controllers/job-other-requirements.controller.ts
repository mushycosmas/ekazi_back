import { Controller ,  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe, } from '@nestjs/common';
import { JobOtherRequirementsService } from '../services/job-other-requirements.service';
import { CreateJobOtherRequirementDto } from '../dtos/create-job-other-requirement.dto';
import { UpdateJobOtherRequirementDto } from '../dtos/update-job-other-requirement.dto';

@Controller('job-other-requirements')
export class JobOtherRequirementsController {
      constructor(
    private readonly service: JobOtherRequirementsService,
  ) {}

  // @Post()
  // create(
  //   @Body()
  //   createDto: CreateJobOtherRequirementDto,
  // ) {
  //   return this.service.create(createDto);
  // }

  // @Get()
  // findAll() {
  //   return this.service.findAll();
  // }

  // @Get(':id')
  // findOne(
  //   @Param('id', ParseIntPipe)
  //   id: number,
  // ) {
  //   return this.service.findOne(id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id', ParseIntPipe)
  //   id: number,
  //   @Body()
  //   updateDto: UpdateJobOtherRequirementDto,
  // ) {
  //   return this.service.update(id, updateDto);
  // }

  // @Delete(':id')
  // remove(
  //   @Param('id', ParseIntPipe)
  //   id: number,
  // ) {
  //   return this.service.remove(id);
  // }
}
