import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionPlanFeaturesController } from './subscription-plan-features.controller';

describe('SubscriptionPlanFeaturesController', () => {
  let controller: SubscriptionPlanFeaturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionPlanFeaturesController],
    }).compile();

    controller = module.get<SubscriptionPlanFeaturesController>(SubscriptionPlanFeaturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
