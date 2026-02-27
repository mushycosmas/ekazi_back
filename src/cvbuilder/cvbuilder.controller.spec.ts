import { Test, TestingModule } from '@nestjs/testing';
import { CvbuilderController } from './cvbuilder.controller';

describe('CvbuilderController', () => {
  let controller: CvbuilderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvbuilderController],
    }).compile();

    controller = module.get<CvbuilderController>(CvbuilderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
