import { Test, TestingModule } from '@nestjs/testing';
import { SoftwaresService } from './softwares.service';

describe('SoftwaresService', () => {
  let service: SoftwaresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoftwaresService],
    }).compile();

    service = module.get<SoftwaresService>(SoftwaresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
