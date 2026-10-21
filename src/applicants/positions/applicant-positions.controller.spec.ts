import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantPositionsController } from './applicant-positions.controller';

describe('ApplicantPositionsController', () => {
  let controller: ApplicantPositionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantPositionsController],
    }).compile();

    controller = module.get<ApplicantPositionsController>(ApplicantPositionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
