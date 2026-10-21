import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantCareerProfileService } from './applicant-career-profile.service';

describe('ApplicantCareerProfileService', () => {
  let service: ApplicantCareerProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantCareerProfileService],
    }).compile();

    service = module.get<ApplicantCareerProfileService>(ApplicantCareerProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
