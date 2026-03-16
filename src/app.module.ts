// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module'; // Import your database module

import { CvbuilderModule } from './cvbuilder/cvbuilder.module';
// ... other imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule, // Use your database module instead of direct TypeOrmModule
 
    CvbuilderModule,
    // ... other modules
  ],

})
export class AppModule {}