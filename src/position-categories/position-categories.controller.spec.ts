import { Test, TestingModule } from '@nestjs/testing';
import { PositionCategoriesController } from './position-categories.controller';

describe('PositionCategoriesController', () => {
  let controller: PositionCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionCategoriesController],
    }).compile();

    controller = module.get<PositionCategoriesController>(PositionCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
