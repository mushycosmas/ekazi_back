import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantPersonalitiesController } from './applicant-personalities.controller';

describe('ApplicantPersonalitiesController', () => {
  let controller: ApplicantPersonalitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantPersonalitiesController],
    }).compile();

    controller = module.get<ApplicantPersonalitiesController>(ApplicantPersonalitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
