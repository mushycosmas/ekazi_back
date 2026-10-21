import { Test, TestingModule } from '@nestjs/testing';
import { TaxCalculationController } from './tax-calculation.controller';

describe('TaxCalculationController', () => {
  let controller: TaxCalculationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxCalculationController],
    }).compile();

    controller = module.get<TaxCalculationController>(TaxCalculationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
