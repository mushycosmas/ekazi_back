import { Test, TestingModule } from '@nestjs/testing';
import { MalitalStatusesService } from './malital-statuses.service';

describe('MalitalStatusesService', () => {
  let service: MalitalStatusesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MalitalStatusesService],
    }).compile();

    service = module.get<MalitalStatusesService>(MalitalStatusesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
