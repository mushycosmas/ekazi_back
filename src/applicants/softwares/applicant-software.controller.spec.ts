import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantSoftwareController } from './applicant-software.controller';

describe('ApplicantSoftwareController', () => {
  let controller: ApplicantSoftwareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantSoftwareController],
    }).compile();

    controller = module.get<ApplicantSoftwareController>(ApplicantSoftwareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
