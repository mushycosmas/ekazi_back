import { Test, TestingModule } from '@nestjs/testing';
import { JobMatchController } from './job-match.controller';

describe('JobMatchController', () => {
  let controller: JobMatchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobMatchController],
    }).compile();

    controller = module.get<JobMatchController>(JobMatchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
