import { Test, TestingModule } from '@nestjs/testing';
import { EmployerDashboardService } from './employer-dashboard.service';

describe('EmployerDashboardService', () => {
  let service: EmployerDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerDashboardService],
    }).compile();

    service = module.get<EmployerDashboardService>(EmployerDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
