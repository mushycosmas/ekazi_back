import { Controller ,Get } from '@nestjs/common';
import { MalitalStatusesService } from './malital-statuses.service';

@Controller('malital-statuses')
export class MalitalStatusesController {
      constructor(
    private readonly maritalStatusesService: MalitalStatusesService,
  ) {}

  @Get()
  async findAll() {
    return this.maritalStatusesService.findAll();
  }
}
