import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySize } from 'src/entities/company-size.entity';
import { CompanySizesController } from './company-sizes.controller';
import { CompanySizesService } from './company-sizes.service';

@Module({
    imports: [TypeOrmModule.forFeature([CompanySize])],
    controllers: [CompanySizesController],
    providers: [CompanySizesService],
})
export class CompanySizesModule { }
