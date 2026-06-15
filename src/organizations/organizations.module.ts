import { Module } from '@nestjs/common';
import { Organizations } from 'src/entities/organizations.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
      imports: [TypeOrmModule.forFeature([Organizations])],
        controllers: [OrganizationsController],
        providers: [OrganizationsService],
})
export class OrganizationsModule {}
