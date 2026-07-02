import { Test, TestingModule } from '@nestjs/testing';
import { MetaKeywordsService } from './meta-keywords.service';

describe('MetaKeywordsService', () => {
  let service: MetaKeywordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetaKeywordsService],
    }).compile();

    service = module.get<MetaKeywordsService>(MetaKeywordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
