import { Test, TestingModule } from '@nestjs/testing';
import { AdminSubscriptionController } from './admin-subscription.controller';

describe('AdminSubscriptionController', () => {
  let controller: AdminSubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminSubscriptionController],
    }).compile();

    controller = module.get<AdminSubscriptionController>(AdminSubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
