import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantDashboardService } from './applicant-dashboard.service';

describe('ApplicantDashboardService', () => {
  let service: ApplicantDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantDashboardService],
    }).compile();

    service = module.get<ApplicantDashboardService>(ApplicantDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
