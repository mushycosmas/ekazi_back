import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantEmployersController } from './applicant-employers.controller';

describe('ApplicantEmployersController', () => {
  let controller: ApplicantEmployersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantEmployersController],
    }).compile();

    controller = module.get<ApplicantEmployersController>(ApplicantEmployersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
