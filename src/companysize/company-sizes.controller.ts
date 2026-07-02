import { Controller  ,ParseIntPipe ,Post,Get,Param,Body , Put, Delete} from '@nestjs/common';
import { CompanySizesService } from './company-sizes.service';
import { CompanySize } from 'src/entities/company-size.entity';
import { CreateCompanySizeDto } from './dto/create-company-size.dto';
import { UpdateCompanySizeDto } from './dto/update-company-size.dto';

@Controller('company-sizes')
export class CompanySizesController {
      constructor(private readonly service: CompanySizesService) {}

    @Post()
    create(@Body() dto: CreateCompanySizeDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCompanySizeDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
