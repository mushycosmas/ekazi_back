import { Test, TestingModule } from '@nestjs/testing';
import { InterviewActionService } from './interview-action.service';

describe('InterviewActionService', () => {
  let service: InterviewActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterviewActionService],
    }).compile();

    service = module.get<InterviewActionService>(InterviewActionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
