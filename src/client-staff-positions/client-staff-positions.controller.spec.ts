import { Test, TestingModule } from '@nestjs/testing';
import { ClientStaffPositionsController } from './client-staff-positions.controller';

describe('ClientStaffPositionsController', () => {
  let controller: ClientStaffPositionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientStaffPositionsController],
    }).compile();

    controller = module.get<ClientStaffPositionsController>(ClientStaffPositionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
