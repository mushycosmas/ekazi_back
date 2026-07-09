import { Test, TestingModule } from '@nestjs/testing';
import { JobSettingsService } from './job-settings.service';

describe('JobSettingsService', () => {
  let service: JobSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobSettingsService],
    }).compile();

    service = module.get<JobSettingsService>(JobSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
