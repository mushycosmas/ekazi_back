import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantJobsController } from './applicant-jobs.controller';

describe('ApplicantJobsController', () => {
  let controller: ApplicantJobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantJobsController],
    }).compile();

    controller = module.get<ApplicantJobsController>(ApplicantJobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
