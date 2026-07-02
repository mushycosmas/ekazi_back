import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyTypeService } from './company-type.service';
import { CompanyTypeController } from './company-type.controller';
import { ClientType } from 'src/client/entities/client-types.entity';


@Module({
      imports: [TypeOrmModule.forFeature([ClientType])],
  controllers: [CompanyTypeController],
  providers: [CompanyTypeService],
  exports: [CompanyTypeService],
})
export class CompanyTypeModule {}
