import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantIndustryTagsController } from './applicant-industry-tags.controller';

describe('ApplicantIndustryTagsController', () => {
  let controller: ApplicantIndustryTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantIndustryTagsController],
    }).compile();

    controller = module.get<ApplicantIndustryTagsController>(ApplicantIndustryTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
