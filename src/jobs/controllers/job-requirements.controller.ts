import { Controller ,  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,} from '@nestjs/common';
  import { JobRequirementsService } from '../services/job-requirements.service';
  import { CreateJobRequirementDto } from '../dtos/create-job-requirement.dto';
  import { UpdateJobRequirementDto } from '../dtos/update-job-requirement.dto';

@Controller('job-requirements')
export class JobRequirementsController {
      constructor(
    private readonly jobRequirementsService: JobRequirementsService,
  ) {}

  @Post()
  create(
    @Body()
    createDto: CreateJobRequirementDto,
  ) {
    return this.jobRequirementsService.create(
      createDto,
    );
  }

  @Get()
  findAll() {
    return this.jobRequirementsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.jobRequirementsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateDto: UpdateJobRequirementDto,
  ) {
    return this.jobRequirementsService.update(
      id,
      updateDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.jobRequirementsService.remove(id);
  }
}
