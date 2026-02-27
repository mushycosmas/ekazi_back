import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module'; // Your DB config module
import { TestModule } from 'test/test.module';
import { CvbuilderModule } from './cvbuilder/cvbuilder.module';

@Module({
  imports: [
    DatabaseModule, TestModule, CvbuilderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}