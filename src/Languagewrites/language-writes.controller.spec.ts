import { Test, TestingModule } from '@nestjs/testing';
import { LanguageWritesController } from './language-writes.controller';

describe('LanguageWritesController', () => {
  let controller: LanguageWritesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageWritesController],
    }).compile();

    controller = module.get<LanguageWritesController>(LanguageWritesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
