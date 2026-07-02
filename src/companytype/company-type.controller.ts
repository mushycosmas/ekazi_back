import { Controller ,Post ,Get ,Param, Put, Body, Delete} from '@nestjs/common';
import { CreateClientTypeDto } from './dto/create-client-type.dto';
import { UpdateClientTypeDto } from './dto/update-client-type.dto';
import { CompanyTypeService } from './company-type.service';

@Controller('company-type')
export class CompanyTypeController {
      constructor(private readonly service:CompanyTypeService) {}

  @Post()
  create(@Body() dto: CreateClientTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateClientTypeDto,
  ) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
