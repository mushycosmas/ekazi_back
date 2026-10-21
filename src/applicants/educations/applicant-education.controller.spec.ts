import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantEducationController } from './applicant-education.controller';

describe('ApplicantEducationController', () => {
  let controller: ApplicantEducationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantEducationController],
    }).compile();

    controller = module.get<ApplicantEducationController>(ApplicantEducationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
