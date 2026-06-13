import { Test, TestingModule } from '@nestjs/testing';
import { LaravelAuthService } from './laravel-auth.service';

describe('LaravelAuthService', () => {
  let service: LaravelAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LaravelAuthService],
    }).compile();

    service = module.get<LaravelAuthService>(LaravelAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
