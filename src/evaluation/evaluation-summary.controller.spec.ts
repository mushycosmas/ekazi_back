import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationSummaryController } from './evaluation-summary.controller';

describe('EvaluationSummaryController', () => {
  let controller: EvaluationSummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationSummaryController],
    }).compile();

    controller = module.get<EvaluationSummaryController>(EvaluationSummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
