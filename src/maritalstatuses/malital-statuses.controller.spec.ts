import { Test, TestingModule } from '@nestjs/testing';
import { MalitalStatusesController } from './malital-statuses.controller';

describe('MalitalStatusesController', () => {
  let controller: MalitalStatusesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MalitalStatusesController],
    }).compile();

    controller = module.get<MalitalStatusesController>(MalitalStatusesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
