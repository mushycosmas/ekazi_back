import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantCareerProfileController } from './applicant-career-profile.controller';

describe('ApplicantCareerProfileController', () => {
  let controller: ApplicantCareerProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantCareerProfileController],
    }).compile();

    controller = module.get<ApplicantCareerProfileController>(ApplicantCareerProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
