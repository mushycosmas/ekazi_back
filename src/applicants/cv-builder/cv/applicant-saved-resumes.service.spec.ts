import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantSavedResumesService } from './applicant-saved-resumes.service';

describe('ApplicantSavedResumesService', () => {
  let service: ApplicantSavedResumesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantSavedResumesService],
    }).compile();

    service = module.get<ApplicantSavedResumesService>(ApplicantSavedResumesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
