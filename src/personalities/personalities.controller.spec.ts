import { Test, TestingModule } from '@nestjs/testing';
import { PersonalitiesController } from './personalities.controller';

describe('PersonalitiesController', () => {
  let controller: PersonalitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalitiesController],
    }).compile();

    controller = module.get<PersonalitiesController>(PersonalitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
