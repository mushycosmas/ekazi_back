import { Controller  ,Get,Query} from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
      constructor(
    private readonly countriesService: CountriesService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.countriesService.findAll(
      Number(page),
      Number(limit),
      search,
    );
  }
}
