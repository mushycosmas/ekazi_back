import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesReadsService } from './languages-reads.service';

describe('LanguagesReadsService', () => {
  let service: LanguagesReadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LanguagesReadsService],
    }).compile();

    service = module.get<LanguagesReadsService>(LanguagesReadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
