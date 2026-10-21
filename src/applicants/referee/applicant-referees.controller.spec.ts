import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantRefereesController } from './applicant-referees.controller';

describe('ApplicantRefereesController', () => {
  let controller: ApplicantRefereesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantRefereesController],
    }).compile();

    controller = module.get<ApplicantRefereesController>(ApplicantRefereesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
