import { Test, TestingModule } from '@nestjs/testing';
import { JobMetaService } from './job-meta.service';

describe('JobMetaService', () => {
  let service: JobMetaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobMetaService],
    }).compile();

    service = module.get<JobMetaService>(JobMetaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
