import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantProficienciesController } from './applicant-proficiencies.controller';

describe('ApplicantProficienciesController', () => {
  let controller: ApplicantProficienciesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantProficienciesController],
    }).compile();

    controller = module.get<ApplicantProficienciesController>(ApplicantProficienciesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
