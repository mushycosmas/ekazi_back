import { Test, TestingModule } from '@nestjs/testing';
import { IndustriesController } from './industries.controller';

describe('IndustriesController', () => {
  let controller: IndustriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndustriesController],
    }).compile();

    controller = module.get<IndustriesController>(IndustriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
