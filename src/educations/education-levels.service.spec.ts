import { Test, TestingModule } from '@nestjs/testing';
import { EducationLevelsService } from './education-levels.service';

describe('EducationLevelsService', () => {
  let service: EducationLevelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EducationLevelsService],
    }).compile();

    service = module.get<EducationLevelsService>(EducationLevelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
