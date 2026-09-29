import { Test, TestingModule } from '@nestjs/testing';
import { BenefitController } from './benefit.controller';

describe('BenefitController', () => {
  let controller: BenefitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BenefitController],
    }).compile();

    controller = module.get<BenefitController>(BenefitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
