import { Test, TestingModule } from '@nestjs/testing';
import { EmployerJobsController } from './employer-jobs.controller';

describe('EmployerJobsController', () => {
  let controller: EmployerJobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerJobsController],
    }).compile();

    controller = module.get<EmployerJobsController>(EmployerJobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
