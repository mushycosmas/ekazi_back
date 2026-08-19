import { Test, TestingModule } from '@nestjs/testing';
import { AdminApplicantsService } from './admin-applicants.service';

describe('AdminApplicantsService', () => {
  let service: AdminApplicantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminApplicantsService],
    }).compile();

    service = module.get<AdminApplicantsService>(AdminApplicantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
