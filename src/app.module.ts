import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { CvBuilderModule } from './cv-builder/cv-builder.module';

@Module({
  imports: [
    PrismaModule, UserModule, CvBuilderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
