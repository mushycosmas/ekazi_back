import { Test, TestingModule } from '@nestjs/testing';
import { AdminSubscriptionService } from './admin-subscription.service';

describe('AdminSubscriptionService', () => {
  let service: AdminSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminSubscriptionService],
    }).compile();

    service = module.get<AdminSubscriptionService>(AdminSubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
