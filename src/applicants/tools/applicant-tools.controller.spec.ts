import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantToolsController } from './applicant-tools.controller';

describe('ApplicantToolsController', () => {
  let controller: ApplicantToolsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantToolsController],
    }).compile();

    controller = module.get<ApplicantToolsController>(ApplicantToolsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
