import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantProficienciesService } from './applicant-proficiencies.service';

describe('ApplicantProficienciesService', () => {
  let service: ApplicantProficienciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantProficienciesService],
    }).compile();

    service = module.get<ApplicantProficienciesService>(ApplicantProficienciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
