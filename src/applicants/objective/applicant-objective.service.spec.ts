import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantObjectiveService } from './applicant-objective.service';

describe('ApplicantObjectiveService', () => {
  let service: ApplicantObjectiveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantObjectiveService],
    }).compile();

    service = module.get<ApplicantObjectiveService>(ApplicantObjectiveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
