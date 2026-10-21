import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantSavedResumesController } from './applicant-saved-resumes.controller';

describe('ApplicantSavedResumesController', () => {
  let controller: ApplicantSavedResumesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantSavedResumesController],
    }).compile();

    controller = module.get<ApplicantSavedResumesController>(ApplicantSavedResumesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
