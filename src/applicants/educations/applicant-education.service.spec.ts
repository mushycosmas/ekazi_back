import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantEducationService } from './applicant-education.service';

describe('ApplicantEducationService', () => {
  let service: ApplicantEducationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantEducationService],
    }).compile();

    service = module.get<ApplicantEducationService>(ApplicantEducationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
