import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantAddressesService } from './applicant-addresses.service';

describe('ApplicantAddressesService', () => {
  let service: ApplicantAddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantAddressesService],
    }).compile();

    service = module.get<ApplicantAddressesService>(ApplicantAddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
