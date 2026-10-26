import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantProfilePrivacyService } from './applicant-profile-privacy.service';

describe('ApplicantProfilePrivacyService', () => {
  let service: ApplicantProfilePrivacyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantProfilePrivacyService],
    }).compile();

    service = module.get<ApplicantProfilePrivacyService>(ApplicantProfilePrivacyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
