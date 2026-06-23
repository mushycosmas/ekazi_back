import { Test, TestingModule } from '@nestjs/testing';
import { JobReportTosService } from './job-report-tos.service';

describe('JobReportTosService', () => {
  let service: JobReportTosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobReportTosService],
    }).compile();

    service = module.get<JobReportTosService>(JobReportTosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
