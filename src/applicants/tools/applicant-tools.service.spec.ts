import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantToolsService } from './applicant-tools.service';

describe('ApplicantToolsService', () => {
  let service: ApplicantToolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantToolsService],
    }).compile();

    service = module.get<ApplicantToolsService>(ApplicantToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
