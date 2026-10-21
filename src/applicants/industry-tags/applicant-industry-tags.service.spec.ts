import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantIndustryTagsService } from './applicant-industry-tags.service';

describe('ApplicantIndustryTagsService', () => {
  let service: ApplicantIndustryTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantIndustryTagsService],
    }).compile();

    service = module.get<ApplicantIndustryTagsService>(ApplicantIndustryTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
