import { Test, TestingModule } from '@nestjs/testing';
import { LanguageWritesService } from './language-writes.service';

describe('LanguageWritesService', () => {
  let service: LanguageWritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LanguageWritesService],
    }).compile();

    service = module.get<LanguageWritesService>(LanguageWritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
