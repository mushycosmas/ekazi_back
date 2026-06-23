import { Controller ,Post,Get,Patch,Delete,Param,Body} from '@nestjs/common';
import { JobLanguagesService } from '../services/job-languages.service';
import { UpdateJobLanguagesDto } from '../dtos/update-job-languages.dto';
import { CreateJobLanguagesDto } from '../dtos/create-job-languages.dto';

@Controller('job-languages')
export class JobLanguagesController {
    constructor(private readonly service: JobLanguagesService) { }

    @Post()
    create(@Body() dto: CreateJobLanguagesDto) {
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
    update(@Param('id') id: number, @Body() dto: UpdateJobLanguagesDto) {
        return this.service.update(Number(id), dto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.service.remove(Number(id));
    }
}
