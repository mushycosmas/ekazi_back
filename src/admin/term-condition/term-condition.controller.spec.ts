import { Test, TestingModule } from '@nestjs/testing';
import { TermConditionController } from './term-condition.controller';

describe('TermConditionController', () => {
  let controller: TermConditionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermConditionController],
    }).compile();

    controller = module.get<TermConditionController>(TermConditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
