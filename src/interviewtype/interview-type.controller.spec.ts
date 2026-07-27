import { Test, TestingModule } from '@nestjs/testing';
import { InterviewTypeController } from './interview-type.controller';

describe('InterviewTypeController', () => {
  let controller: InterviewTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewTypeController],
    }).compile();

    controller = module.get<InterviewTypeController>(InterviewTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
