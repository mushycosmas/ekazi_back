import { Test, TestingModule } from '@nestjs/testing';
import { AdminApplicantsController } from './admin-applicants.controller';

describe('AdminApplicantsController', () => {
  let controller: AdminApplicantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminApplicantsController],
    }).compile();

    controller = module.get<AdminApplicantsController>(AdminApplicantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
