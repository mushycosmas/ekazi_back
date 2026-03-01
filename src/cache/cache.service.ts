// src/cache/cache.service.ts
import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Generic get/set methods
  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Pattern-based key deletion (Redis only)
  async delPattern(pattern: string): Promise<void> {
    const client = (this.cacheManager.store as any).getClient();
    const keys = await new Promise<string[]>((resolve, reject) => {
      client.keys(pattern, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
    }
  }

  // Cache keys for different modules
  static readonly keys = {
    APPLICANT_CV: (id: number) => `applicant:cv:${id}`,
    APPLICANT_PROFILE: (id: number) => `applicant:profile:${id}`,
    APPLICANT_POSITIONS: (id: number) => `applicant:positions:${id}`,
    APPLICANT_EDUCATION: (id: number) => `applicant:education:${id}`,
    APPLICANT_SKILLS: (id: number) => `applicant:skills:${id}`,
    APPLICANT_LANGUAGES: (id: number) => `applicant:languages:${id}`,
    APPLICANT_REFEREES: (id: number) => `applicant:referees:${id}`,
    CURRENT_POSITION: (id: number) => `applicant:current-position:${id}`,
    JOB_LISTINGS: (filters: any) => `jobs:list:${JSON.stringify(filters)}`,
    JOB_DETAILS: (id: number) => `jobs:detail:${id}`,
    COMPANY_PROFILE: (id: number) => `company:profile:${id}`,
    COMPANY_JOBS: (id: number) => `company:jobs:${id}`,
    USER_SESSION: (id: number) => `user:session:${id}`,
    STATIC_DATA: (type: string) => `static:${type}`,
  };
}