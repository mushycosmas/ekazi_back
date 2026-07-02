import { Test, TestingModule } from '@nestjs/testing';
import { CompanySizesController } from './company-sizes.controller';

describe('CompanySizesController', () => {
  let controller: CompanySizesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanySizesController],
    }).compile();

    controller = module.get<CompanySizesController>(CompanySizesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
