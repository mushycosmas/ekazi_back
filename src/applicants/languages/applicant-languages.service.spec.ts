import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantLanguagesService } from './applicant-languages.service';

describe('ApplicantLanguagesService', () => {
  let service: ApplicantLanguagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantLanguagesService],
    }).compile();

    service = module.get<ApplicantLanguagesService>(ApplicantLanguagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
