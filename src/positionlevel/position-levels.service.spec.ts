import { Test, TestingModule } from '@nestjs/testing';
import { PositionLevelsService } from './position-levels.service';

describe('PositionLevelsService', () => {
  let service: PositionLevelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PositionLevelsService],
    }).compile();

    service = module.get<PositionLevelsService>(PositionLevelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
