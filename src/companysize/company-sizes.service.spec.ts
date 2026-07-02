import { Test, TestingModule } from '@nestjs/testing';
import { CompanySizesService } from './company-sizes.service';

describe('CompanySizesService', () => {
  let service: CompanySizesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanySizesService],
    }).compile();

    service = module.get<CompanySizesService>(CompanySizesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
