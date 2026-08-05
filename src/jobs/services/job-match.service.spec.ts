import { Test, TestingModule } from '@nestjs/testing';
import { JobMatchService } from './job-match.service';

describe('JobMatchService', () => {
  let service: JobMatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobMatchService],
    }).compile();

    service = module.get<JobMatchService>(JobMatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
