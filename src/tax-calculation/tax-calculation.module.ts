 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PayrollReduction } from 'src/entities/payroll-reduction.entity';
import { TaxCalculationController } from './tax-calculation.controller';
import { TaxCalculationService } from './tax-calculation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollReduction]),
  ],
  controllers: [TaxCalculationController],
  providers: [TaxCalculationService],
  exports: [TaxCalculationService],
})
export class TaxCalculationModule {}