import { Test, TestingModule } from '@nestjs/testing';
import { JobRequirementsService } from './job-requirements.service';

describe('JobRequirementsService', () => {
  let service: JobRequirementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobRequirementsService],
    }).compile();

    service = module.get<JobRequirementsService>(JobRequirementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
