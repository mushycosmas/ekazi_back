import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Applicants } from 'src/entities/applicants/applicants.entity';
import { TestService } from './test.service';
import { TestController } from './test.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Applicants])],
  providers: [TestService],
  controllers: [TestController],
})
export class TestModule {}