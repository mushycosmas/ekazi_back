import { Controller  ,Get,Query} from '@nestjs/common';
import { SalaryRangesService } from './salary-ranges.service';

@Controller('salary-ranges')
export class SalaryRangesController {
      constructor(
    private readonly salaryRangesService: SalaryRangesService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.salaryRangesService.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }
}
