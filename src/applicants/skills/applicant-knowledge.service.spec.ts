import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantKnowledgeService } from './applicant-knowledge.service';

describe('ApplicantKnowledgeService', () => {
  let service: ApplicantKnowledgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantKnowledgeService],
    }).compile();

    service = module.get<ApplicantKnowledgeService>(ApplicantKnowledgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
