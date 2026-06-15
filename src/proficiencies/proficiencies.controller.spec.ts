import { Test, TestingModule } from '@nestjs/testing';
import { ProficienciesController } from './proficiencies.controller';

describe('ProficienciesController', () => {
  let controller: ProficienciesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProficienciesController],
    }).compile();

    controller = module.get<ProficienciesController>(ProficienciesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
