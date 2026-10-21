import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantJobsService } from './applicant-jobs.service';

describe('ApplicantJobsService', () => {
  let service: ApplicantJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantJobsService],
    }).compile();

    service = module.get<ApplicantJobsService>(ApplicantJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
