import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantTrainingsService } from './applicant-trainings.service';

describe('ApplicantTrainingsService', () => {
  let service: ApplicantTrainingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantTrainingsService],
    }).compile();

    service = module.get<ApplicantTrainingsService>(ApplicantTrainingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
