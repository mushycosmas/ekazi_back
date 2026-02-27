import { Test, TestingModule } from '@nestjs/testing';
import { CvbuilderService } from './cvbuilder.service';

describe('CvbuilderService', () => {
  let service: CvbuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvbuilderService],
    }).compile();

    service = module.get<CvbuilderService>(CvbuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
