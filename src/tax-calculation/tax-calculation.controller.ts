 import { Body, Controller, Post } from '@nestjs/common';

import { TaxCalculationService } from './tax-calculation.service';
import { CalculateTaxDto } from './dto/calculate-tax.dto';

@Controller('tax-calculation')
export class TaxCalculationController {
  constructor(
    private readonly taxCalculationService: TaxCalculationService,
  ) {}

  // POST /api/tax-calculation
  @Post()
  calculate(@Body() dto: CalculateTaxDto) {
    return this.taxCalculationService.calculate(dto);
  }
}