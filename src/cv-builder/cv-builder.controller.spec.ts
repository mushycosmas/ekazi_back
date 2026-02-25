import { Test, TestingModule } from '@nestjs/testing';
import { CvBuilderController } from './cv-builder.controller';

describe('CvBuilderController', () => {
  let controller: CvBuilderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvBuilderController],
    }).compile();

    controller = module.get<CvBuilderController>(CvBuilderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
