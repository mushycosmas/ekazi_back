// src/cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD', ''),
        ttl: configService.get('CACHE_TTL', 300), // Default 5 minutes
        max: configService.get('CACHE_MAX_ITEMS', 1000),
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}