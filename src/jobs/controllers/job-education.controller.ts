import { Controller ,Post,Get,Param,Body,Patch,Delete } from '@nestjs/common';
import { JobEducationService } from '../services/job-education.service';
import { CreateJobEducationDto } from '../dtos/create-job-education.dto';
import { UpdateJobEducationDto } from '../dtos/update-job-education.dto';

@Controller('job-education')
export class JobEducationController {
      constructor(private readonly service: JobEducationService) {}

  @Post()
  create(@Body() dto: CreateJobEducationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateJobEducationDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(Number(id));
  }
}
