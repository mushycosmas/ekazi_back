import { Test, TestingModule } from '@nestjs/testing';
import { JobRequirementsController } from './job-requirements.controller';

describe('JobRequirementsController', () => {
  let controller: JobRequirementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobRequirementsController],
    }).compile();

    controller = module.get<JobRequirementsController>(JobRequirementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
