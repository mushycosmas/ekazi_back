import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantDashboardController } from './applicant-dashboard.controller';

describe('ApplicantDashboardController', () => {
  let controller: ApplicantDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantDashboardController],
    }).compile();

    controller = module.get<ApplicantDashboardController>(ApplicantDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
