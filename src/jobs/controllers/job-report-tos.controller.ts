import { Controller ,Get,Post,Delete,Patch,Body,Param } from '@nestjs/common';
import { JobReportTosService } from '../services/job-report-tos.service';
import { CreateJobReportTosDto } from '../dtos/create-job-report-tos.dto';
import { UpdateJobReportTosDto } from '../dtos/update-job-report-tos.dto';

@Controller('job-report-tos')
export class JobReportTosController {
    constructor(private readonly service: JobReportTosService) { }

    @Post()
    create(@Body() dto: CreateJobReportTosDto) {
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
    update(@Param('id') id: number, @Body() dto: UpdateJobReportTosDto) {
        return this.service.update(Number(id), dto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.service.remove(Number(id));
    }
}
