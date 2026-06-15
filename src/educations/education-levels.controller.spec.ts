import { Test, TestingModule } from '@nestjs/testing';
import { EducationLevelsController } from './education-levels.controller';

describe('EducationLevelsController', () => {
  let controller: EducationLevelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationLevelsController],
    }).compile();

    controller = module.get<EducationLevelsController>(EducationLevelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
