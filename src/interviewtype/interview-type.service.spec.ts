import { Test, TestingModule } from '@nestjs/testing';
import { InterviewTypeService } from './interview-type.service';

describe('InterviewTypeService', () => {
  let service: InterviewTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterviewTypeService],
    }).compile();

    service = module.get<InterviewTypeService>(InterviewTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
