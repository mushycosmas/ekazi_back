// src/decorators/cache.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CacheKey = (key: string) => SetMetadata('cache_key', key);
export const CacheTTL = (ttl: number) => SetMetadata('cache_ttl', ttl);
export const SkipCache = () => SetMetadata('skip_cache', true);