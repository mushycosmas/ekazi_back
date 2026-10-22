import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceTypesService } from './experience-types.service';

describe('ExperienceTypesService', () => {
  let service: ExperienceTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExperienceTypesService],
    }).compile();

    service = module.get<ExperienceTypesService>(ExperienceTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
