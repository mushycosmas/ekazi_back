import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantProfilePrivacyController } from './applicant-profile-privacy.controller';

describe('ApplicantProfilePrivacyController', () => {
  let controller: ApplicantProfilePrivacyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantProfilePrivacyController],
    }).compile();

    controller = module.get<ApplicantProfilePrivacyController>(ApplicantProfilePrivacyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
