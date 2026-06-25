import { Test, TestingModule } from '@nestjs/testing';
import { JobOtherRequirementsController } from './job-other-requirements.controller';

describe('JobOtherRequirementsController', () => {
  let controller: JobOtherRequirementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOtherRequirementsController],
    }).compile();

    controller = module.get<JobOtherRequirementsController>(JobOtherRequirementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
