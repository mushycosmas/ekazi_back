import { Test, TestingModule } from '@nestjs/testing';
import { ProficienciesService } from './proficiencies.service';

describe('ProficienciesService', () => {
  let service: ProficienciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProficienciesService],
    }).compile();

    service = module.get<ProficienciesService>(ProficienciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
