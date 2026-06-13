import { Test, TestingModule } from '@nestjs/testing';
import { EmployerJobController } from './employer-job.controller';

describe('EmployerJobController', () => {
  let controller: EmployerJobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerJobController],
    }).compile();

    controller = module.get<EmployerJobController>(EmployerJobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
