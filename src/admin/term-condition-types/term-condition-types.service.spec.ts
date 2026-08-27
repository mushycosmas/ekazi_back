import { Test, TestingModule } from '@nestjs/testing';
import { TermConditionTypesService } from './term-condition-types.service';

describe('TermConditionTypesService', () => {
  let service: TermConditionTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TermConditionTypesService],
    }).compile();

    service = module.get<TermConditionTypesService>(TermConditionTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
