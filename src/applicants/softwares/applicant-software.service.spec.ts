import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantSoftwareService } from './applicant-software.service';

describe('ApplicantSoftwareService', () => {
  let service: ApplicantSoftwareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantSoftwareService],
    }).compile();

    service = module.get<ApplicantSoftwareService>(ApplicantSoftwareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
