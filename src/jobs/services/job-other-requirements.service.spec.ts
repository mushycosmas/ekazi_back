import { Test, TestingModule } from '@nestjs/testing';
import { JobOtherRequirementsService } from './job-other-requirements.service';

describe('JobOtherRequirementsService', () => {
  let service: JobOtherRequirementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobOtherRequirementsService],
    }).compile();

    service = module.get<JobOtherRequirementsService>(JobOtherRequirementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
