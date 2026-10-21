import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantPositionsService } from './applicant-positions.service';

describe('ApplicantPositionsService', () => {
  let service: ApplicantPositionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantPositionsService],
    }).compile();

    service = module.get<ApplicantPositionsService>(ApplicantPositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
