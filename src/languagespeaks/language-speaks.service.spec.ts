import { Test, TestingModule } from '@nestjs/testing';
import { LanguageSpeaksService } from './language-speaks.service';

describe('LanguageSpeaksService', () => {
  let service: LanguageSpeaksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LanguageSpeaksService],
    }).compile();

    service = module.get<LanguageSpeaksService>(LanguageSpeaksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
