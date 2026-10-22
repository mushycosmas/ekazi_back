import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantEmployersService } from './applicant-employers.service';

describe('ApplicantEmployersService', () => {
  let service: ApplicantEmployersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantEmployersService],
    }).compile();

    service = module.get<ApplicantEmployersService>(ApplicantEmployersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
