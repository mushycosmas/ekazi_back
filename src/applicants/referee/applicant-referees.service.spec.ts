import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantRefereesService } from './applicant-referees.service';

describe('ApplicantRefereesService', () => {
  let service: ApplicantRefereesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantRefereesService],
    }).compile();

    service = module.get<ApplicantRefereesService>(ApplicantRefereesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
