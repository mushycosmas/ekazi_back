import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantLanguagesController } from './applicant-languages.controller';

describe('ApplicantLanguagesController', () => {
  let controller: ApplicantLanguagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantLanguagesController],
    }).compile();

    controller = module.get<ApplicantLanguagesController>(ApplicantLanguagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
