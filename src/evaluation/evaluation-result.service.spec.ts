import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationResultService } from './evaluation-result.service';

describe('EvaluationResultService', () => {
  let service: EvaluationResultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluationResultService],
    }).compile();

    service = module.get<EvaluationResultService>(EvaluationResultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
