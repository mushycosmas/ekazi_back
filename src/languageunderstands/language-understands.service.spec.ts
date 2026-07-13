import { Test, TestingModule } from '@nestjs/testing';
import { LanguageUnderstandsService } from './language-understands.service';

describe('LanguageUnderstandsService', () => {
  let service: LanguageUnderstandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LanguageUnderstandsService],
    }).compile();

    service = module.get<LanguageUnderstandsService>(LanguageUnderstandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
