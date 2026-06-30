import { Test, TestingModule } from '@nestjs/testing';
import { EmployerJobsService } from './employer-jobs.service';

describe('EmployerJobsService', () => {
  let service: EmployerJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerJobsService],
    }).compile();

    service = module.get<EmployerJobsService>(EmployerJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
