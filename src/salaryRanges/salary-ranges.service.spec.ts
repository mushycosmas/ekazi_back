import { Test, TestingModule } from '@nestjs/testing';
import { SalaryRangesService } from './salary-ranges.service';

describe('SalaryRangesService', () => {
  let service: SalaryRangesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalaryRangesService],
    }).compile();

    service = module.get<SalaryRangesService>(SalaryRangesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
