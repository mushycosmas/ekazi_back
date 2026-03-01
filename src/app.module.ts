// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalCacheModule } from './cache/cache.module';
import { CacheService } from './cache/cache.service';
import { CvbuilderModule } from './cvbuilder/cvbuilder.module';
// ... other imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      // ... your database config
    }),
    GlobalCacheModule, // Make cache available globally
    CvbuilderModule,
    // ... other modules
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppModule {}