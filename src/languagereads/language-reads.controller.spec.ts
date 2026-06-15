import { Test, TestingModule } from '@nestjs/testing';
import { LanguageReadsController } from './language-reads.controller';

describe('LanguageReadsController', () => {
  let controller: LanguageReadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageReadsController],
    }).compile();

    controller = module.get<LanguageReadsController>(LanguageReadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
