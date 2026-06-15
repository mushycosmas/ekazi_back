import { Module } from '@nestjs/common';
import { SalaryRanges } from 'src/entities/salary-ranges.entity';
import { SalaryRangesController } from './salary-ranges.controller';
import { SalaryRangesService } from './salary-ranges.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([SalaryRanges])],
    controllers: [SalaryRangesController],
    providers: [SalaryRangesService],
})
export class SalaryRangesModule { }
