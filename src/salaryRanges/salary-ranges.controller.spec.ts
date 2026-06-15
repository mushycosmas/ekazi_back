import { Test, TestingModule } from '@nestjs/testing';
import { SalaryRangesController } from './salary-ranges.controller';

describe('SalaryRangesController', () => {
  let controller: SalaryRangesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalaryRangesController],
    }).compile();

    controller = module.get<SalaryRangesController>(SalaryRangesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
