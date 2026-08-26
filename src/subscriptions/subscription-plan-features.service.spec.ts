import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionPlanFeaturesService } from './subscription-plan-features.service';

describe('SubscriptionPlanFeaturesService', () => {
  let service: SubscriptionPlanFeaturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionPlanFeaturesService],
    }).compile();

    service = module.get<SubscriptionPlanFeaturesService>(SubscriptionPlanFeaturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
