import { Controller ,Post ,Get,Patch,Delete,Param,Body} from '@nestjs/common';
import { JobMetaService } from '../services/job-meta.service';
import { CreateJobMetaDto } from '../dtos/create-job-meta.dto';
import { UpdateJobMetaDto } from '../dtos/update-job-meta.dto';

@Controller('job-metas')
export class JobMetasController {
        constructor(
        private readonly jobMetasService: JobMetaService,
    ) {}

    @Post()
    create(
        @Body() createDto: CreateJobMetaDto,
    ) {
        return this.jobMetasService.create(createDto);
    }

    @Get()
    findAll() {
        return this.jobMetasService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.jobMetasService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: number,
        @Body() updateDto: UpdateJobMetaDto,
    ) {
        return this.jobMetasService.update(
            +id,
            updateDto,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.jobMetasService.remove(+id);
    }
}
