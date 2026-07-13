import { Test, TestingModule } from '@nestjs/testing';
import { LanguageUnderstandsController } from './language-understands.controller';

describe('LanguageUnderstandsController', () => {
  let controller: LanguageUnderstandsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageUnderstandsController],
    }).compile();

    controller = module.get<LanguageUnderstandsController>(LanguageUnderstandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
