// src/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // Get cache metadata from handler
    const cacheKey = this.reflector.get<string>('cache_key', context.getHandler());
    const cacheTTL = this.reflector.get<number>('cache_ttl', context.getHandler()) || 300;

    // Only cache GET requests
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Generate cache key
    const key = cacheKey || `${request.url}-${JSON.stringify(request.query)}`;

    // Try to get from cache
    const cachedResponse = await this.cacheManager.get(key);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // If not in cache, proceed and cache the response
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheManager.set(key, response, cacheTTL);
      }),
    );
  }
}