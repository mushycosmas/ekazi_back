import { Test, TestingModule } from '@nestjs/testing';
import { CvBuilderService } from './cv-builder.service';

describe('CvBuilderService', () => {
  let service: CvBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvBuilderService],
    }).compile();

    service = module.get<CvBuilderService>(CvBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
