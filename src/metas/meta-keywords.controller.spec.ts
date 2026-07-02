import { Test, TestingModule } from '@nestjs/testing';
import { MetaKeywordsController } from './meta-keywords.controller';

describe('MetaKeywordsController', () => {
  let controller: MetaKeywordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetaKeywordsController],
    }).compile();

    controller = module.get<MetaKeywordsController>(MetaKeywordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
