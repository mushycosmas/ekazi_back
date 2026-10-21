import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantCulturesService } from './applicant-cultures.service';

describe('ApplicantCulturesService', () => {
  let service: ApplicantCulturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantCulturesService],
    }).compile();

    service = module.get<ApplicantCulturesService>(ApplicantCulturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
