import { Test, TestingModule } from '@nestjs/testing';
import { PositionLevelsController } from './position-levels.controller';

describe('PositionLevelsController', () => {
  let controller: PositionLevelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionLevelsController],
    }).compile();

    controller = module.get<PositionLevelsController>(PositionLevelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
