// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module'; // Import your database module
import { CvbuilderModule } from './cvbuilder/cvbuilder.module';
import { EmployerModule } from './employer/employer.module';
import { EmployerController } from './employer/controllers/employer.controller';
import { EmployerUserService } from './employer/services/employer-user.service';
// ... other imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule, // Use your database module instead of direct TypeOrmModule
 
    CvbuilderModule, EmployerModule,
    // ... other modules
  ],
  controllers: [EmployerController, EmployerController],
  providers: [EmployerUserService],

})
export class AppModule {}