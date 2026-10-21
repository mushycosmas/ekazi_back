import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantTrainingsController } from './applicant-trainings.controller';

describe('ApplicantTrainingsController', () => {
  let controller: ApplicantTrainingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantTrainingsController],
    }).compile();

    controller = module.get<ApplicantTrainingsController>(ApplicantTrainingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
