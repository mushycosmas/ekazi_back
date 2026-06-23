import { Test, TestingModule } from '@nestjs/testing';
import { JobEducationService } from './job-education.service';

describe('JobEducationService', () => {
  let service: JobEducationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobEducationService],
    }).compile();

    service = module.get<JobEducationService>(JobEducationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
