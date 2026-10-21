import { Test, TestingModule } from '@nestjs/testing';
import { TaxCalculationService } from './tax-calculation.service';

describe('TaxCalculationService', () => {
  let service: TaxCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxCalculationService],
    }).compile();

    service = module.get<TaxCalculationService>(TaxCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
