import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantStagesService } from './applicant-stages.service';

describe('ApplicantStagesService', () => {
  let service: ApplicantStagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantStagesService],
    }).compile();

    service = module.get<ApplicantStagesService>(ApplicantStagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
