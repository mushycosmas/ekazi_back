import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantCulturesController } from './applicant-cultures.controller';

describe('ApplicantCulturesController', () => {
  let controller: ApplicantCulturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantCulturesController],
    }).compile();

    controller = module.get<ApplicantCulturesController>(ApplicantCulturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
