import { Test, TestingModule } from '@nestjs/testing';
import { LanguageSpeaksController } from './language-speaks.controller';

describe('LanguageSpeaksController', () => {
  let controller: LanguageSpeaksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageSpeaksController],
    }).compile();

    controller = module.get<LanguageSpeaksController>(LanguageSpeaksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
