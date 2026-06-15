import { Test, TestingModule } from '@nestjs/testing';
import { SoftwaresController } from './softwares.controller';

describe('SoftwaresController', () => {
  let controller: SoftwaresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoftwaresController],
    }).compile();

    controller = module.get<SoftwaresController>(SoftwaresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
