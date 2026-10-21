import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantObjectiveController } from './applicant-objective.controller';

describe('ApplicantObjectiveController', () => {
  let controller: ApplicantObjectiveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantObjectiveController],
    }).compile();

    controller = module.get<ApplicantObjectiveController>(ApplicantObjectiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
