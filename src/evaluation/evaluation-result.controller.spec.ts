import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationResultController } from './evaluation-result.controller';

describe('EvaluationResultController', () => {
  let controller: EvaluationResultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationResultController],
    }).compile();

    controller = module.get<EvaluationResultController>(EvaluationResultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
