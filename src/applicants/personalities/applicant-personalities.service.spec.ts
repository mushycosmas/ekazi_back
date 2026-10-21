import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantPersonalitiesService } from './applicant-personalities.service';

describe('ApplicantPersonalitiesService', () => {
  let service: ApplicantPersonalitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantPersonalitiesService],
    }).compile();

    service = module.get<ApplicantPersonalitiesService>(ApplicantPersonalitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
