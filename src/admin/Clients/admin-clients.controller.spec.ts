import { Test, TestingModule } from '@nestjs/testing';
import { AdminClientsController } from './admin-clients.controller';

describe('AdminClientsController', () => {
  let controller: AdminClientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminClientsController],
    }).compile();

    controller = module.get<AdminClientsController>(AdminClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
