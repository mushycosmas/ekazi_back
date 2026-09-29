import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationSummaryService } from './evaluation-summary.service';

describe('EvaluationSummaryService', () => {
  let service: EvaluationSummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluationSummaryService],
    }).compile();

    service = module.get<EvaluationSummaryService>(EvaluationSummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
