import { Test, TestingModule } from '@nestjs/testing';
import { JobLanguagesService } from './job-languages.service';

describe('JobLanguagesService', () => {
  let service: JobLanguagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobLanguagesService],
    }).compile();

    service = module.get<JobLanguagesService>(JobLanguagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
