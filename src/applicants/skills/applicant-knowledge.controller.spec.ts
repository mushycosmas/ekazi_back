import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantKnowledgeController } from './applicant-knowledge.controller';

describe('ApplicantKnowledgeController', () => {
  let controller: ApplicantKnowledgeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantKnowledgeController],
    }).compile();

    controller = module.get<ApplicantKnowledgeController>(ApplicantKnowledgeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
