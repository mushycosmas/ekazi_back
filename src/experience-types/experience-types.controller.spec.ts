import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceTypesController } from './experience-types.controller';

describe('ExperienceTypesController', () => {
  let controller: ExperienceTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperienceTypesController],
    }).compile();

    controller = module.get<ExperienceTypesController>(ExperienceTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
