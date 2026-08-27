import { Test, TestingModule } from '@nestjs/testing';
import { TermConditionTypesController } from './term-condition-types.controller';

describe('TermConditionTypesController', () => {
  let controller: TermConditionTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermConditionTypesController],
    }).compile();

    controller = module.get<TermConditionTypesController>(TermConditionTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
