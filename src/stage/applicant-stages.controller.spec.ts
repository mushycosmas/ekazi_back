import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantStagesController } from './applicant-stages.controller';

describe('ApplicantStagesController', () => {
  let controller: ApplicantStagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantStagesController],
    }).compile();

    controller = module.get<ApplicantStagesController>(ApplicantStagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
