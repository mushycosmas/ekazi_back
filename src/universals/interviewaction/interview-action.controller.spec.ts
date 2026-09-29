import { Test, TestingModule } from '@nestjs/testing';
import { InterviewActionController } from './interview-action.controller';

describe('InterviewActionController', () => {
  let controller: InterviewActionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewActionController],
    }).compile();

    controller = module.get<InterviewActionController>(InterviewActionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
