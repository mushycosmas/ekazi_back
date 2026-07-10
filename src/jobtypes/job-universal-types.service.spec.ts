import { Test, TestingModule } from '@nestjs/testing';
import { JobUniversalTypesService } from './job-universal-types.service';

describe('JobUniversalTypesService', () => {
  let service: JobUniversalTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobUniversalTypesService],
    }).compile();

    service = module.get<JobUniversalTypesService>(JobUniversalTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
